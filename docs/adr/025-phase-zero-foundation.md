# ADR 025: Repository foundation and first ORM migration

Status: provisional, pending maintainer review. The initial migration and Prisma create/read/delete probe passed against local PostgreSQL 18 on 2026-10-12.

The original architecture chooses Next.js, NestJS, PostgreSQL/Prisma, and pnpm. The newer phase plan narrows initial tenancy to one institution. We use a pnpm workspace with one Next.js web app and one NestJS API. No shared package exists until there are real consumers.

Prisma 6 is the initial ORM. Its committed migration creates only `foundation_probe`, a temporary technical table for verifying migration and create/read/delete. The API liveness endpoint does not depend on PostgreSQL; readiness queries it. Application domain tables and transaction conventions remain Phase 1 work. [ADR 026](026-postgresql-job-queue.md) selects the job transport; the transactional outbox and idempotent domain handlers remain unimplemented.

The old architecture draft's multi-organization schema and module-plugin design need explicit reconciliation with the newer single-institution plan before related implementation.
