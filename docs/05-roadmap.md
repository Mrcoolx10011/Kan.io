# ProjectBoard — Delivery Roadmap

## Phase 1 — MVP (Weeks 1–6)

**Goal:** a working, self-hosted boards product that a pilot team can use daily.

- Authentication: email/password, password reset, sessions
- Workspaces, member invitations, base roles (Owner / Admin / Member / Viewer)
- Boards / lists / cards with drag-and-drop (FR-1.1 – FR-1.4)
- Board visibility: private / workspace / public share links
- Labels, due dates, members on cards
- Comments + full card activity log
- Board and card archiving, favourites
- Docker Compose deployment with auto-migrations
- Landing, login/sign-up, onboarding, board view, card detail

**Exit criteria:** a pilot workspace of 10 users runs real work on it for two weeks with zero data-loss incidents; `docker compose up -d` from a clean machine reaches a working app in under 15 minutes.

## Phase 2 — Team Collaboration (Weeks 7–12)

- Checklists on cards
- Board filters (label / member / due date / text)
- Command palette
- Board templates (save & instantiate)
- In-app notifications + email notifications (SMTP)
- Avatars & attachments via S3-compatible storage
- Public REST API (`/api/v1`) with user API keys + OpenAPI docs
- Workspace webhooks with delivery log
- Custom roles & per-member permission overrides
- Optional social/OIDC login (Google, GitHub, Discord, enterprise OIDC)
- Rate limiting (Redis) and instance admin endpoints

**Exit criteria:** FR coverage for sections 1.1–1.6, 1.8, 1.9 of the requirements doc verified by automated test suites (unit + integration + e2e).

## Phase 3 — Scale & Ecosystem (Quarter 2+)

- Trello import (background jobs with status tracking)
- i18n: ship ≥ 2 additional languages
- Billing module (Stripe) if offered as a managed/SaaS variant
- Horizontal scaling runbook (stateless web tier behind a load balancer, managed Postgres)
- Integrations marketplace groundwork (GitHub-style native card integrations)

## Phase 4 — AI & Automation (Future)

- MCP-compatible server exposing the full API to AI assistants (Claude Desktop, Cursor, Copilot, …), distributed via `npx`, authenticated with existing user API keys
- Suggested automation rules (e.g. "when card moves to Done → notify watchers")

## Assumptions

1. Client provides (or approves) hosting: a single VM with Docker, or an internal Kubernetes cluster; TLS certificate.
2. Client decides at kickoff: open sign-up vs invite-only; which SSO providers; whether email notifications are needed at launch.
3. Placeholder branding ("ProjectBoard") is replaced with the client's brand before Phase 1 exit; white-label settings hide vendor attribution on public boards.
4. Data residency stays fully on client infrastructure unless a managed variant is contracted.

## Open Questions for the Client

| # | Question | Affects |
|---|---|---|
| 1 | Do users need to log in with an existing corporate identity provider (OIDC/ADFS)? | Phase 2 auth scope |
| 2 | Should public share links exist at all, or are boards internal-only? | Security review, FR-2 |
| 3 | Any compliance regime (GDPR, HIPAA, ISO 27001) to design documentation around? | Hosting & audit features |
| 4 | Expected concurrent users / board sizes? | Sizing, NFR-4/5 targets |
| 5 | Is a SaaS/billing variant wanted later, or strictly self-hosted? | Phase 3 scope |
| 6 | Preferred language(s) at launch? | i18n schedule |
