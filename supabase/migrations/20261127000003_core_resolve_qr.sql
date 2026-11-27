-- Публичный вход по QR: /q/[token] узнаёт, какому модулю отдать страницу.
-- Возвращает минимум: модуль и назначение. Данные модуль получает своей RPC по тому же token.

create function public.resolve_qr(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_qr public.qr_codes;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32}$' then
    raise exception 'qr_not_found' using errcode = 'P0002';
  end if;

  select * into v_qr
  from public.qr_codes
  where token = p_token
    and is_active
    and (expires_at is null or expires_at > now());

  if not found then
    raise exception 'qr_not_found' using errcode = 'P0002';
  end if;

  if v_qr.point_id is not null and not exists (
    select 1 from public.points where id = v_qr.point_id and is_active
  ) then
    raise exception 'qr_not_found' using errcode = 'P0002';
  end if;

  if not public.has_module(v_qr.organization_id, v_qr.module) then
    raise exception 'module_inactive' using errcode = 'P0002';
  end if;

  return jsonb_build_object('module', v_qr.module, 'purpose', v_qr.purpose);
end;
$$;

revoke execute on function public.resolve_qr(text) from public;
grant execute on function public.resolve_qr(text) to anon, authenticated;
