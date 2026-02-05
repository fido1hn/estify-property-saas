---
name: supabase-estify
description: Project-specific Supabase workflows for Estify Property SaaS. Use when modifying Supabase schema or migrations, adding RLS policies, adjusting Supabase client queries, managing auth/storage, seeding data, or interpreting `supabase/` config and `types/database.types.ts` in this repo.
---

# Supabase (Estify)

## Quick start

Read `references/overview.md` for the Supabase file map and the core entry points.

## Core workflow

1. Identify the task type and open the matching reference file.
2. When changing schema, update the SQL migration in `supabase/migrations/` and ensure `types/database.types.ts` stays in sync.
3. When writing or reviewing queries, follow existing patterns in `services/` and consult the `$supabase-postgres-best-practices` skill for performance and indexing guidance.
4. When touching security, remember all tables have RLS enabled and policies must be created to allow expected access.

## References

- `references/overview.md`
- `references/schema.md`
- `references/client-usage.md`

## Notes

- RLS is enabled on every table in the current migration, but no policies are defined there. Add policies explicitly when you need data access.
- Prefer reusing existing query shapes in `services/` to keep the app consistent with the current data model.
