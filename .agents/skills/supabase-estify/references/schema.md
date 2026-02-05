# Schema Summary

Source of truth: `supabase/migrations/20260202173656_init_tables.sql` and `types/database.types.ts`.

Enums:

- `buidling_type` (note the typo in name): `commercial`, `residential`
- `invoice_status`: `draft`, `issued`, `paid`, `overdue`
- `maintenance_requests_priority`: `low`, `medium`, `high`, `urgent`
- `maintenance_requests_status`: `open`, `in_progress`, `resolved`, `closed`
- `staff_role`: `security`, `cleaning`, `electrical`, `manager`, `plumbing`
- `staff_status`: `active`, `inactive`
- `tenant_status`: `active`, `terminated`, `pending`
- `user_role`: `admin`, `owner`, `tenant`, `staff`

Tables (all with RLS enabled):

| Table | Primary key | Notable columns |
| --- | --- | --- |
| `organizations` | `id` | `name`, `created_at` |
| `profiles` | `id` | `organization_id`, `full_name`, `email`, `avatar_url` |
| `user_roles` | `user_id` | `user_role`, `created_at` |
| `properties` | `id` | `organization_id`, `name`, `address`, `image_url`, `total_units`, `type` |
| `units` | `id` | `property_id`, `unit_number` (unique per property) |
| `tenants` | `user_id` | `unit_id`, `lease_start`, `lease_end`, `status` |
| `staff` | `user_id` | `phone_number`, `role`, `status` |
| `maintenance_requests` | `id` | `organization_id`, `property_id`, `unit_id`, `created_by`, `assigned_staff_id`, `title`, `description`, `status`, `priority` |
| `maintenance_events` | `id` | `request_id`, `from_status`, `to_status`, `changed_by` |
| `messages` | `id` | `sender_id`, `receiver_id`, `content`, `is_read` |
| `invoices` | `id` | `organization_id`, `tenant_id`, `property_id`, `unit_id`, `amount_kobo`, `due_date`, `paid_at`, `status` |
| `payments` | `id` | `invoice_id`, `amount_kobo`, `payment_method`, `paid_at` |

Key relationships:

- `profiles.id` references `auth.users.id`.
- `profiles.organization_id` references `organizations.id`.
- `properties.organization_id` references `organizations.id`.
- `units.property_id` references `properties.id`.
- `tenants.user_id` references `profiles.id`.
- `tenants.unit_id` references `units.id`.
- `staff.user_id` references `profiles.id`.
- `maintenance_requests.organization_id` references `organizations.id`.
- `maintenance_requests.property_id` references `properties.id`.
- `maintenance_requests.unit_id` references `units.id`.
- `maintenance_requests.created_by` references `profiles.id`.
- `maintenance_requests.assigned_staff_id` references `profiles.id`.
- `maintenance_events.request_id` references `maintenance_requests.id`.
- `maintenance_events.changed_by` references `profiles.id`.
- `invoices.organization_id` references `organizations.id`.
- `invoices.property_id` references `properties.id`.
- `invoices.tenant_id` references `profiles.id`.
- `invoices.unit_id` references `units.id`.
- `payments.invoice_id` references `invoices.id`.

RLS note:

- RLS is enabled on every table in the migration, but no policies are defined there. Add policies explicitly when access is required.
