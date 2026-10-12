# Local development

Use Node.js 22.22.1 and pnpm 9.15.9. PostgreSQL 16 or newer is expected; this workspace uses a local PostgreSQL 18 installation. Create a database named `event_utils` owned by your project role. The role needs access to that database but does not need `CREATEDB` once an administrator creates it.

From the repository root:

```sh
corepack prepare pnpm@9.15.9 --activate
corepack pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and replace REPLACE_ME with your URL-encoded local password.
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:check
corepack pnpm dev
```

Web: <http://localhost:3000>. API liveness: <http://localhost:4000/health>. Database readiness: <http://localhost:4000/ready>. Stop development with Ctrl-C. The API loads its untracked `.env` file on startup; Prisma CLI loads it for migrations. The database check inserts, reads, and deletes one temporary probe row.

Checks from the root: `corepack pnpm lint`, `corepack pnpm format:check`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`.

Verification record (2026-10-12): PostgreSQL is reachable on the host; `temp` has `CREATEDB`; `event_utils` was created under that role. Prisma client generation, migration deployment, and the create/read/delete database probe passed. Lint, formatting, typecheck, build, and the API health test passed. The full `dev` command and browser page have not yet been checked.
