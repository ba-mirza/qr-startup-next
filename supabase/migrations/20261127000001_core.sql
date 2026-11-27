-- Ядро KasipQR: организации, участники, точки, QR, каталог модулей и их подключение.
-- Запускать на пустой базе (Supabase → SQL Editor).

-- ============================================================================
-- Типы
-- ============================================================================

create type public.tax_id_type as enum ('bin', 'iin');
create type public.member_role as enum ('owner', 'cashier');
create type public.org_module_status as enum ('setup', 'active', 'expired');

-- ============================================================================
-- Каталог модулей
-- ============================================================================

create table public.modules (
  key text primary key check (key ~ '^[a-z]+$'),
  name text not null,
  description text not null default '',
  price_monthly numeric(12, 2) check (price_monthly >= 0),
  trial_days int not null default 0 check (trial_days >= 0),
  is_available boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.modules.is_available is 'false — модуль в каталоге с пометкой «скоро», подключить нельзя';
comment on column public.modules.trial_days is '0 — без пробного периода';

insert into public.modules (key, name, description, trial_days, is_available, sort_order) values
  ('attendance', 'Посещаемость', 'Отметка прихода и ухода сотрудников по QR точки', 14, true, 10),
  ('feedback', 'Фидбэк', 'Анонимные отзывы гостей по QR и статистика по точкам', 0, false, 20),
  ('menu', 'Меню', 'QR-меню и вызов официанта', 0, false, 30),
  ('bonus', 'Бонусы', 'Бонусная программа для покупателей: начисление и списание на кассе', 0, false, 40);

-- ============================================================================
-- Организации
-- ============================================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  tax_id char(12) not null unique check (tax_id ~ '^[0-9]{12}$'),
  tax_id_type public.tax_id_type not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  timezone text not null default 'Asia/Almaty',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

comment on column public.organizations.tax_id is 'БИН (ТОО) или ИИН (ИП), 12 цифр с контрольной суммой';

-- ============================================================================
-- Точки
-- ============================================================================

create table public.points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  is_main boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null))
);

create index points_organization_id_idx on public.points (organization_id);
create unique index points_one_main_per_org on public.points (organization_id) where is_main;

-- ============================================================================
-- Участники организации
-- ============================================================================

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null,
  point_id uuid references public.points (id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  check (role <> 'cashier' or point_id is not null)
);

comment on column public.org_members.point_id is 'Обязателен для кассира: кассир работает на одной точке';

create index org_members_user_id_idx on public.org_members (user_id);

-- ============================================================================
-- QR-коды
-- ============================================================================

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  point_id uuid references public.points (id) on delete restrict,
  module text not null references public.modules (key),
  purpose text not null check (purpose ~ '^[a-z_]+$'),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column public.qr_codes.purpose is 'Назначение внутри модуля, например check_in или registration';

create index qr_codes_organization_id_idx on public.qr_codes (organization_id);

-- ============================================================================
-- Подключённые модули
-- ============================================================================

create table public.org_modules (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  module text not null references public.modules (key),
  status public.org_module_status not null default 'setup',
  active_until timestamptz,
  trial_used boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (organization_id, module)
);

comment on column public.org_modules.active_until is 'null при status = active — бессрочно';
comment on column public.org_modules.trial_used is 'Пробный период выдаётся один раз: строка не удаляется, БИН/ИИН уникален';

-- ============================================================================
-- Вспомогательные функции для RLS
-- ============================================================================

-- security definer: читает org_members в обход RLS, иначе политики зациклятся.
create function public.is_org_member(org uuid, roles public.member_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.org_members m
    where m.organization_id = org
      and m.user_id = (select auth.uid())
      and m.is_active
      and (roles is null or m.role = any (roles))
  );
$$;

create function public.has_module(org uuid, module_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.org_modules om
    where om.organization_id = org
      and om.module = module_key
      and om.status = 'active'
      and (om.active_until is null or om.active_until > now())
  );
$$;

-- ============================================================================
-- Проверка БИН/ИИН
-- ============================================================================

-- Контрольный разряд одинаков для БИН и ИИН: веса 1..11, при остатке 10 — веса 3..11,1,2.
create function public.is_valid_kz_tax_id(value text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  digits int[];
  checksum int := 0;
  i int;
begin
  if value is null or value !~ '^[0-9]{12}$' then
    return false;
  end if;

  select array_agg(d::int order by ord) into digits
  from unnest(string_to_array(value, null)) with ordinality as t (d, ord);

  for i in 1..11 loop
    checksum := checksum + digits[i] * i;
  end loop;
  checksum := checksum % 11;

  if checksum = 10 then
    checksum := 0;
    for i in 1..11 loop
      checksum := checksum + digits[i] * (((i + 1) % 11) + 1);
    end loop;
    checksum := checksum % 11;
  end if;

  return checksum <> 10 and checksum = digits[12];
end;
$$;

alter table public.organizations
  add constraint organizations_tax_id_valid check (public.is_valid_kz_tax_id(tax_id));

-- ============================================================================
-- Slug из названия (кириллица и казахские буквы транслитерируются)
-- ============================================================================

create function public.slugify(value text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  src constant text[] := array[
    'а','ә','б','в','г','ғ','д','е','ё','ж','з','и','й','к','қ','л','м','н','ң','о','ө','п',
    'р','с','т','у','ұ','ү','ф','х','һ','ц','ч','ш','щ','ъ','ы','і','ь','э','ю','я'];
  dst constant text[] := array[
    'a','a','b','v','g','g','d','e','e','zh','z','i','i','k','q','l','m','n','n','o','o','p',
    'r','s','t','u','u','u','f','h','h','ts','ch','sh','sch','','y','i','','e','yu','ya'];
  result text := lower(coalesce(value, ''));
  i int;
begin
  for i in 1..array_length(src, 1) loop
    result := replace(result, src[i], dst[i]);
  end loop;
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := trim(both '-' from result);
  return left(result, 48);
end;
$$;

-- ============================================================================
-- RPC: создание организации (организация + владелец + главная точка одной транзакцией)
-- ============================================================================

create function public.create_organization(
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

  insert into public.organizations (name, tax_id, tax_id_type, slug, timezone, created_by)
  values (p_name, p_tax_id, p_tax_id_type, candidate, p_timezone, uid)
  returning * into org;

  insert into public.points (organization_id, name, is_main)
  values (org.id, 'Главная точка', true);

  insert into public.org_members (organization_id, user_id, role)
  values (org.id, uid, 'owner');

  return org;
end;
$$;

-- ============================================================================
-- RPC: пробный период модуля (один раз на организацию, а значит на БИН/ИИН)
-- ============================================================================

create function public.start_module_trial(p_organization_id uuid, p_module text)
returns public.org_modules
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_module public.modules;
  existing public.org_modules;
  result public.org_modules;
begin
  if not public.is_org_member(p_organization_id, array['owner']::public.member_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_module from public.modules where key = p_module;
  if not found or not v_module.is_available or v_module.trial_days = 0 then
    raise exception 'trial_not_available' using errcode = '22023';
  end if;

  select * into existing
  from public.org_modules
  where organization_id = p_organization_id and module = p_module
  for update;

  if found and existing.trial_used then
    raise exception 'trial_already_used' using errcode = '23505';
  end if;

  insert into public.org_modules (organization_id, module, status, active_until, trial_used)
  values (p_organization_id, p_module, 'active', now() + make_interval(days => v_module.trial_days), true)
  on conflict (organization_id, module) do update
    set status = 'active', active_until = excluded.active_until, trial_used = true
  returning * into result;

  return result;
end;
$$;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.modules enable row level security;
alter table public.organizations enable row level security;
alter table public.points enable row level security;
alter table public.org_members enable row level security;
alter table public.qr_codes enable row level security;
alter table public.org_modules enable row level security;

-- Каталог модулей публичный (лендинг и онбординг).
create policy modules_select on public.modules
  for select to anon, authenticated using (true);

-- Организации: читают участники, меняет владелец. Создание — только через create_organization.
create policy organizations_select on public.organizations
  for select to authenticated using (public.is_org_member(id));
create policy organizations_update on public.organizations
  for update to authenticated
  using (public.is_org_member(id, array['owner']::public.member_role[]))
  with check (public.is_org_member(id, array['owner']::public.member_role[]));

-- Владелец меняет только название и часовой пояс; БИН/ИИН, slug и автор неизменны.
revoke update on public.organizations from authenticated;
grant update (name, timezone) on public.organizations to authenticated;

-- Участники: свою запись видит каждый, все записи — владелец.
-- Добавление и изменение участников — отдельными RPC (вместе с модулем кассы).
create policy org_members_select on public.org_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_org_member(organization_id, array['owner']::public.member_role[])
  );

-- Точки: читают участники, создаёт и меняет владелец. Удаление — через is_active.
create policy points_select on public.points
  for select to authenticated using (public.is_org_member(organization_id));
create policy points_insert on public.points
  for insert to authenticated
  with check (
    public.is_org_member(organization_id, array['owner']::public.member_role[])
    and not is_main
  );
create policy points_update on public.points
  for update to authenticated
  using (public.is_org_member(organization_id, array['owner']::public.member_role[]))
  with check (public.is_org_member(organization_id, array['owner']::public.member_role[]));

-- QR-коды: читают участники, выпускает владелец и только для подключённого модуля.
create policy qr_codes_select on public.qr_codes
  for select to authenticated using (public.is_org_member(organization_id));
create policy qr_codes_insert on public.qr_codes
  for insert to authenticated
  with check (
    public.is_org_member(organization_id, array['owner']::public.member_role[])
    and public.has_module(organization_id, module)
  );
create policy qr_codes_update on public.qr_codes
  for update to authenticated
  using (public.is_org_member(organization_id, array['owner']::public.member_role[]))
  with check (
    public.is_org_member(organization_id, array['owner']::public.member_role[])
    and public.has_module(organization_id, module)
  );

-- Подключение модулей: только чтение. Пишут RPC пробного периода и обработчик оплаты.
create policy org_modules_select on public.org_modules
  for select to authenticated using (public.is_org_member(organization_id));

-- ============================================================================
-- Права на функции: по умолчанию execute выдан public, закрываем.
-- ============================================================================

revoke execute on function public.is_org_member(uuid, public.member_role[]) from public, anon;
revoke execute on function public.has_module(uuid, text) from public, anon;
revoke execute on function public.create_organization(text, text, public.tax_id_type, text) from public, anon;
revoke execute on function public.start_module_trial(uuid, text) from public, anon;

grant execute on function public.is_org_member(uuid, public.member_role[]) to authenticated;
grant execute on function public.has_module(uuid, text) to authenticated;
grant execute on function public.create_organization(text, text, public.tax_id_type, text) to authenticated;
grant execute on function public.start_module_trial(uuid, text) to authenticated;
