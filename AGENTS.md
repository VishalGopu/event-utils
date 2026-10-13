# Agent working rules

- Use [docs/CONTEXT.md](docs/CONTEXT.md) to find only the phase, ADR, module, and assigned issue relevant to the task. The current scaffold is Phase 0; later features in the roadmap are proposals.
- Setup and check commands are in [INSTRUCTIONS.md](INSTRUCTIONS.md). Run relevant `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and database checks when available. Report exact passes, failures, and unavailable services.
- Keep API composition and the worker entrypoint in `apps/api`, and web UI in `apps/web`. Prisma owns application tables in `public`; pg-boss owns its `pgboss` schema. Add shared contracts or UI only with real cross-workspace consumers. Preserve the phase plan's server-side event authorization, transaction-backed invariants, historical versioning, and durable-effect rules when implementing those features.
- Change only the assigned scope and preserve unrelated edits. Never rewrite applied migrations or hand-edit `pnpm-lock.yaml`.
- Before parallel work, agree on outcome, acceptance, dependencies, and write scope. Coordinate shared contracts, schema/migrations, root config, lockfile, and UI composition. Use a separate branch/worktree and isolated database, queue, and ports; test integrated changes.
- At handoff, record branch, base/verified commit, completed and uncommitted work, validation, blockers, and next concrete action in the issue or PR. Do not append to a global status log.
