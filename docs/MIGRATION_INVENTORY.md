# Migration inventory (Phase 0)

## MySQL tables (portfolio)

Source: `sql/portfolio-bkp-20250718.sql` and follow-on migrations.

- admin_sections, admin_section_permissions
- automatic_update_capabilities, automatic_update_client_performance
- automatic_update_logs (API uses extended columns; see Postgres schema)
- backup_files
- categories
- contact_queries
- domains (+ supabase_url, supabase_anon_key from `sql/add-supabase-to-domains.sql`)
- domains_technologies
- dynamic_sections (`sql/create-dynamic-sections-table.sql`)
- menus (`sql/create-menus-table.sql`)
- niche
- portfolio_config
- project_images
- projects
- recent_automatic_activity
- settings (setting_key, setting_value)
- shared_hosting_clients, shared_hosting_notifications, shared_hosting_updates, shared_hosting_update_logs, shared_hosting_update_stats
- tech_skills
- theme_clients, theme_updates, theme_update_logs, theme_update_notifications, theme_update_stats
- users

## Supabase Storage buckets

From `src/config/supabase.js` / `api/src/lib/supabase.ts`:

- images, avatars, documents, domains

## Supabase Postgres (legacy client-side)

Tables/views still referenced from CRA via `supabase.from`: theme_*, shared_hosting_*, automatic_update_*, portfolio_config, settings, etc. Target: single Vercel Postgres + API routes; CRA stops using Supabase JS for data after Phase 5.

## Source of truth during cutover

- Relational data: migrate from **local MySQL** into Vercel Postgres via `scripts/migrate-mysql-to-vercel-postgres.js`.
- Files: `scripts/migrate-supabase-storage-to-vercel-blob.js` then URL remap.

## Phase 6 — Vercel projects

- **CRA (repo root):** Vercel project with root directory `.`, build `npm run build:vercel`, output `build`. Env: `REACT_APP_API_URL` only (no `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN` / secrets).
- **API (`api/`):** Separate Vercel project with root `api`, framework Next.js. Env: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `JWT_SECRET`, `PORTFOLIO_OWNER_EMAIL`, etc. CORS: `api/next.config.js` allows `GET, POST, PUT, PATCH, DELETE` on `/api/*`.
- Attach custom domains to the **frontend** project; allow those origins on the API if you tighten CORS beyond `*`.

## Phase 7 — Cutover checklist

1. Apply `sql/postgres/schema.sql` to staging Postgres; run `npm run migrate:mysql-to-pg`; verify row counts.
2. Run `npm run migrate:supabase-to-blob`, then `npm run remap:urls` (after reviewing `migration-blob-url-map.jsonl`).
3. Deploy API, then CRA; smoke-test auth, projects, gallery, settings, backups, theme/shared-hosting admin flows.
4. Monitor Vercel logs; then revoke Supabase keys and decommission MySQL when satisfied.
