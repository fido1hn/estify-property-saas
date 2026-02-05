-- Add role to profiles and backfill from user_roles
alter table public.profiles
  add column if not exists role public.user_role;

update public.profiles p
set role = ur.user_role
from public.user_roles ur
where ur.user_id = p.id
  and p.role is null;

alter table public.profiles
  alter column role set default 'tenant';

update public.profiles
set role = 'tenant'
where role is null;

alter table public.profiles
  alter column role set not null;

-- Prevent role updates by authenticated/anon (only service_role/postgres can change)
revoke update(role) on table public.profiles from anon, authenticated;
grant update(role) on table public.profiles to service_role, postgres;

-- Organizations
drop policy if exists "organizations_select" on public.organizations;
create policy "organizations_select"
on public.organizations
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = organizations.id
  )
);

drop policy if exists "organizations_insert" on public.organizations;
create policy "organizations_insert"
on public.organizations
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
  )
  or (
    auth.uid() is not null
    and not exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
    )
  )
);

drop policy if exists "organizations_update" on public.organizations;
create policy "organizations_update"
on public.organizations
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = organizations.id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = organizations.id
  )
);

drop policy if exists "organizations_delete" on public.organizations;
create policy "organizations_delete"
on public.organizations
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = profiles.organization_id
  )
);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert"
on public.profiles
for insert
with check (
  auth.uid() = id
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
on public.profiles
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = profiles.organization_id
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = profiles.organization_id
  )
);

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete"
on public.profiles
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = profiles.organization_id
  )
);

-- User roles (no recursion; access via profiles)
drop policy if exists "user_roles_select" on public.user_roles;
create policy "user_roles_select"
on public.user_roles
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = user_roles.user_id
      )
  )
);

drop policy if exists "user_roles_insert" on public.user_roles;
create policy "user_roles_insert"
on public.user_roles
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'owner'
    )
    and exists (
      select 1
      from public.profiles p2
      where p2.id = user_roles.user_id
        and p2.organization_id = (
          select p3.organization_id
          from public.profiles p3
          where p3.id = auth.uid()
        )
    )
  )
  or (
    auth.uid() = user_roles.user_id
    and user_roles.user_role = 'owner'
  )
);

drop policy if exists "user_roles_update" on public.user_roles;
create policy "user_roles_update"
on public.user_roles
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = user_roles.user_id
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = user_roles.user_id
      )
  )
);

drop policy if exists "user_roles_delete" on public.user_roles;
create policy "user_roles_delete"
on public.user_roles
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = user_roles.user_id
      )
  )
);

-- Properties
drop policy if exists "properties_select" on public.properties;
create policy "properties_select"
on public.properties
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and p.organization_id = properties.organization_id
  )
  or exists (
    select 1
    from public.tenants t
    join public.units u on u.id = t.unit_id
    where t.user_id = auth.uid()
      and u.property_id = properties.id
  )
);

drop policy if exists "properties_insert" on public.properties;
create policy "properties_insert"
on public.properties
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = properties.organization_id
  )
);

drop policy if exists "properties_update" on public.properties;
create policy "properties_update"
on public.properties
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = properties.organization_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = properties.organization_id
  )
);

drop policy if exists "properties_delete" on public.properties;
create policy "properties_delete"
on public.properties
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = properties.organization_id
  )
);

-- Units
drop policy if exists "units_select" on public.units;
create policy "units_select"
on public.units
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.properties pr on pr.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and pr.id = units.property_id
  )
  or exists (
    select 1
    from public.tenants t
    where t.user_id = auth.uid()
      and t.unit_id = units.id
  )
);

drop policy if exists "units_insert" on public.units;
create policy "units_insert"
on public.units
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.properties pr on pr.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and pr.id = units.property_id
  )
);

drop policy if exists "units_update" on public.units;
create policy "units_update"
on public.units
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.properties pr on pr.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and pr.id = units.property_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.properties pr on pr.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and pr.id = units.property_id
  )
);

drop policy if exists "units_delete" on public.units;
create policy "units_delete"
on public.units
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.properties pr on pr.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and pr.id = units.property_id
  )
);

-- Tenants
drop policy if exists "tenants_select" on public.tenants;
create policy "tenants_select"
on public.tenants
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.units u on u.id = tenants.unit_id
    join public.properties pr on pr.id = u.property_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = pr.organization_id
  )
  or tenants.user_id = auth.uid()
);

drop policy if exists "tenants_insert" on public.tenants;
create policy "tenants_insert"
on public.tenants
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.units u on u.id = tenants.unit_id
    join public.properties pr on pr.id = u.property_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = pr.organization_id
  )
);

drop policy if exists "tenants_update" on public.tenants;
create policy "tenants_update"
on public.tenants
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.units u on u.id = tenants.unit_id
    join public.properties pr on pr.id = u.property_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = pr.organization_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.units u on u.id = tenants.unit_id
    join public.properties pr on pr.id = u.property_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = pr.organization_id
  )
);

drop policy if exists "tenants_delete" on public.tenants;
create policy "tenants_delete"
on public.tenants
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.units u on u.id = tenants.unit_id
    join public.properties pr on pr.id = u.property_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = pr.organization_id
  )
);

-- Staff
drop policy if exists "staff_select" on public.staff;
create policy "staff_select"
on public.staff
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = staff.user_id
      )
  )
  or staff.user_id = auth.uid()
);

drop policy if exists "staff_insert" on public.staff;
create policy "staff_insert"
on public.staff
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = staff.user_id
      )
  )
);

drop policy if exists "staff_update" on public.staff;
create policy "staff_update"
on public.staff
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = staff.user_id
      )
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = staff.user_id
      )
  )
);

drop policy if exists "staff_delete" on public.staff;
create policy "staff_delete"
on public.staff
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = (
        select p2.organization_id
        from public.profiles p2
        where p2.id = staff.user_id
      )
  )
);

-- Maintenance requests
drop policy if exists "maintenance_requests_select" on public.maintenance_requests;
create policy "maintenance_requests_select"
on public.maintenance_requests
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and p.organization_id = maintenance_requests.organization_id
  )
  or maintenance_requests.created_by = auth.uid()
);

drop policy if exists "maintenance_requests_insert" on public.maintenance_requests;
create policy "maintenance_requests_insert"
on public.maintenance_requests
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and p.organization_id = maintenance_requests.organization_id
  )
  or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'tenant')
    and maintenance_requests.created_by = auth.uid()
    and exists (
      select 1
      from public.tenants t
      where t.user_id = auth.uid()
        and t.unit_id = maintenance_requests.unit_id
    )
    and exists (
      select 1
      from public.units u
      where u.id = maintenance_requests.unit_id
        and u.property_id = maintenance_requests.property_id
    )
  )
);

drop policy if exists "maintenance_requests_update" on public.maintenance_requests;
create policy "maintenance_requests_update"
on public.maintenance_requests
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and p.organization_id = maintenance_requests.organization_id
  )
  or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'tenant')
    and maintenance_requests.created_by = auth.uid()
    and maintenance_requests.status not in ('resolved', 'closed')
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and p.organization_id = maintenance_requests.organization_id
  )
  or (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'tenant')
    and maintenance_requests.created_by = auth.uid()
    and maintenance_requests.status not in ('resolved', 'closed')
  )
);

drop policy if exists "maintenance_requests_delete" on public.maintenance_requests;
create policy "maintenance_requests_delete"
on public.maintenance_requests
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = maintenance_requests.organization_id
  )
);

-- Maintenance events
drop policy if exists "maintenance_events_select" on public.maintenance_events;
create policy "maintenance_events_select"
on public.maintenance_events
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.maintenance_requests r on r.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and r.id = maintenance_events.request_id
  )
  or exists (
    select 1
    from public.maintenance_requests r
    where r.id = maintenance_events.request_id
      and r.created_by = auth.uid()
  )
);

drop policy if exists "maintenance_events_insert" on public.maintenance_events;
create policy "maintenance_events_insert"
on public.maintenance_events
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.maintenance_requests r on r.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role in ('owner','staff')
      and r.id = maintenance_events.request_id
  )
);

drop policy if exists "maintenance_events_update" on public.maintenance_events;
create policy "maintenance_events_update"
on public.maintenance_events
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "maintenance_events_delete" on public.maintenance_events;
create policy "maintenance_events_delete"
on public.maintenance_events
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Invoices
drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select"
on public.invoices
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invoices.organization_id
  )
  or invoices.tenant_id = auth.uid()
);

drop policy if exists "invoices_insert" on public.invoices;
create policy "invoices_insert"
on public.invoices
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invoices.organization_id
  )
);

drop policy if exists "invoices_update" on public.invoices;
create policy "invoices_update"
on public.invoices
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invoices.organization_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invoices.organization_id
  )
);

drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_delete"
on public.invoices
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invoices.organization_id
  )
);

-- Payments
drop policy if exists "payments_select" on public.payments;
create policy "payments_select"
on public.payments
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.invoices i on i.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and i.id = payments.invoice_id
  )
  or exists (
    select 1
    from public.invoices i
    where i.id = payments.invoice_id
      and i.tenant_id = auth.uid()
  )
);

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert"
on public.payments
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.invoices i on i.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and i.id = payments.invoice_id
  )
);

drop policy if exists "payments_update" on public.payments;
create policy "payments_update"
on public.payments
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.invoices i on i.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and i.id = payments.invoice_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.invoices i on i.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and i.id = payments.invoice_id
  )
);

drop policy if exists "payments_delete" on public.payments;
create policy "payments_delete"
on public.payments
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1
    from public.profiles p
    join public.invoices i on i.organization_id = p.organization_id
    where p.id = auth.uid()
      and p.role = 'owner'
      and i.id = payments.invoice_id
  )
);

-- Messages
drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
on public.messages
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
);

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
on public.messages
for insert
with check (
  sender_id = auth.uid()
);

drop policy if exists "messages_update" on public.messages;
create policy "messages_update"
on public.messages
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
);

drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete"
on public.messages
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
);

-- Invites
drop policy if exists "invites_select" on public.invites;
create policy "invites_select"
on public.invites
for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invites.organization_id
  )
);

drop policy if exists "invites_insert" on public.invites;
create policy "invites_insert"
on public.invites
for insert
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invites.organization_id
  )
);

drop policy if exists "invites_update" on public.invites;
create policy "invites_update"
on public.invites
for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invites.organization_id
  )
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invites.organization_id
  )
);

drop policy if exists "invites_delete" on public.invites;
create policy "invites_delete"
on public.invites
for delete
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.organization_id = invites.organization_id
  )
);

-- Refresh view with new role logic
create or replace view public.maintenance_requests_with_tenant as
select
  r.*,
  p.full_name as tenant_full_name,
  p.email as tenant_email
from public.maintenance_requests r
left join public.profiles p
  on p.id = r.created_by
where
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid()
      and pr.role in ('owner','staff')
      and pr.organization_id = r.organization_id
  )
  or r.created_by = auth.uid();

-- Drop helper functions (no longer needed)
drop function if exists public.is_admin();
drop function if exists public.is_owner();
drop function if exists public.is_staff();
drop function if exists public.is_tenant();
drop function if exists public.current_user_role();
drop function if exists public.current_org_id();
