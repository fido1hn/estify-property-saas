# Client Usage Patterns

Supabase client initialization:

- `services/supabaseClient.ts` creates a typed client with `createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`.
- The app expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vite env.

Auth flows:

- `pages/auth/signup.tsx` uses `supabase.auth.signUp` and inserts into `organizations`, `profiles`, and `user_roles`.
- `pages/auth/login.tsx` uses `supabase.auth.signInWithPassword`.
- `contexts/AuthContext.tsx` uses `supabase.auth.getSession`, `supabase.auth.onAuthStateChange`, and `supabase.auth.getUser`.

Query helpers:

- All data access is centralized in `services/api*.ts` files. Follow their patterns for filtering, sorting, pagination, and error handling.
- Most queries use `.select()` and return `data` with simple error handling; avoid changing these shapes unless you update all callers.

Storage:

- Property images are uploaded to the `property-images` bucket.
- Public URLs are built as `${supabaseUrl}/storage/v1/object/public/property-images/${imageName}` in `services/apiProperties.ts`.
- Upload flow: create row in `properties`, upload to storage, rollback row if upload fails.

Seeding:

- `seed-db.ts` uses `VITE_SUPABASE_SERVICE_ROLE_KEY` and should only run in trusted environments.
- It clears and repopulates data for `organizations`, `profiles`, `user_roles`, `properties`, `units`, `tenants`, `maintenance_requests`, `maintenance_events`, `invoices`, `payments`, and `messages`.
