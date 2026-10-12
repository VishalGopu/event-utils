# Hackathon Platform — Phase-wise Implementation

**Status:** proposed implementation plan; checkboxes do not indicate completed work.
**Scope:** combined hackathon platform and event-utils feature plan.
**Release approach:** complete the free hackathon lifecycle first; add operational features and payments afterward.

## 1. Product and architecture baseline

One self-hosted installation serves one institution and many events. Events can have independent branding, configuration, organizers, judges, registrations, and results. Clubs are groups within the institution; separate customer tenancy is outside the initial scope.

Build a modular monolith with one frontend, one backend codebase, and one database. Background workers run the backend's job handlers in a separate process. Modules are ordinary business features; providers are external service adapters; strategies are internal choices such as problem-release timing.

### Proposed stack

| Area | Baseline | Decision to verify in Phase 0 |
|---|---|---|
| Frontend | Next.js + TypeScript | UI library and accessible component conventions |
| Backend | NestJS + TypeScript | Fastify adapter compatibility with required integrations |
| Runtime/tooling | Node.js + pnpm workspaces | Pin a supported runtime and package-manager version |
| Database | PostgreSQL | ORM, migrations, constraints, and transaction conventions |
| Background jobs | PostgreSQL-backed queue + transactional outbox | Select and test one queue library |
| Authentication | One provider initially; provider array in config | Maintained auth/session components; magic-link or OAuth adapter |
| Email | SMTP-compatible provider interface | Local capture service and production delivery adapter |
| Deployment | Docker Compose | Web, API, worker, database, and reverse proxy |

This table is a proposed baseline, not a compatibility claim. Record final choices in ADRs after the Phase 0 checks. Keep provider secrets in deployment secret configuration; store non-secret selections and event settings in the database.

### Repository structure

```text
apps/
  web/                    # participant, organizer, judge interfaces
  api/                    # application composition, HTTP, worker entrypoint
packages/
  contracts/              # API schemas, typed events, provider interfaces
  ui/                     # components and theme presets
modules/
  auth/
  events/
  registration/
  teams/
  problems/
  submissions/
  judging/
  notifications/
  certificates/           # introduced in Phase 7
  check-in/               # introduced in Phase 7
  payments/               # introduced in Phase 8
docs/
  adr/
  features/
.github/
  ISSUE_TEMPLATE/
  workflows/
```

Each module owns its data and exposes explicit public services. Other modules may call those services for immediate validation, but cannot write its tables or import private implementation details. Use durable events for asynchronous effects. Place shared platform settings, audit infrastructure, and outbox infrastructure in the API composition layer or a clearly named internal platform package; do not duplicate them across modules.

## 2. Phase overview

| Phase | Outcome | Depends on | Release |
|---|---|---|---|
| 0 | Reproducible repository and infrastructure | None | Foundation |
| 1 | Authentication, permissions, config, durable jobs | 0 | Foundation |
| 2 | Event dashboard and branded public pages | 1 | Foundation |
| 3 | Registration and team lifecycle | 2 | Core workflow |
| 4 | Problem statements and project submissions | 3 | Core workflow |
| 5 | Judging and published results | 4 | Complete workflow |
| 6 | Operational validation and self-host release | 5 | First usable release |
| 7 | Check-in, certificates, reusable events | 6 | Practical v1 |
| 8 | Optional paid registration | 6; integrates with 7 if installed | Practical v1 |
| 9 | Broader event reuse and contributor extensions | Proven core; relevant v1 features | Later |

Phases are completion gates, not calendar estimates. Move forward when the exit criteria pass. Phases 7 and 8 are independent extensions after Phase 6; neither should block free events.

## Phase 0 — Repository and infrastructure

**Goal:** a contributor can clone the repository and run a reproducible development environment.

### Implement

- [ ] Initialize workspaces, shared TypeScript configuration, linting, formatting, and pinned toolchain/lockfile.
- [ ] Scaffold web, API, and worker entrypoints; add database migrations.
- [ ] Select ORM and PostgreSQL job library through a small compatibility check: migrate, enqueue, claim a job, retry a failed job, and shut down cleanly.
- [ ] Add development Compose infrastructure: database and email capture. Document host-run and container-run application modes.
- [ ] Add environment examples and configuration validation; fail clearly when required settings are missing.
- [ ] Add structured logs, request identifiers, liveness/readiness checks, and graceful shutdown.
- [ ] Add CI for lint, types, builds, and the initial integration check against PostgreSQL.
- [ ] Add README, license/attribution, CONTRIBUTING, issue/PR templates, and an initial ADR explaining scope and stack.

### Deliverables and exit criteria

- [ ] Documented clean-clone commands start web and API, apply migrations, and run the worker.
- [ ] CI passes without private credentials or real participant data.
- [ ] Versions and supported environments are explicit; README distinguishes working features from planned ones.

## Phase 1 — Identity, permissions, configuration, and jobs

**Goal:** every later feature builds on consistent authorization and durable effects.

### Backend and data

- [ ] Create User, UserAuthIdentity, Session, InstitutionSettings, RoleAssignment, AuditEntry, and OutboxEvent models; integrate the queue's job storage.
- [ ] Implement one sign-in method, session expiry/logout, and invite-based role assignment using maintained auth/session primitives.
- [ ] Bootstrap the first installation admin through a protected setup command; never let the first public visitor claim admin.
- [ ] Define participant, organizer, judge, and installation-admin permissions, including event scope for future assignments.
- [ ] Store `auth.providers` as an array with per-provider enabled state. Account linking must require proof of identity ownership.
- [ ] Implement typed settings validation and one service used by setup and admin configuration.
- [ ] Implement audit records for role/config changes; redact credentials and sensitive payloads from logs.
- [ ] Persist important domain events in the same database transaction as the state change; dispatch to durable jobs with retries and idempotent handlers.
- [ ] Add email provider interface, templates, local capture, and delivery history. Treat delivery guarantees per adapter explicitly; do not promise exactly-once email through SMTP.

### Frontend

- [ ] Sign-in, logout, profile, forbidden/error states, and basic admin shell.
- [ ] Provider configuration and role/invitation screens, with secrets omitted from responses.
- [ ] Failed-job visibility and retry controls for admins.

### Exit criteria

- [ ] An unauthorized account cannot assign roles or access admin routes/API endpoints.
- [ ] Restarting the API/worker does not lose committed jobs; replay does not duplicate domain effects.
- [ ] Auth-provider disabling preserves identities and applies the explicit `kill_sessions` or `let_continue` policy.
- [ ] The last usable admin sign-in route cannot be disabled accidentally.

## Phase 2 — Events, public sites, and feature settings

**Goal:** organizers create independent branded events without changing code.

### Backend and data

- [ ] Create Event, EventRoleAssignment, EventSettings, ThemePreset, and EventFeatureConfig.
- [ ] Implement event creation/editing, unique slugs, publication, completion, and archival. Derive upcoming/ongoing labels from timestamps rather than creating conflicting lifecycle states.
- [ ] Store timezone, dates, registration/submission windows, and structured landing-page content.
- [ ] Resolve events through `/events/<slug>`; bind all event APIs to an authorized event context.
- [ ] Implement effective settings: installation capabilities constrain validated per-event choices. Features cannot select unavailable providers.
- [ ] Implement feature dependency validation. Disabling a feature blocks new activity while retaining authorized historical views/exports.
- [ ] Emit `event.published` and `event.archived` events and audit lifecycle/config changes.

### Frontend

- [ ] Organizer event picker and event-creation/settings screens.
- [ ] Public event index and landing pages: hero, description, schedule, rules, FAQs, sponsors, and registration CTA.
- [ ] Theme presets, logo/banner fields, editable tokens, and live preview.
- [ ] Render available routes/actions from effective settings; enforce the same rules on the server.

### Exit criteria

- [ ] Two events retain separate themes, organizers, settings, and public URLs.
- [ ] Draft events are not publicly exposed; archived events reject new activity.
- [ ] Changing an event ID or slug cannot grant access to another event's private records.
- [ ] Toggles preserve stored data and report incompatible dependencies clearly.

## Phase 3 — Forms, registration, participants, and teams

**Goal:** participants enroll and form valid teams; organizers manage eligibility.

### Backend and data

- [ ] Create FormDefinition/FormVersion, Registration, RegistrationAnswer, Team, TeamMembership, and TeamInvitation.
- [ ] Support typed text/select/checkbox/contact fields with server-side validation and versioned definitions.
- [ ] Implement registration windows, required fields, review/approval, rejection, cancellation, and waitlist promotion.
- [ ] Use individual registrations as the identity/eligibility record; team eligibility derives from its accepted members. Support solo events without forcing team creation.
- [ ] Define capacity as approved participant slots for the first release. Approvals/promotions must reserve capacity transactionally, including simultaneous requests.
- [ ] Implement team creation, invitation acceptance, leaving, leader transfer, member limits, and configurable roster-lock time.
- [ ] Enforce one active team membership per participant per event through database constraints and transactions.
- [ ] Expose registration/roster eligibility through public module services for submissions and judging.
- [ ] Emit registration status and team-invitation events for notification jobs.

### Frontend

- [ ] Form builder, registration page, status page, and participant dashboard.
- [ ] Team create/join/invitation screens, roster, leader actions, and lock explanations.
- [ ] Organizer participant search/filter, review queue, team roster, and scoped CSV export.

### Exit criteria

- [ ] A participant can register, receive a status update, and create/join a team.
- [ ] Concurrent approvals cannot exceed capacity; concurrent invitation acceptance cannot bypass membership limits.
- [ ] Form edits preserve the version used by historical answers.
- [ ] Unauthorized users cannot alter another team, view private answers, or export another event.

## Phase 4 — Problem statements and submissions

**Goal:** eligible teams choose a problem and submit a traceable project before the deadline.

### Backend and data

- [ ] Create ProblemStatement, Track, ProblemSelection, Submission, SubmissionRevision, and finalized-roster snapshot.
- [ ] Implement immediate, event-start, scheduled, and manual problem release strategies.
- [ ] Enforce release visibility on the server; scheduled jobs must be recoverable after downtime. Time-derived release modes remain correct without a perfectly timed worker.
- [ ] Implement team problem selection and optional capacity limits with transactional checks.
- [ ] Implement project drafts and finalization: title, description, repository URL, demo/video URL, and presentation URL.
- [ ] Validate URL schemes; treat external links as untrusted data and avoid automatically executing or fetching project content.
- [ ] Enforce registration/team eligibility, roster limits, problem availability, event status, and deadline during finalization.
- [ ] Lock or snapshot the roster and revision used for judging. Define whether resubmission is allowed before closure; keep history and a clear final revision.
- [ ] Allow explicit, audited organizer overrides with reasons; never silently overwrite a receipt.
- [ ] Emit `submission.finalized` for durable receipt delivery.

### Frontend

- [ ] Released problem listing/detail and team selection.
- [ ] Draft editor, validation, confirmation, submission receipt/history, and deadline display in event timezone.
- [ ] Organizer submission list with submitted/missing filters and revision detail.

### Exit criteria

- [ ] A valid team selects a released problem and finalizes a submission.
- [ ] Unreleased statements remain private; deadline/roster races cannot bypass eligibility.
- [ ] Receipts identify the finalized revision; worker restart does not lose the notification.
- [ ] Only the intended team and authorized event staff can read private drafts/submissions.

## Phase 5 — Judging and controlled results

**Goal:** judges score assigned submissions and organizers publish reproducible results.

### Backend and data

- [ ] Create JudgingRound, RubricVersion, Criterion, JudgeAssignment, Score, and ResultSnapshot. Start with a single round while keeping round identity explicit.
- [ ] Configure scoring ranges, weights, required criteria, and a documented aggregation/tie rule.
- [ ] Assign judges to finalized submissions; record declared conflicts and support reassignment.
- [ ] Allow score drafts and completed evaluations; validate ranges and required criteria.
- [ ] Restrict judges to assigned submissions and their own scores. Do not expose competing judges' private scores by default.
- [ ] Freeze the applicable rubric/version once scoring starts; edits require a deliberate new version/process.
- [ ] Prevent accidental final results with missing evaluations; any exception must be explicit and audited.
- [ ] Generate a result preview and publish an immutable snapshot. Corrections create a superseding snapshot with a reason.
- [ ] Emit `results.published`; expose private feedback only according to organizer policy.

### Frontend

- [ ] Judge assignment list, project view, rubric scoring, save/complete states.
- [ ] Organizer assignment/conflict screens, scoring progress, result preview, and publish action.
- [ ] Public results page and policy-controlled participant feedback view.

### Exit criteria

- [ ] A seeded event progresses from submissions to judging to published winners.
- [ ] Aggregation and ties are deterministic and covered by meaningful tests.
- [ ] Participants cannot read unpublished scores; judges cannot score unassigned teams.
- [ ] Later rubric/score edits do not silently change published results.

## Phase 6 — Operational readiness and first release

**Goal:** another institution can deploy the platform and run a free hackathon.

### Implement and validate

- [ ] Finish announcements, essential transactional email, organizer totals, exports, and read-only archives.
- [ ] Add synthetic demo data covering two events, multiple roles, teams, submissions, and judging states.
- [ ] Test the complete participant and organizer journeys in the deployed UI, including mobile layouts and keyboard access.
- [ ] Exercise expected event-scale workloads; document the tested concurrency/data volume and deployment resources without extrapolating unsupported capacity claims.
- [ ] Validate pagination, bounded exports, registration/submission races, worker recovery, and permission boundaries.
- [ ] Add request/file-size limits where relevant, auth throttling, safe cookie configuration, and CSRF protection appropriate to the session architecture.
- [ ] Build production containers and a clean-install Compose guide; separate development defaults from production secrets.
- [ ] Demonstrate database backup and restore on a disposable deployment. Record migration/upgrade and rollback-or-recovery procedures.
- [ ] Add SECURITY, operational runbook, supported feature/config reference, screenshots, and a working quick start.
- [ ] Tag the first usable release only after clean-clone deployment and an end-to-end rehearsal pass.

### Exit criteria

- [ ] An installer outside the core development setup completes documented deployment.
- [ ] A complete free event runs without manual database edits.
- [ ] Archive/toggles preserve historical records; backup restoration recovers them.
- [ ] CI verifies build, clean migrations, critical workflows, authorization, and durable effects.

**This is the first release boundary.** Optional v1 modules come next.

## Phase 7 — Attendance, certificates, and event reuse

**Goal:** reduce work before/after an event without expanding hosting complexity.

### Check-in

- [ ] Create CheckInCredential and CheckInRecord; bind opaque QR credentials to event and registration.
- [ ] Add event-scoped staff permission and scanner/manual check-in UI.
- [ ] Validate registration eligibility and handle duplicate scans idempotently.

### Certificates

- [ ] Create CertificateTemplate, CertificateIssue, and issuance/correction history.
- [ ] Add template preview and explicit eligibility rules based on registration, attendance, or results.
- [ ] Generate batches through jobs; use issuance keys to prevent duplicate certificates.
- [ ] Add controlled download and minimal public verification with opaque identifiers.
- [ ] Preserve correction/revocation history rather than rewriting issued records invisibly.

### Reuse and configuration

- [ ] Duplicate event definitions: branding, forms, problem/rubric templates, and settings.
- [ ] Require date review; copy no participant, role-assignment, payment, submission, score, or check-in records by default.
- [ ] Add the setup CLI using the same settings service as the admin panel.
- [ ] Add extra auth adapters with explicit identity linking and session-provider attribution.
- [ ] Add optional subdomain routing only with host validation, DNS/TLS instructions, and supported session-cookie behavior.
- [ ] Add hosted attachments/uploads only after defining storage adapters, limits, private access, and retention. External links remain usable.
- [ ] Add multi-round judging and optional notification channels after their individual specs are accepted.

### Exit criteria

- [ ] Duplicate check-in and certificate jobs cannot duplicate records/issuance.
- [ ] Public verification exposes only approved minimal fields.
- [ ] Event duplication carries configuration but no previous participants or results.
- [ ] Every extension can be disabled while historical data remains accessible to authorized users.

## Phase 8 — Optional paid registration

**Goal:** support paid events while preserving a complete free-event flow.

### Backend and data

- [ ] Create PaymentOrder, PaymentAttempt, ProviderWebhookReceipt, and reconciliation records.
- [ ] Define a PaymentProvider contract for order creation, trusted confirmation, webhook handling, and required reconciliation operations; add a frontend checkout-adapter contract.
- [ ] Implement one gateway first. Do not launch multiple incomplete payment adapters.
- [ ] Snapshot provider identifier, amount, currency, and immutable order references on every order.
- [ ] Keep registration approval and payment state separate; derive final eligibility from event policy.
- [ ] Define capacity reservation and expiration for pending paid registrations so simultaneous checkouts cannot oversell.
- [ ] Verify signatures and expected order/amount/currency; apply receipts and transitions idempotently.
- [ ] Commit trusted payment confirmation and outbox event atomically; retries cannot confirm twice.
- [ ] Reconcile pending payments and handle callbacks arriving after checkout closes or provider configuration changes.
- [ ] Give admins payment-history/reconciliation views. Define failed, cancelled, late-success, and refund handling before launch; unsupported cases must have a documented resolution procedure.

### Frontend

- [ ] Price display, checkout launch, pending/confirmed/failed state, and receipt.
- [ ] Clearly separate payment completion from registration approval where approval is required.
- [ ] Treat browser redirects and UPI app launches as signals to check status, never proof of payment.

### Exit criteria

- [ ] Sandbox end-to-end checks cover success, failure, duplicate/out-of-order webhooks, missing callbacks, late success, and provider changes.
- [ ] Existing orders settle against their snapshotted provider; disabling new checkout does not abandon them.
- [ ] Capacity reservation/expiration behaves correctly under concurrent checkouts and late confirmation.
- [ ] Free events work with no gateway configured. Check-in/certificates, if enabled, consume the same eligibility policy.

## Phase 9 — Broader reuse and contributor modules

**Goal:** extend a proven platform using repeatable contribution contracts.

- [ ] Define workshop/recruitment presets using existing Event, Form, Theme, and Role capabilities.
- [ ] Run a real non-hackathon event before introducing specialized exams or recruitment scoring.
- [ ] Extract a minimal internal module descriptor from existing registration/judging modules: ID, permissions, routes, settings schema, owned data, and emitted/subscribed events.
- [ ] Add module template, contributor spec, migration conventions, CI validation, and compatibility/version policy.
- [ ] Add additional payment/notification providers only for demonstrated user needs and complete their operational workflows.
- [ ] Keep runtime plugin loading, marketplaces, isolated code execution, hosted multi-institution SaaS, and AI judging deferred until separately scoped.

### Exit criteria

- [ ] A contributor adds a small module through documented contracts without accessing another module's private tables.
- [ ] A non-hackathon event uses the existing platform successfully.
- [ ] New providers do not duplicate registration, payment-state, or notification business logic.

## 3. Rules applying to every phase

1. **Safe switches:** disabling stops new activity; deletion is a separate authorized, confirmed, audited action. Pending provider obligations continue to resolve.
2. **Event isolation:** authorize every API operation server-side; event URLs and UI visibility are not access controls.
3. **Database invariants:** enforce uniqueness, capacity, deadlines, and valid transitions with transactions/constraints where necessary.
4. **Historical integrity:** version forms, rubric definitions, submissions, and published results; config edits do not reinterpret old records silently.
5. **Durable effects:** commit outbox entries with state changes; retry and deduplicate handlers; keep failures observable.
6. **Time:** persist timestamps consistently and render the configured event timezone; test boundary behavior.
7. **Dependencies:** reject incompatible configuration with actionable errors; avoid hidden destructive cascades.
8. **Deployment:** each phase includes migrations, configuration documentation, synthetic seed updates, and a tested recovery path for material changes.

## 4. Turning phases into GitHub issues

Create small vertical issues containing backend, UI, and validation for one usable behavior. Avoid one enormous issue per phase.

```markdown
## Outcome
What the participant/organizer/judge can do after this change.

## Scope
Included behavior and explicit boundaries.

## Contracts and data
Endpoints, permission/event scope, models/migrations, emitted events.

## Acceptance criteria
- [ ] Expected user flow works.
- [ ] Invalid/unauthorized transitions fail.
- [ ] Relevant concurrency/retry behavior is correct.
- [ ] Documentation and seed data are updated.

## Dependencies
Prerequisite issue IDs or phase gates.
```

A phase is complete when its user flow and exit criteria pass, not merely when endpoints exist. For new work, begin with Phase 0 and advance through Phase 6 before adding optional modules; if code already exists, map it to these gates and implement the first unverified dependency.
