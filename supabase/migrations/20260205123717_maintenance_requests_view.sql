-- View to expose limited tenant info for maintenance screens
create or replace view public.maintenance_requests_with_tenant as
select
  r.*,
  p.full_name as tenant_full_name,
  p.email as tenant_email
from public.maintenance_requests r
left join public.profiles p
  on p.id = r.created_by
where
  public.is_admin()
  or (
    (public.is_owner() or public.is_staff())
    and r.organization_id = public.current_org_id()
  )
  or r.created_by = auth.uid();

grant select on public.maintenance_requests_with_tenant to authenticated;
