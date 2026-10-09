# ProjectBoard — Product Overview

> **ProjectBoard** is a placeholder product name used throughout this document set. It is intended to be replaced with the client's chosen brand before delivery.

## 1. What ProjectBoard Is

ProjectBoard is a modern, web-based **Kanban-style project management system** — a self-hostable alternative to commercial tools such as Trello. It gives teams a visual way to organise work into boards, lists, and cards, and to collaborate in real time around shared tasks.

## 2. Business Value

- **Own your data** — fully self-hosted; no third-party SaaS dependency, no per-seat SaaS pricing.
- **Fast to deploy** — ships as Docker images with a one-command compose setup, including database provisioning and automatic migrations.
- **Familiar paradigm** — the Kanban board model requires no training for users coming from Trello, Jira, or sticky notes.
- **White-label ready** — branding, colours, and naming are fully configurable for the client.
- **Extensible** — public REST API with API keys, webhooks, and an AI-assistant integration surface (MCP-compatible) for future automation.

## 3. Who It Serves

| Audience | Benefit |
|---|---|
| Small–mid product/engineering teams | Lightweight sprint and task tracking |
| Agencies & consultancies | Client-facing project boards with public share links |
| IT departments (internal tools) | Self-hosted, domain-restricted login (OIDC/social SSO) |
| Operations / marketing teams | Editorial calendars, campaign tracking via templates |

## 4. High-Level Scope

**In scope (v1):**

- Workspace & member management with role-based permissions
- Boards with configurable visibility (private / workspace / public read-only)
- Lists and cards with drag-and-drop reordering, due dates, labels, members, checklists
- Comments and per-card activity history
- Reusable board templates
- Import of existing Trello boards
- Email/password authentication plus optional Google / GitHub / Discord / generic OIDC login
- Email notifications via any SMTP server (optional)
- File attachments on cards via S3-compatible object storage (optional)
- Public REST API (`/api/v1`) with per-user API keys
- Webhooks for workspace events
- Docker Compose self-hosting with automated database migrations

**Deferred (future phases):**

- Third-party integrations marketplace (GitHub etc. as native card integrations)
- Subscription/billing module (Stripe) if offered as a managed service
- AI assistant control via an MCP-compatible server (foundation already present)

## 5. Document Set

| Document | Contents |
|---|---|
| [01 — Requirements](01-requirements.md) | Functional and non-functional requirements |
| [02 — Architecture](02-architecture.md) | System design, tech stack, data model |
| [03 — UI / UX](03-ui-ux.md) | Screens, layout, interaction design |
| [04 — Deployment](04-deployment.md) | Docker hosting, environment variables, operations |
| [05 — Roadmap](05-roadmap.md) | Phased delivery plan and open questions |
