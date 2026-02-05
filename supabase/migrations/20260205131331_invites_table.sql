-- Invites table for tenant/staff onboarding
create table if not exists public.invites (
  id uuid not null default gen_random_uuid(),
  organization_id uuid not null,
  role public.user_role not null,
  code text not null,
  created_by uuid not null,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  active boolean not null default true
);

alter table public.invites enable row level security;

create unique index if not exists invites_pkey on public.invites using btree (id);
create unique index if not exists invites_code_key on public.invites using btree (code);
create index if not exists invites_org_idx on public.invites using btree (organization_id);

alter table public.invites
  add constraint invites_pkey primary key using index invites_pkey;

alter table public.invites
  add constraint invites_organization_id_fkey
  foreign key (organization_id) references public.organizations(id)
  on update cascade on delete cascade;

alter table public.invites
  add constraint invites_created_by_fkey
  foreign key (created_by) references public.profiles(id)
  on update cascade on delete set null;

alter table public.invites
  add constraint invites_max_uses_positive check (max_uses > 0);

alter table public.invites
  add constraint invites_used_count_valid check (used_count >= 0 and used_count <= max_uses);

-- Policies: owner/admin manage invites for their org
drop policy if exists "invites_select" on public.invites;
create policy "invites_select"
on public.invites
for select
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "invites_insert" on public.invites;
create policy "invites_insert"
on public.invites
for insert
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "invites_update" on public.invites;
create policy "invites_update"
on public.invites
for update
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
)
with check (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);

drop policy if exists "invites_delete" on public.invites;
create policy "invites_delete"
on public.invites
for delete
using (
  public.is_admin()
  or (public.is_owner() and organization_id = public.current_org_id())
);
