# Property Management SaaS

[![Supabase](https://img.shields.io/badge/Supabase-2E7D32?logo=supabase&logoColor=white)](https://supabase.com)
[![React](https://img.shields.io/badge/React-1E293B?logo=react&logoColor=61DAFB)](https://react.dev)

A modern property management platform built with React, Vite, and Supabase. Manage organizations, properties, units, tenants, staff, maintenance, and billing from a single dashboard.

## Tech Stack
- React + TypeScript (Vite)
- Supabase (Auth, Postgres, RLS, Storage)
- React Query
- Tailwind CSS

## Features
- Authenticated onboarding flow for owners, tenants, and staff
- Organization creation for property owners
- Property CRUD with images and building type
- Unit management per property
- Role-based navigation and route protection
- Owner-scoped data access via RLS policies
- Tenant onboarding via invites (planned)
- Maintenance request tracking (schema-ready)
- Invoicing and payments (schema-ready)
- Analytics-ready queries for portfolio KPIs

## Quick Start

1. Install dependencies
```bash
pnpm install
```

2. Create your env file
```bash
cp .env.example .env
```

3. Fill in Supabase env vars in `.env`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
```

4. Run the app
```bash
pnpm dev
```

The app will be available at `http://localhost:5173` by default.

## Database & Auth

- Supabase schema and policies live in `supabase/migrations/`.
- Generated types live in `types/database.types.ts`.
- The client is initialized in `services/supabaseClient.ts`.

## Local Supabase (CLI)

### Requirements
- Docker Desktop running (Supabase local stack uses Docker)
- Supabase CLI installed

Install the CLI (one option):
```bash
pnpm add -g supabase
```

### Start the local stack
From the project root:
```bash
supabase start
```

This will start local containers for Auth, Postgres, Storage, and Studio.

### Set local env values
After `supabase start`, copy the local API URL and anon key from the CLI output (or run `supabase status`), then update `.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
```

### Run the app against local Supabase
```bash
pnpm dev
```

### Useful CLI commands
```bash
supabase status      # show local URLs/keys
supabase db reset    # reset and re-apply migrations/seed (destructive)
supabase stop        # stop local containers
```

### Optional: Seed Data
Seeding uses the service role key. Make sure `VITE_SUPABASE_SERVICE_ROLE_KEY` is set.
```bash
pnpm seed
```

## Scripts
```bash
pnpm dev       # start dev server
pnpm build     # production build
pnpm preview   # preview build
pnpm seed      # seed database (requires service role key)
```
