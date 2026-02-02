create type "public"."buidling_type" as enum ('commercial', 'residential');

create type "public"."invoice_status" as enum ('draft', 'issued', 'paid', 'overdue');

create type "public"."maintenance_requests_priority" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."maintenance_requests_status" as enum ('open', 'in_progress', 'resolved', 'closed');

create type "public"."staff_role" as enum ('security', 'cleaning', 'electrical', 'manager', 'plumbing');

create type "public"."staff_status" as enum ('active', 'inactive');

create type "public"."tenant_status" as enum ('active', 'terminated', 'pending');

create type "public"."user_role" as enum ('admin', 'owner', 'tenant', 'staff');


  create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "organization_id" uuid not null,
    "tenant_id" uuid not null,
    "property_id" uuid not null,
    "unit_id" uuid not null,
    "amount_kobo" bigint not null,
    "due_date" timestamp with time zone not null,
    "paid_at" timestamp with time zone,
    "status" public.invoice_status not null
      );


alter table "public"."invoices" enable row level security;


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
    "organization_id" uuid not null,
    "property_id" uuid not null,
    "unit_id" uuid not null,
    "created_by" uuid not null,
    "assigned_staff_id" uuid not null,
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
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."organizations" enable row level security;


  create table "public"."payments" (
    "id" uuid not null default gen_random_uuid(),
    "paid_at" timestamp with time zone not null default now(),
    "invoice_id" uuid not null,
    "amount_kobo" bigint not null,
    "payment_method" text not null
      );


alter table "public"."payments" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "full_name" text not null,
    "email" text not null,
    "avatar_url" text
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
    "type" public.buidling_type not null
      );


alter table "public"."properties" enable row level security;


  create table "public"."staff" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "phone_number" text not null,
    "role" public.staff_role not null,
    "status" public.staff_status not null
      );


alter table "public"."staff" enable row level security;


  create table "public"."tenants" (
    "user_id" uuid not null,
    "unit_id" uuid not null,
    "lease_start" timestamp with time zone not null,
    "lease_end" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now(),
    "status" public.tenant_status not null
      );


alter table "public"."tenants" enable row level security;


  create table "public"."units" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "property_id" uuid not null,
    "unit_number" smallint not null
      );


alter table "public"."units" enable row level security;


  create table "public"."user_roles" (
    "user_id" uuid not null,
    "user_role" public.user_role not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX maintenance_events_pkey ON public.maintenance_events USING btree (id);

CREATE UNIQUE INDEX maintenance_requests_pkey ON public.maintenance_requests USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX properties_pkey ON public.properties USING btree (id);

CREATE UNIQUE INDEX staff_pkey ON public.staff USING btree (user_id);

CREATE UNIQUE INDEX tenants_pkey ON public.tenants USING btree (user_id);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE UNIQUE INDEX units_property_unit_unique ON public.units USING btree (property_id, unit_number);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (user_id);

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."maintenance_events" add constraint "maintenance_events_pkey" PRIMARY KEY using index "maintenance_events_pkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_pkey" PRIMARY KEY using index "maintenance_requests_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "public"."staff" add constraint "staff_pkey" PRIMARY KEY using index "staff_pkey";

alter table "public"."tenants" add constraint "tenants_pkey" PRIMARY KEY using index "tenants_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."invoices" add constraint "invoices_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_organization_id_fkey";

alter table "public"."invoices" add constraint "invoices_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_property_id_fkey";

alter table "public"."invoices" add constraint "invoices_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."invoices" validate constraint "invoices_tenant_id_fkey";

alter table "public"."invoices" add constraint "invoices_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_unit_id_fkey";

alter table "public"."maintenance_events" add constraint "maintenance_events_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."maintenance_events" validate constraint "maintenance_events_changed_by_fkey";

alter table "public"."maintenance_events" add constraint "maintenance_events_request_id_fkey" FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."maintenance_events" validate constraint "maintenance_events_request_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_assigned_staff_id_fkey" FOREIGN KEY (assigned_staff_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_assigned_staff_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_created_by_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_organization_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_property_id_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_unit_id_fkey";

alter table "public"."payments" add constraint "payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_invoice_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_organization_id_fkey";

alter table "public"."properties" add constraint "properties_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_organization_id_fkey";

alter table "public"."staff" add constraint "staff_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."staff" validate constraint "staff_user_id_fkey";

alter table "public"."tenants" add constraint "tenants_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tenants" validate constraint "tenants_unit_id_fkey";

alter table "public"."tenants" add constraint "tenants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tenants" validate constraint "tenants_user_id_fkey";

alter table "public"."units" add constraint "units_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."units" validate constraint "units_property_id_fkey";

alter table "public"."units" add constraint "units_property_unit_unique" UNIQUE using index "units_property_unit_unique";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

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

grant delete on table "public"."invoices" to "postgres";

grant insert on table "public"."invoices" to "postgres";

grant references on table "public"."invoices" to "postgres";

grant select on table "public"."invoices" to "postgres";

grant trigger on table "public"."invoices" to "postgres";

grant truncate on table "public"."invoices" to "postgres";

grant update on table "public"."invoices" to "postgres";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

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

grant delete on table "public"."maintenance_events" to "postgres";

grant insert on table "public"."maintenance_events" to "postgres";

grant references on table "public"."maintenance_events" to "postgres";

grant select on table "public"."maintenance_events" to "postgres";

grant trigger on table "public"."maintenance_events" to "postgres";

grant truncate on table "public"."maintenance_events" to "postgres";

grant update on table "public"."maintenance_events" to "postgres";

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

grant delete on table "public"."maintenance_requests" to "postgres";

grant insert on table "public"."maintenance_requests" to "postgres";

grant references on table "public"."maintenance_requests" to "postgres";

grant select on table "public"."maintenance_requests" to "postgres";

grant trigger on table "public"."maintenance_requests" to "postgres";

grant truncate on table "public"."maintenance_requests" to "postgres";

grant update on table "public"."maintenance_requests" to "postgres";

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

grant delete on table "public"."messages" to "postgres";

grant insert on table "public"."messages" to "postgres";

grant references on table "public"."messages" to "postgres";

grant select on table "public"."messages" to "postgres";

grant trigger on table "public"."messages" to "postgres";

grant truncate on table "public"."messages" to "postgres";

grant update on table "public"."messages" to "postgres";

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

grant delete on table "public"."organizations" to "postgres";

grant insert on table "public"."organizations" to "postgres";

grant references on table "public"."organizations" to "postgres";

grant select on table "public"."organizations" to "postgres";

grant trigger on table "public"."organizations" to "postgres";

grant truncate on table "public"."organizations" to "postgres";

grant update on table "public"."organizations" to "postgres";

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

grant delete on table "public"."payments" to "postgres";

grant insert on table "public"."payments" to "postgres";

grant references on table "public"."payments" to "postgres";

grant select on table "public"."payments" to "postgres";

grant trigger on table "public"."payments" to "postgres";

grant truncate on table "public"."payments" to "postgres";

grant update on table "public"."payments" to "postgres";

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

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

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

grant delete on table "public"."properties" to "postgres";

grant insert on table "public"."properties" to "postgres";

grant references on table "public"."properties" to "postgres";

grant select on table "public"."properties" to "postgres";

grant trigger on table "public"."properties" to "postgres";

grant truncate on table "public"."properties" to "postgres";

grant update on table "public"."properties" to "postgres";

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

grant delete on table "public"."staff" to "postgres";

grant insert on table "public"."staff" to "postgres";

grant references on table "public"."staff" to "postgres";

grant select on table "public"."staff" to "postgres";

grant trigger on table "public"."staff" to "postgres";

grant truncate on table "public"."staff" to "postgres";

grant update on table "public"."staff" to "postgres";

grant delete on table "public"."staff" to "service_role";

grant insert on table "public"."staff" to "service_role";

grant references on table "public"."staff" to "service_role";

grant select on table "public"."staff" to "service_role";

grant trigger on table "public"."staff" to "service_role";

grant truncate on table "public"."staff" to "service_role";

grant update on table "public"."staff" to "service_role";

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

grant delete on table "public"."tenants" to "postgres";

grant insert on table "public"."tenants" to "postgres";

grant references on table "public"."tenants" to "postgres";

grant select on table "public"."tenants" to "postgres";

grant trigger on table "public"."tenants" to "postgres";

grant truncate on table "public"."tenants" to "postgres";

grant update on table "public"."tenants" to "postgres";

grant delete on table "public"."tenants" to "service_role";

grant insert on table "public"."tenants" to "service_role";

grant references on table "public"."tenants" to "service_role";

grant select on table "public"."tenants" to "service_role";

grant trigger on table "public"."tenants" to "service_role";

grant truncate on table "public"."tenants" to "service_role";

grant update on table "public"."tenants" to "service_role";

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

grant delete on table "public"."units" to "postgres";

grant insert on table "public"."units" to "postgres";

grant references on table "public"."units" to "postgres";

grant select on table "public"."units" to "postgres";

grant trigger on table "public"."units" to "postgres";

grant truncate on table "public"."units" to "postgres";

grant update on table "public"."units" to "postgres";

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

grant delete on table "public"."user_roles" to "postgres";

grant insert on table "public"."user_roles" to "postgres";

grant references on table "public"."user_roles" to "postgres";

grant select on table "public"."user_roles" to "postgres";

grant trigger on table "public"."user_roles" to "postgres";

grant truncate on table "public"."user_roles" to "postgres";

grant update on table "public"."user_roles" to "postgres";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


