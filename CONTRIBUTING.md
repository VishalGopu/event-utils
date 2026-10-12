# Contributing

Start with [local setup](INSTRUCTIONS.md). Read [docs/CONTEXT.md](docs/CONTEXT.md) and the part of the phase plan relevant to your issue. The current code is only a Phase 0 scaffold.

## Issue to PR

1. Open or claim an issue that states outcome, acceptance criteria, dependencies, and intended write scope. Coordinate changes to shared contracts, migrations, lockfile, root configuration, and UI composition before editing.
2. Work on a short-lived branch in a separate worktree or clone. Give each worktree its own PostgreSQL database, queue data, and ports through `POSTGRES_PORT`, `DATABASE_URL`, and app port settings.
3. Make focused changes. Propose shared contract changes in a small PR before dependent implementations. Do not rename or format unrelated files.
4. Run relevant checks and list exact results in the PR. Test combined changes after integration; a clean merge alone does not prove behavior.
5. Request review. A maintainer should check the user flow, authorization and data boundaries, migration safety, documentation, and validation evidence. Resolve review comments before merge.

## Migrations and dependencies

Add forward migrations; never rewrite a migration that has been applied by others. Describe data compatibility and recovery for material schema changes. Coordinate schema composition and migration order. Use pnpm for dependency changes and commit its generated lockfile; never hand-edit lockfile conflicts. Explain why a new dependency is needed and its runtime impact.

Keep credentials out of Git. Report vulnerabilities privately via [SECURITY.md](SECURITY.md). Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Maintainer GitHub settings

Before accepting contributions, maintainers should protect `main` in GitHub settings: require pull requests, an appropriate reviewer approval, passing CI, and validation against the current base branch. Restrict force pushes and branch deletion. These are repository settings; this file and CI workflow do not activate them. Add a merge queue only if the volume of simultaneous PRs makes it useful. Confirm private vulnerability reporting and a conduct-report contact in the same setup pass.
