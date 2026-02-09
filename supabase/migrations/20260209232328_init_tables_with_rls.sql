create type "public"."buidling_type" as enum ('commercial', 'residential');

create type "public"."invoice_status" as enum ('draft', 'issued', 'paid', 'overdue');

create type "public"."lease_status" as enum ('active', 'expired', 'pending');

create type "public"."maintenance_requests_priority" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."maintenance_requests_status" as enum ('open', 'in_progress', 'resolved', 'closed');

create type "public"."staff_role" as enum ('security', 'cleaning', 'electrical', 'manager', 'plumbing');

create type "public"."staff_status" as enum ('active', 'inactive');

create type "public"."tenant_status" as enum ('active', 'terminated', 'pending');

create type "public"."user_role" as enum ('admin', 'owner', 'tenant', 'staff');


  create table "public"."invoices" (
    "lease_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "amount_kobo" bigint not null,
    "due_date" timestamp with time zone not null,
    "paid_at" timestamp with time zone,
    "status" public.invoice_status not null,
    "updated_at" timestamp with time zone default now(),
    "id" uuid not null default gen_random_uuid()
      );


alter table "public"."invoices" enable row level security;


  create table "public"."leases" (
    "id" uuid not null default gen_random_uuid(),
    "unit_id" uuid not null,
    "tenant_id" uuid not null,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "rent_kobo" bigint not null,
    "created_at" timestamp with time zone not null default now(),
    "lease_status" public.lease_status not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."leases" enable row level security;


  create table "public"."maintenance_events" (
    "id" uuid not null default gen_random_uuid(),
    "request_id" uuid not null,
    "from_status" public.maintenance_requests_status not null,
    "to_status" public.maintenance_requests_status not null,
    "changed_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."maintenance_events" enable row level security;


  create table "public"."maintenance_requests" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "property_id" uuid not null,
    "unit_id" uuid not null,
    "created_by" uuid not null,
    "assigned_staff_id" uuid,
    "title" text not null,
    "description" text not null,
    "updated_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "status" public.maintenance_requests_status not null,
    "priority" public.maintenance_requests_priority not null
      );


alter table "public"."maintenance_requests" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "sender_id" uuid not null,
    "receiver_id" uuid not null,
    "content" text not null,
    "is_read" boolean not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."messages" enable row level security;


  create table "public"."organizations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "owner_id" uuid not null
      );


alter table "public"."organizations" enable row level security;


  create table "public"."payments" (
    "id" uuid not null default gen_random_uuid(),
    "paid_at" timestamp with time zone not null default now(),
    "amount_kobo" bigint not null,
    "payment_method" text not null,
    "invoice_id" uuid not null
      );


alter table "public"."payments" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "full_name" text not null,
    "email" text not null,
    "avatar_url" text,
    "phone_number" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."properties" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "name" text not null,
    "address" text not null,
    "image_url" text,
    "total_units" smallint not null,
    "created_at" timestamp with time zone not null default now(),
    "type" public.buidling_type not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."properties" enable row level security;


  create table "public"."staff" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "status" public.staff_status not null
      );


alter table "public"."staff" enable row level security;


  create table "public"."staff_assignments" (
    "id" uuid not null default gen_random_uuid(),
    "assigned_at" timestamp with time zone not null default now(),
    "staff_id" uuid not null,
    "property_id" uuid not null,
    "role" public.staff_role not null
      );


alter table "public"."staff_assignments" enable row level security;


  create table "public"."tenants" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "status" public.tenant_status not null
      );


alter table "public"."tenants" enable row level security;


  create table "public"."unit_occupants" (
    "unit_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "tenant_id" uuid not null,
    "left_at" timestamp with time zone,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."unit_occupants" enable row level security;


  create table "public"."units" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "property_id" uuid not null,
    "unit_number" smallint not null,
    "unit_description" text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."units" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null,
    "user_role" public.user_role not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX invoices_lease_id_key ON public.invoices USING btree (lease_id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX leases_pkey ON public.leases USING btree (id);

CREATE UNIQUE INDEX leases_unit_id_key ON public.leases USING btree (unit_id);

CREATE UNIQUE INDEX maintenance_events_pkey ON public.maintenance_events USING btree (id);

CREATE UNIQUE INDEX maintenance_requests_pkey ON public.maintenance_requests USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX properties_pkey ON public.properties USING btree (id);

CREATE UNIQUE INDEX staff_assignments_pkey ON public.staff_assignments USING btree (id);

CREATE UNIQUE INDEX staff_pkey ON public.staff USING btree (id);

CREATE UNIQUE INDEX tenants_pkey ON public.tenants USING btree (id);

CREATE UNIQUE INDEX unit_occupants_pkey ON public.unit_occupants USING btree (unit_id, tenant_id);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE UNIQUE INDEX units_property_unit_unique ON public.units USING btree (property_id, unit_number);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."leases" add constraint "leases_pkey" PRIMARY KEY using index "leases_pkey";

alter table "public"."maintenance_events" add constraint "maintenance_events_pkey" PRIMARY KEY using index "maintenance_events_pkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_pkey" PRIMARY KEY using index "maintenance_requests_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "public"."staff" add constraint "staff_pkey" PRIMARY KEY using index "staff_pkey";

alter table "public"."staff_assignments" add constraint "staff_assignments_pkey" PRIMARY KEY using index "staff_assignments_pkey";

alter table "public"."tenants" add constraint "tenants_pkey" PRIMARY KEY using index "tenants_pkey";

alter table "public"."unit_occupants" add constraint "unit_occupants_pkey" PRIMARY KEY using index "unit_occupants_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."invoices" add constraint "invoices_lease_id_fkey" FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_lease_id_fkey";

alter table "public"."invoices" add constraint "invoices_lease_id_key" UNIQUE using index "invoices_lease_id_key";

alter table "public"."leases" add constraint "leases_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leases" validate constraint "leases_tenant_id_fkey";

alter table "public"."leases" add constraint "leases_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leases" validate constraint "leases_unit_id_fkey";

alter table "public"."leases" add constraint "leases_unit_id_key" UNIQUE using index "leases_unit_id_key";

alter table "public"."maintenance_events" add constraint "maintenance_events_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."maintenance_events" validate constraint "maintenance_events_changed_by_fkey";

alter table "public"."maintenance_events" add constraint "maintenance_events_request_id_fkey" FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."maintenance_events" validate constraint "maintenance_events_request_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_assigned_staff_id_fkey1" FOREIGN KEY (assigned_staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_assigned_staff_id_fkey1";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_created_by_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_property_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_unit_id_fkey";

alter table "public"."messages" add constraint "messages_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_receiver_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."organizations" add constraint "organizations_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."organizations" validate constraint "organizations_owner_id_fkey";

alter table "public"."payments" add constraint "payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_invoice_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_phone_number_check" CHECK ((length(phone_number) < 12)) not valid;

alter table "public"."profiles" validate constraint "profiles_phone_number_check";

alter table "public"."properties" add constraint "properties_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_organization_id_fkey";

alter table "public"."staff" add constraint "staff_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."staff" validate constraint "staff_id_fkey";

alter table "public"."staff_assignments" add constraint "staff_assignments_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."staff_assignments" validate constraint "staff_assignments_property_id_fkey";

alter table "public"."staff_assignments" add constraint "staff_assignments_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."staff_assignments" validate constraint "staff_assignments_staff_id_fkey";

alter table "public"."tenants" add constraint "tenants_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tenants" validate constraint "tenants_id_fkey";

alter table "public"."unit_occupants" add constraint "unit_occupants_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."unit_occupants" validate constraint "unit_occupants_tenant_id_fkey";

alter table "public"."unit_occupants" add constraint "unit_occupants_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."unit_occupants" validate constraint "unit_occupants_unit_id_fkey";

alter table "public"."units" add constraint "units_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."units" validate constraint "units_property_id_fkey";

alter table "public"."units" add constraint "units_property_unit_unique" UNIQUE using index "units_property_unit_unique";

alter table "public"."user_roles" add constraint "user_roles_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_id_fkey";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."leases" to "anon";

grant insert on table "public"."leases" to "anon";

grant references on table "public"."leases" to "anon";

grant select on table "public"."leases" to "anon";

grant trigger on table "public"."leases" to "anon";

grant truncate on table "public"."leases" to "anon";

grant update on table "public"."leases" to "anon";

grant delete on table "public"."leases" to "authenticated";

grant insert on table "public"."leases" to "authenticated";

grant references on table "public"."leases" to "authenticated";

grant select on table "public"."leases" to "authenticated";

grant trigger on table "public"."leases" to "authenticated";

grant truncate on table "public"."leases" to "authenticated";

grant update on table "public"."leases" to "authenticated";

grant delete on table "public"."leases" to "postgres";

grant insert on table "public"."leases" to "postgres";

grant references on table "public"."leases" to "postgres";

grant select on table "public"."leases" to "postgres";

grant trigger on table "public"."leases" to "postgres";

grant truncate on table "public"."leases" to "postgres";

grant update on table "public"."leases" to "postgres";

grant delete on table "public"."leases" to "service_role";

grant insert on table "public"."leases" to "service_role";

grant references on table "public"."leases" to "service_role";

grant select on table "public"."leases" to "service_role";

grant trigger on table "public"."leases" to "service_role";

grant truncate on table "public"."leases" to "service_role";

grant update on table "public"."leases" to "service_role";

grant delete on table "public"."maintenance_events" to "anon";

grant insert on table "public"."maintenance_events" to "anon";

grant references on table "public"."maintenance_events" to "anon";

grant select on table "public"."maintenance_events" to "anon";

grant trigger on table "public"."maintenance_events" to "anon";

grant truncate on table "public"."maintenance_events" to "anon";

grant update on table "public"."maintenance_events" to "anon";

grant delete on table "public"."maintenance_events" to "authenticated";

grant insert on table "public"."maintenance_events" to "authenticated";

grant references on table "public"."maintenance_events" to "authenticated";

grant select on table "public"."maintenance_events" to "authenticated";

grant trigger on table "public"."maintenance_events" to "authenticated";

grant truncate on table "public"."maintenance_events" to "authenticated";

grant update on table "public"."maintenance_events" to "authenticated";

grant delete on table "public"."maintenance_events" to "service_role";

grant insert on table "public"."maintenance_events" to "service_role";

grant references on table "public"."maintenance_events" to "service_role";

grant select on table "public"."maintenance_events" to "service_role";

grant trigger on table "public"."maintenance_events" to "service_role";

grant truncate on table "public"."maintenance_events" to "service_role";

grant update on table "public"."maintenance_events" to "service_role";

grant delete on table "public"."maintenance_requests" to "anon";

grant insert on table "public"."maintenance_requests" to "anon";

grant references on table "public"."maintenance_requests" to "anon";

grant select on table "public"."maintenance_requests" to "anon";

grant trigger on table "public"."maintenance_requests" to "anon";

grant truncate on table "public"."maintenance_requests" to "anon";

grant update on table "public"."maintenance_requests" to "anon";

grant delete on table "public"."maintenance_requests" to "authenticated";

grant insert on table "public"."maintenance_requests" to "authenticated";

grant references on table "public"."maintenance_requests" to "authenticated";

grant select on table "public"."maintenance_requests" to "authenticated";

grant trigger on table "public"."maintenance_requests" to "authenticated";

grant truncate on table "public"."maintenance_requests" to "authenticated";

grant update on table "public"."maintenance_requests" to "authenticated";

grant delete on table "public"."maintenance_requests" to "service_role";

grant insert on table "public"."maintenance_requests" to "service_role";

grant references on table "public"."maintenance_requests" to "service_role";

grant select on table "public"."maintenance_requests" to "service_role";

grant trigger on table "public"."maintenance_requests" to "service_role";

grant truncate on table "public"."maintenance_requests" to "service_role";

grant update on table "public"."maintenance_requests" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."payments" to "anon";

grant insert on table "public"."payments" to "anon";

grant references on table "public"."payments" to "anon";

grant select on table "public"."payments" to "anon";

grant trigger on table "public"."payments" to "anon";

grant truncate on table "public"."payments" to "anon";

grant update on table "public"."payments" to "anon";

grant delete on table "public"."payments" to "authenticated";

grant insert on table "public"."payments" to "authenticated";

grant references on table "public"."payments" to "authenticated";

grant select on table "public"."payments" to "authenticated";

grant trigger on table "public"."payments" to "authenticated";

grant truncate on table "public"."payments" to "authenticated";

grant update on table "public"."payments" to "authenticated";

grant delete on table "public"."payments" to "service_role";

grant insert on table "public"."payments" to "service_role";

grant references on table "public"."payments" to "service_role";

grant select on table "public"."payments" to "service_role";

grant trigger on table "public"."payments" to "service_role";

grant truncate on table "public"."payments" to "service_role";

grant update on table "public"."payments" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."properties" to "anon";

grant insert on table "public"."properties" to "anon";

grant references on table "public"."properties" to "anon";

grant select on table "public"."properties" to "anon";

grant trigger on table "public"."properties" to "anon";

grant truncate on table "public"."properties" to "anon";

grant update on table "public"."properties" to "anon";

grant delete on table "public"."properties" to "authenticated";

grant insert on table "public"."properties" to "authenticated";

grant references on table "public"."properties" to "authenticated";

grant select on table "public"."properties" to "authenticated";

grant trigger on table "public"."properties" to "authenticated";

grant truncate on table "public"."properties" to "authenticated";

grant update on table "public"."properties" to "authenticated";

grant delete on table "public"."properties" to "service_role";

grant insert on table "public"."properties" to "service_role";

grant references on table "public"."properties" to "service_role";

grant select on table "public"."properties" to "service_role";

grant trigger on table "public"."properties" to "service_role";

grant truncate on table "public"."properties" to "service_role";

grant update on table "public"."properties" to "service_role";

grant delete on table "public"."staff" to "anon";

grant insert on table "public"."staff" to "anon";

grant references on table "public"."staff" to "anon";

grant select on table "public"."staff" to "anon";

grant trigger on table "public"."staff" to "anon";

grant truncate on table "public"."staff" to "anon";

grant update on table "public"."staff" to "anon";

grant delete on table "public"."staff" to "authenticated";

grant insert on table "public"."staff" to "authenticated";

grant references on table "public"."staff" to "authenticated";

grant select on table "public"."staff" to "authenticated";

grant trigger on table "public"."staff" to "authenticated";

grant truncate on table "public"."staff" to "authenticated";

grant update on table "public"."staff" to "authenticated";

grant delete on table "public"."staff" to "service_role";

grant insert on table "public"."staff" to "service_role";

grant references on table "public"."staff" to "service_role";

grant select on table "public"."staff" to "service_role";

grant trigger on table "public"."staff" to "service_role";

grant truncate on table "public"."staff" to "service_role";

grant update on table "public"."staff" to "service_role";

grant delete on table "public"."staff_assignments" to "anon";

grant insert on table "public"."staff_assignments" to "anon";

grant references on table "public"."staff_assignments" to "anon";

grant select on table "public"."staff_assignments" to "anon";

grant trigger on table "public"."staff_assignments" to "anon";

grant truncate on table "public"."staff_assignments" to "anon";

grant update on table "public"."staff_assignments" to "anon";

grant delete on table "public"."staff_assignments" to "authenticated";

grant insert on table "public"."staff_assignments" to "authenticated";

grant references on table "public"."staff_assignments" to "authenticated";

grant select on table "public"."staff_assignments" to "authenticated";

grant trigger on table "public"."staff_assignments" to "authenticated";

grant truncate on table "public"."staff_assignments" to "authenticated";

grant update on table "public"."staff_assignments" to "authenticated";

grant delete on table "public"."staff_assignments" to "postgres";

grant insert on table "public"."staff_assignments" to "postgres";

grant references on table "public"."staff_assignments" to "postgres";

grant select on table "public"."staff_assignments" to "postgres";

grant trigger on table "public"."staff_assignments" to "postgres";

grant truncate on table "public"."staff_assignments" to "postgres";

grant update on table "public"."staff_assignments" to "postgres";

grant delete on table "public"."staff_assignments" to "service_role";

grant insert on table "public"."staff_assignments" to "service_role";

grant references on table "public"."staff_assignments" to "service_role";

grant select on table "public"."staff_assignments" to "service_role";

grant trigger on table "public"."staff_assignments" to "service_role";

grant truncate on table "public"."staff_assignments" to "service_role";

grant update on table "public"."staff_assignments" to "service_role";

grant delete on table "public"."tenants" to "anon";

grant insert on table "public"."tenants" to "anon";

grant references on table "public"."tenants" to "anon";

grant select on table "public"."tenants" to "anon";

grant trigger on table "public"."tenants" to "anon";

grant truncate on table "public"."tenants" to "anon";

grant update on table "public"."tenants" to "anon";

grant delete on table "public"."tenants" to "authenticated";

grant insert on table "public"."tenants" to "authenticated";

grant references on table "public"."tenants" to "authenticated";

grant select on table "public"."tenants" to "authenticated";

grant trigger on table "public"."tenants" to "authenticated";

grant truncate on table "public"."tenants" to "authenticated";

grant update on table "public"."tenants" to "authenticated";

grant delete on table "public"."tenants" to "service_role";

grant insert on table "public"."tenants" to "service_role";

grant references on table "public"."tenants" to "service_role";

grant select on table "public"."tenants" to "service_role";

grant trigger on table "public"."tenants" to "service_role";

grant truncate on table "public"."tenants" to "service_role";

grant update on table "public"."tenants" to "service_role";

grant delete on table "public"."unit_occupants" to "anon";

grant insert on table "public"."unit_occupants" to "anon";

grant references on table "public"."unit_occupants" to "anon";

grant select on table "public"."unit_occupants" to "anon";

grant trigger on table "public"."unit_occupants" to "anon";

grant truncate on table "public"."unit_occupants" to "anon";

grant update on table "public"."unit_occupants" to "anon";

grant delete on table "public"."unit_occupants" to "authenticated";

grant insert on table "public"."unit_occupants" to "authenticated";

grant references on table "public"."unit_occupants" to "authenticated";

grant select on table "public"."unit_occupants" to "authenticated";

grant trigger on table "public"."unit_occupants" to "authenticated";

grant truncate on table "public"."unit_occupants" to "authenticated";

grant update on table "public"."unit_occupants" to "authenticated";

grant delete on table "public"."unit_occupants" to "postgres";

grant insert on table "public"."unit_occupants" to "postgres";

grant references on table "public"."unit_occupants" to "postgres";

grant select on table "public"."unit_occupants" to "postgres";

grant trigger on table "public"."unit_occupants" to "postgres";

grant truncate on table "public"."unit_occupants" to "postgres";

grant update on table "public"."unit_occupants" to "postgres";

grant delete on table "public"."unit_occupants" to "service_role";

grant insert on table "public"."unit_occupants" to "service_role";

grant references on table "public"."unit_occupants" to "service_role";

grant select on table "public"."unit_occupants" to "service_role";

grant trigger on table "public"."unit_occupants" to "service_role";

grant truncate on table "public"."unit_occupants" to "service_role";

grant update on table "public"."unit_occupants" to "service_role";

grant delete on table "public"."units" to "anon";

grant insert on table "public"."units" to "anon";

grant references on table "public"."units" to "anon";

grant select on table "public"."units" to "anon";

grant trigger on table "public"."units" to "anon";

grant truncate on table "public"."units" to "anon";

grant update on table "public"."units" to "anon";

grant delete on table "public"."units" to "authenticated";

grant insert on table "public"."units" to "authenticated";

grant references on table "public"."units" to "authenticated";

grant select on table "public"."units" to "authenticated";

grant trigger on table "public"."units" to "authenticated";

grant truncate on table "public"."units" to "authenticated";

grant update on table "public"."units" to "authenticated";

grant delete on table "public"."units" to "service_role";

grant insert on table "public"."units" to "service_role";

grant references on table "public"."units" to "service_role";

grant select on table "public"."units" to "service_role";

grant trigger on table "public"."units" to "service_role";

grant truncate on table "public"."units" to "service_role";

grant update on table "public"."units" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


  create policy "Enable authenticated org owners to delete their org"
  on "public"."organizations"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable authenticated users update their own organization"
  on "public"."organizations"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable insert for authenticated users only"
  on "public"."organizations"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable users to view their own data only"
  on "public"."organizations"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Enable authenticated users select their profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable authenticated users to delete their profile"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable authenticated users update their profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable insert for authenticated users only"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable owner delete own property"
  on "public"."properties"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = properties.organization_id) AND (organizations.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable owner to see own properties"
  on "public"."properties"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = properties.organization_id) AND (organizations.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable owner update own property"
  on "public"."properties"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = properties.organization_id) AND (organizations.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable owners to insert own property"
  on "public"."properties"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.organizations
  WHERE ((organizations.id = properties.organization_id) AND (organizations.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable authenticated owner insert row"
  on "public"."units"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM (public.properties p
     JOIN public.organizations o ON ((o.id = p.organization_id)))
  WHERE ((p.id = units.property_id) AND (o.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable authenticated owners & tenants to select"
  on "public"."units"
  as permissive
  for select
  to authenticated
using (((EXISTS ( SELECT 1
   FROM (public.properties p
     JOIN public.organizations o ON ((o.id = p.organization_id)))
  WHERE ((p.id = units.property_id) AND (o.owner_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM public.unit_occupants uo
  WHERE ((uo.unit_id = units.id) AND (uo.tenant_id = ( SELECT auth.uid() AS uid)) AND (uo.left_at IS NULL))))));



  create policy "Enable authenticated owners delete row"
  on "public"."units"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.properties p
     JOIN public.organizations o ON ((o.id = p.organization_id)))
  WHERE ((p.id = units.property_id) AND (o.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable authenticated owners update row"
  on "public"."units"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.properties p
     JOIN public.organizations o ON ((o.id = p.organization_id)))
  WHERE ((p.id = units.property_id) AND (o.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable authenticated users select their role"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable insert for authenticated users only"
  on "public"."user_roles"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = id));



