-- Исправления ядра по ревью:
-- 1. QR-код и кассир ссылаются только на точку своей организации.
-- 2. Главную точку нельзя разжаловать или выключить; владелец меняет у точки только описательные поля.
-- 3. Гонка при одинаковом БИН/ИИН отдаёт tax_id_taken, а не сырую ошибку уникальности.
-- 4. Execute на вспомогательные функции закрыт для public и anon.

-- ============================================================================
-- 1. Точка той же организации: составной внешний ключ (point_id, organization_id)
-- ============================================================================

alter table public.points
  add constraint points_id_organization_id_key unique (id, organization_id);

alter table public.qr_codes
  drop constraint qr_codes_point_id_fkey,
  add constraint qr_codes_point_same_org_fkey
    foreign key (point_id, organization_id)
    references public.points (id, organization_id)
    on delete restrict;

alter table public.org_members
  drop constraint org_members_point_id_fkey,
  add constraint org_members_point_same_org_fkey
    foreign key (point_id, organization_id)
    references public.points (id, organization_id)
    on delete restrict;

-- ============================================================================
-- 2. Главная точка
-- ============================================================================

alter table public.points
  add constraint points_main_is_active check (not is_main or is_active);

revoke update on public.points from authenticated;
grant update (name, address, latitude, longitude, is_active) on public.points to authenticated;

-- ============================================================================
-- 3. create_organization: гонка по БИН/ИИН
-- ============================================================================

create or replace function public.create_organization(
  p_name text,
  p_tax_id text,
  p_tax_id_type public.tax_id_type,
  p_timezone text default 'Asia/Almaty'
)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  base_slug text;
  candidate text;
  attempt int := 0;
  org public.organizations;
  violated text;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  p_name := trim(p_name);
  if char_length(p_name) not between 2 and 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  if not public.is_valid_kz_tax_id(p_tax_id) then
    raise exception 'invalid_tax_id' using errcode = '22023';
  end if;

  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'invalid_timezone' using errcode = '22023';
  end if;

  if exists (select 1 from public.organizations where tax_id = p_tax_id) then
    raise exception 'tax_id_taken' using errcode = '23505';
  end if;

  base_slug := coalesce(nullif(public.slugify(p_name), ''), 'org');
  candidate := base_slug;
  while exists (select 1 from public.organizations where slug = candidate) loop
    attempt := attempt + 1;
    candidate := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4 + attempt / 5);
  end loop;

  begin
    insert into public.organizations (name, tax_id, tax_id_type, slug, timezone, created_by)
    values (p_name, p_tax_id, p_tax_id_type, candidate, p_timezone, uid)
    returning * into org;
  exception
    when unique_violation then
      get stacked diagnostics violated = constraint_name;
      if violated = 'organizations_tax_id_key' then
        raise exception 'tax_id_taken' using errcode = '23505';
      end if;
      -- Одновременно занят тот же slug: пользователь повторит запрос.
      raise exception 'slug_taken' using errcode = '23505';
  end;

  insert into public.points (organization_id, name, is_main)
  values (org.id, 'Главная точка', true);

  insert into public.org_members (organization_id, user_id, role)
  values (org.id, uid, 'owner');

  return org;
end;
$$;

-- ============================================================================
-- 4. Права на вспомогательные функции
-- ============================================================================

-- is_valid_kz_tax_id участвует в check-ограничении organizations: при обновлении строки
-- его выполняет вызывающий, поэтому authenticated нужен execute.
revoke execute on function public.is_valid_kz_tax_id(text) from public, anon;
grant execute on function public.is_valid_kz_tax_id(text) to authenticated;

-- slugify вызывается только внутри create_organization (security definer).
revoke execute on function public.slugify(text) from public, anon, authenticated;
