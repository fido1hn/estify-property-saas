# Supabase Overview (Estify)

Key files and locations for Supabase work in this repo:

- `supabase/config.toml` defines local CLI config and auth/storage settings.
- `supabase/migrations/20260202173656_init_tables.sql` is the current schema migration.
- `types/database.types.ts` contains generated TypeScript types for the schema.
- `services/supabaseClient.ts` initializes the typed Supabase client for the app.
- `seed-db.ts` seeds data using the service role key.
- `services/` contains all app query helpers (`apiProperties`, `apiInvoices`, `apiMaintenance`, `apiMessages`, `apiStaff`, `apiTenants`, `apiOrganization`, `apiAnalytics`).
- `pages/auth/` and `contexts/AuthContext.tsx` handle Supabase auth flows.

Environment variables (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY` (used only in `seed-db.ts`)
