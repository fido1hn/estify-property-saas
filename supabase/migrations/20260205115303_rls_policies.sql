-- Helper functions for RLS
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select ur.user_role
  from public.user_roles ur
  where ur.user_id = auth.uid()
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'owner'
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'staff'
$$;

create or replace function public.is_tenant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'tenant'
$$;

-- Organizations
drop policy if exists "organizations_select" on public.organizations;
create policy "organizations_select"
on public.organizations
for select
using (
  public.is_admin()
  or id = public.current_org_id()
);

drop policy if exists "organizations_insert" on public.organizations;
create policy "organizations_insert"
on public.organizations
for insert
with check (
  public.is_admin()
  or public.is_owner()
  or (
    auth.uid() is not null
    and not exists (select 1 from public.profiles p where p.id = auth.uid())
  )
);

drop policy if exists "organizations_update" on public.organizations;
create policy "organizations_update"
on public.organizations
for update
using (
  public.is_admin()
  or (public.is_owner() and id = public.current_org_id())
)
with check (
  public.is_admin()
  or (public.is_owner() and id = public.current_org_id())
);

drop policy if exists "organizations_delete" on public.organizations;
create policy "organizations_delete"
on public.organizations
for delete
using (
  public.is_admin()
);

-- Profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
using (
  public.is_admin()
  or id = auth.uid()
  or (public.is_owner() and organization_id = public.current_org_id())
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
  public.is_admin()
  or id = auth.uid()
  or (public.is_owner() and organization_id = public.current_org_id())
)
with check (
  public.is_admin()
  or id = auth.uid()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete"
on public.profiles
for delete
using (
  public.is_admin()
  or id = auth.uid()
  or (public.is_owner() and organization_id = public.current_org_id())
);

-- User roles
drop policy if exists "user_roles_select" on public.user_roles;
create policy "user_roles_select"
on public.user_roles
for select
using (
  public.is_admin()
  or user_id = auth.uid()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = user_roles.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "user_roles_insert" on public.user_roles;
create policy "user_roles_insert"
on public.user_roles
for insert
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = user_roles.user_id
        and p.organization_id = public.current_org_id()
    )
  )
  or (
    auth.uid() = user_roles.user_id
    and user_roles.user_role = 'owner'
    and not exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  )
);

drop policy if exists "user_roles_update" on public.user_roles;
create policy "user_roles_update"
on public.user_roles
for update
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = user_roles.user_id
        and p.organization_id = public.current_org_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = user_roles.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "user_roles_delete" on public.user_roles;
create policy "user_roles_delete"
on public.user_roles
for delete
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = user_roles.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

-- Properties
drop policy if exists "properties_select" on public.properties;
create policy "properties_select"
on public.properties
for select
using (
  public.is_admin()
  or ((public.is_owner() or public.is_staff()) and organization_id = public.current_org_id())
  or (
    public.is_tenant()
    and exists (
      select 1
      from public.tenants t
      join public.units u on u.id = t.unit_id
      where t.user_id = auth.uid()
        and u.property_id = properties.id
    )
  )
);

drop policy if exists "properties_insert" on public.properties;
create policy "properties_insert"
on public.properties
for insert
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "properties_update" on public.properties;
create policy "properties_update"
on public.properties
for update
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
)
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "properties_delete" on public.properties;
create policy "properties_delete"
on public.properties
for delete
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

-- Units
drop policy if exists "units_select" on public.units;
create policy "units_select"
on public.units
for select
using (
  public.is_admin()
  or (
    (public.is_owner() or public.is_staff())
    and exists (
      select 1
      from public.properties p
      where p.id = units.property_id
        and p.organization_id = public.current_org_id()
    )
  )
  or (
    public.is_tenant()
    and exists (
      select 1
      from public.tenants t
      where t.user_id = auth.uid()
        and t.unit_id = units.id
    )
  )
);

drop policy if exists "units_insert" on public.units;
create policy "units_insert"
on public.units
for insert
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.properties p
      where p.id = units.property_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "units_update" on public.units;
create policy "units_update"
on public.units
for update
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.properties p
      where p.id = units.property_id
        and p.organization_id = public.current_org_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.properties p
      where p.id = units.property_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "units_delete" on public.units;
create policy "units_delete"
on public.units
for delete
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.properties p
      where p.id = units.property_id
        and p.organization_id = public.current_org_id()
    )
  )
);

-- Tenants
drop policy if exists "tenants_select" on public.tenants;
create policy "tenants_select"
on public.tenants
for select
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
        and p.organization_id = public.current_org_id()
    )
  )
  or tenants.user_id = auth.uid()
);

drop policy if exists "tenants_insert" on public.tenants;
create policy "tenants_insert"
on public.tenants
for insert
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "tenants_update" on public.tenants;
create policy "tenants_update"
on public.tenants
for update
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
        and p.organization_id = public.current_org_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "tenants_delete" on public.tenants;
create policy "tenants_delete"
on public.tenants
for delete
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
        and p.organization_id = public.current_org_id()
    )
  )
);

-- Staff
drop policy if exists "staff_select" on public.staff;
create policy "staff_select"
on public.staff
for select
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
  or (
    public.is_staff()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
  or staff.user_id = auth.uid()
);

drop policy if exists "staff_insert" on public.staff;
create policy "staff_insert"
on public.staff
for insert
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "staff_update" on public.staff;
create policy "staff_update"
on public.staff
for update
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "staff_delete" on public.staff;
create policy "staff_delete"
on public.staff
for delete
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.profiles p
      where p.id = staff.user_id
        and p.organization_id = public.current_org_id()
    )
  )
);

-- Maintenance requests
drop policy if exists "maintenance_requests_select" on public.maintenance_requests;
create policy "maintenance_requests_select"
on public.maintenance_requests
for select
using (
  public.is_admin()
  or ((public.is_owner() or public.is_staff()) and organization_id = public.current_org_id())
  or created_by = auth.uid()
);

drop policy if exists "maintenance_requests_insert" on public.maintenance_requests;
create policy "maintenance_requests_insert"
on public.maintenance_requests
for insert
with check (
  public.is_admin()
  or ((public.is_owner() or public.is_staff()) and organization_id = public.current_org_id())
  or (
    public.is_tenant()
    and created_by = auth.uid()
    and organization_id = public.current_org_id()
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
  public.is_admin()
  or ((public.is_owner() or public.is_staff()) and organization_id = public.current_org_id())
  or (
    public.is_tenant()
    and created_by = auth.uid()
    and status not in ('resolved', 'closed')
  )
)
with check (
  public.is_admin()
  or ((public.is_owner() or public.is_staff()) and organization_id = public.current_org_id())
  or (
    public.is_tenant()
    and created_by = auth.uid()
    and status not in ('resolved', 'closed')
  )
);

drop policy if exists "maintenance_requests_delete" on public.maintenance_requests;
create policy "maintenance_requests_delete"
on public.maintenance_requests
for delete
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

-- Maintenance events
drop policy if exists "maintenance_events_select" on public.maintenance_events;
create policy "maintenance_events_select"
on public.maintenance_events
for select
using (
  public.is_admin()
  or (
    (public.is_owner() or public.is_staff())
    and exists (
      select 1
      from public.maintenance_requests r
      where r.id = maintenance_events.request_id
        and r.organization_id = public.current_org_id()
    )
  )
  or (
    public.is_tenant()
    and exists (
      select 1
      from public.maintenance_requests r
      where r.id = maintenance_events.request_id
        and r.created_by = auth.uid()
    )
  )
);

drop policy if exists "maintenance_events_insert" on public.maintenance_events;
create policy "maintenance_events_insert"
on public.maintenance_events
for insert
with check (
  public.is_admin()
  or (
    (public.is_owner() or public.is_staff())
    and exists (
      select 1
      from public.maintenance_requests r
      where r.id = maintenance_events.request_id
        and r.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "maintenance_events_update" on public.maintenance_events;
create policy "maintenance_events_update"
on public.maintenance_events
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists "maintenance_events_delete" on public.maintenance_events;
create policy "maintenance_events_delete"
on public.maintenance_events
for delete
using (
  public.is_admin()
);

-- Invoices
drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select"
on public.invoices
for select
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
  or tenant_id = auth.uid()
);

drop policy if exists "invoices_insert" on public.invoices;
create policy "invoices_insert"
on public.invoices
for insert
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "invoices_update" on public.invoices;
create policy "invoices_update"
on public.invoices
for update
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
)
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_delete"
on public.invoices
for delete
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

-- Payments
drop policy if exists "payments_select" on public.payments;
create policy "payments_select"
on public.payments
for select
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.organization_id = public.current_org_id()
    )
  )
  or (
    public.is_tenant()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.tenant_id = auth.uid()
    )
  )
);

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert"
on public.payments
for insert
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "payments_update" on public.payments;
create policy "payments_update"
on public.payments
for update
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.organization_id = public.current_org_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.organization_id = public.current_org_id()
    )
  )
);

drop policy if exists "payments_delete" on public.payments;
create policy "payments_delete"
on public.payments
for delete
using (
  public.is_admin()
  or (
    public.is_owner()
    and exists (
      select 1
      from public.invoices i
      where i.id = payments.invoice_id
        and i.organization_id = public.current_org_id()
    )
  )
);

-- Messages
drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
on public.messages
for select
using (
  public.is_admin()
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
  public.is_admin()
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
)
with check (
  public.is_admin()
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
);

drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete"
on public.messages
for delete
using (
  public.is_admin()
  or sender_id = auth.uid()
  or receiver_id = auth.uid()
);
