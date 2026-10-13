# event-utils

An open-source foundation for a self-hosted hackathon and club-event platform. The intended product serves one institution and multiple events. **Current status:** a Phase 0 scaffold with a placeholder Next.js page, NestJS health and readiness endpoints, an initial Prisma/PostgreSQL migration, and a PostgreSQL-backed worker entrypoint. Authentication, event management, registration, and judging are planned, not implemented.

The original [architecture draft](docs/architecture.md) records early club-event ideas and ADRs. The [phase-wise implementation plan](PHASE_WISE_IMPLEMENTATION.md) is the proposed delivery sequence. Reconcile differences through an ADR before implementing dependent work.

## Setup

Use Node.js 22.22.1 (`.nvmrc`) and pnpm 9.15.9 (`packageManager`).

```sh
corepack prepare pnpm@9.15.9 --activate
corepack pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your local PostgreSQL URL and URL-encoded password.
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:check
corepack pnpm worker:check
corepack pnpm dev
```

Create a PostgreSQL database named `event_utils` owned by your local project role before migrating. The role must be able to create and migrate the queue's `pgboss` schema. The API and worker read `apps/api/.env`; do not commit it. `http://localhost:3000` serves the placeholder page, `http://localhost:4000/health` is liveness, and `http://localhost:4000/ready` checks the database. Run `corepack pnpm worker` in a separate terminal and stop it with Ctrl-C. See [local development](INSTRUCTIONS.md) for the current verification record.

Checks: `corepack pnpm lint`, `corepack pnpm format:check`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`.

## Layout and roadmap

- `apps/web`: Next.js App Router placeholder.
- `apps/api`: NestJS HTTP entrypoint, Prisma schema and migration, pg-boss worker, and database probes.
- `docs/CONTEXT.md`: task context entry point.
- `docs/architecture.md`: original architecture and early ADR log.
- `PHASE_WISE_IMPLEMENTATION.md`: proposed phase gates and domain invariants.

The Prisma `foundation_probe` table and `phase0-compatibility` queue verify infrastructure only; they are not domain models. pg-boss owns and migrates its isolated `pgboss` schema. The next implementation slice is Phase 1 identity, permissions, configuration, and transactional outbox design. Shared contracts and reusable UI packages will be added when applications actually consume them. Later feature phases remain proposals.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), choose or open an issue with outcome and acceptance criteria, and send a focused PR. Security reports follow [SECURITY.md](SECURITY.md). The [code of conduct](CODE_OF_CONDUCT.md) applies to project spaces.

## License and attribution

The existing [LICENSE](LICENSE) is GNU AGPL version 3 and remains unchanged. Original project attribution remains in the architecture draft and Git history. Maintainers should confirm copyright notice placement and the licensing intent for the newer phase plan; this change does not relicense existing work.
