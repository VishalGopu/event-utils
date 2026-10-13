# ADR 026: Use pg-boss for PostgreSQL-backed jobs

Status: accepted for the Phase 0 compatibility foundation on 2026-10-12.

Use pg-boss 12 with the same PostgreSQL database as the application. It provides database-backed claims, retries, completion state, and graceful worker shutdown without introducing a second infrastructure service. The compatibility check passed enqueue, first claim, intentional failure, retry claim, completion, and graceful shutdown against PostgreSQL 18.

pg-boss owns the isolated `pgboss` schema and its versioned migrations. Prisma owns application tables in `public`. Contributors must not model or hand-edit pg-boss tables through Prisma. A deployment database role currently needs permission to create and migrate the queue schema; separating runtime and migration privileges is deferred until deployment hardening.

This decision selects the job transport. It does not implement the Phase 1 transactional outbox, idempotent domain handlers, failure visibility, or administrative retry controls.
