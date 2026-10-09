# ProjectBoard — Requirements

This document defines the functional and non-functional requirements for ProjectBoard. Requirement IDs (FR-x, NFR-x) are stable identifiers for use in proposals, contracts, and acceptance testing.

## 1. Functional Requirements

### 1.1 Boards, Lists & Cards

| ID | Requirement |
|---|---|
| FR-1.1 | Users can create, rename, archive, and delete boards. |
| FR-1.2 | Each board contains ordered lists (columns); lists can be created, renamed, reordered, and deleted. |
| FR-1.3 | Each list contains ordered cards; cards can be created, edited, reordered within a list, and moved between lists via drag-and-drop. |
| FR-1.4 | Cards support: title, rich-text description, due date, cover/styling, member assignment, and labels. |
| FR-1.5 | Cards carry a per-board sequential card number for easy reference (e.g. in commits or chat). |
| FR-1.6 | Cards support checklists with individually toggleable items. |
| FR-1.7 | Cards support file attachments when object storage is configured. |
| FR-1.8 | Users can duplicate a card, and watch/subscribe to card changes. |
| FR-1.9 | Archived boards and cards are soft-deleted (recoverable). |
| FR-1.10 | Boards can be starred as favourites by each user. |

### 1.2 Visibility & Sharing

| ID | Requirement |
|---|---|
| FR-2.1 | Board visibility levels: **Private** (invited members only), **Workspace** (all workspace members), **Public** (anyone with the link, read-only). |
| FR-2.2 | Public boards render on a clean shareable URL that requires no login and hides vendor branding (white-label). |
| FR-2.3 | Board access is enforced server-side on every API call, not only in the UI. |

### 1.3 Workspaces, Members & Roles

| ID | Requirement |
|---|---|
| FR-3.1 | Users belong to one or more workspaces; each workspace has a unique human-readable slug. |
| FR-3.2 | Workspace owners/admins can invite members by email or via invite links. |
| FR-3.3 | Role-based access control: at minimum Owner, Admin, Member, and Viewer roles, with configurable per-role permissions (custom roles supported). |
| FR-3.4 | Membership can be paused (retains history, removes access). |
| FR-3.5 | Invited members can be assigned to boards and to individual cards. |

### 1.4 Collaboration

| ID | Requirement |
|---|---|
| FR-4.1 | Users can comment on cards; comments support editing and deletion by their author (and workspace admins). |
| FR-4.2 | Every change to a card (title, description, moves, label/member changes, checklist progress, attachments, comments) is recorded in an immutable **activity log** visible on the card. |
| FR-4.3 | Users receive in-app notifications for relevant events (mentions, assignments, comments on watched cards). |
| FR-4.4 | Email notifications are sent when SMTP is configured; all email features can be disabled globally. |
| FR-4.5 | Users can submit feedback from inside the app. |

### 1.5 Organisation & Discovery

| ID | Requirement |
|---|---|
| FR-5.1 | Colour-coded labels, scoped per board; cards can carry multiple labels. |
| FR-5.2 | Board filtering: by label, member, due date, and free-text search. |
| FR-5.3 | A global command palette (keyboard-driven quick actions/navigation). |
| FR-5.4 | Board templates: any board can be saved as a template and instantiated later. |

### 1.6 Import / Export

| ID | Requirement |
|---|---|
| FR-6.1 | One-click import of Trello boards (lists, cards, labels, members, comments, attachments) via Trello API credentials configured by the administrator. |
| FR-6.2 | Import jobs run in the background with a visible status per import. |
| FR-6.3 | Public REST API (`/api/v1`, OpenAPI-documented, Bearer API keys) for programmatic access to workspaces, boards, lists, cards, comments, checklists, labels, and members. |

### 1.7 Automation Surface

| ID | Requirement |
|---|---|
| FR-7.1 | Workspace-scoped webhooks: outbound HTTP callbacks for board/card events, with delivery logging and retry. |
| FR-7.2 | (Phase 2) MCP-compatible server exposing the API to AI assistants via natural language, using the same API keys. |

### 1.8 Authentication

| ID | Requirement |
|---|---|
| FR-8.1 | Email + password registration and login; password reset via email. |
| FR-8.2 | Optional social login: Google, GitHub, Discord. |
| FR-8.3 | Optional enterprise login via any OIDC-compliant identity provider, with an allow-list of permitted email domains. |
| FR-8.4 | Session management with secure, httpOnly cookies; session records are server-side revocable. |
| FR-8.5 | Sign-up can be disabled globally (invite-only deployments). |
| FR-8.6 | Per-user API keys for programmatic access, created and revoked from user settings. |

### 1.9 Administration

| ID | Requirement |
|---|---|
| FR-9.1 | Per-user settings: profile, avatar (stored in object storage when configured), password, API keys, notification preferences. |
| FR-9.2 | Workspace settings: name, slug, members, roles & permissions, invite links, webhooks, integrations, billing (if enabled). |
| FR-9.3 | Instance-level admin endpoints protected by a server-only admin API key (statistics, health). |
| FR-9.4 | Rate limiting on sensitive endpoints (email login, sign-up), backed by Redis when configured, in-memory otherwise. |

## 2. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Self-hostable**: the entire product runs from Docker images on a single host; no external SaaS dependency. Optional externals (SMTP, S3, Redis, OAuth providers) are strictly optional. |
| NFR-2 | **Reliable upgrades**: database migrations run automatically and idempotently before application start (run-once migration container). |
| NFR-3 | **Security**: parameterized queries throughout (ORM), server-side authorisation on every endpoint, CSRF protection, secure cookie configuration, TLS assumed at the reverse proxy, rate limiting on auth endpoints, upload size/type restrictions (avatars limited to 2 MB). |
| NFR-4 | **Performance**: board view loads in under 2 s on broadband for boards with 1,000+ cards; drag-and-drop interactions remain at 60 fps (client-side optimistic updates). |
| NFR-5 | **Scalability**: stateless web tier (horizontal scaling ready); state held in PostgreSQL and optional Redis. |
| NFR-6 | **Availability**: graceful degradation — email/S3/Redis failures disable only the dependent features, never the core boards experience. |
| NFR-7 | **Localisation-ready**: UI strings externalised (English shipped; additional languages can be added without code changes). |
| NFR-8 | **Observability**: structured logs with configurable verbosity; health-check endpoint for container orchestration. |
| NFR-9 | **Backup-friendly**: all persistent state in one PostgreSQL database plus an S3 bucket — standard tooling applies. |
| NFR-10 | **Browser support**: current versions of Chrome, Edge, Firefox, Safari; responsive down to tablet widths. |
