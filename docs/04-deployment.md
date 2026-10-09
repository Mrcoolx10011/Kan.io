# ProjectBoard — Deployment & Operations

## 1. Self-Hosting with Docker Compose

The standard deployment is a three-service Compose stack. A **run-once migrate container** applies database migrations before the application starts, so upgrades are a single `docker compose up -d`.

```yaml
services:
  migrate:
    image: <registry>/projectboard-migrate:latest
    container_name: pb-migrate
    networks: [pb-network]
    environment:
      - POSTGRES_URL=${POSTGRES_URL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  web:
    image: <registry>/projectboard:latest
    container_name: pb-web
    ports:
      - "${WEB_PORT:-3000}:3000"
    networks: [pb-network]
    env_file: [.env]
    depends_on:
      migrate:
        condition: service_completed_successfully
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: pb-db
    environment:
      - POSTGRES_DB=projectboard
      - POSTGRES_USER=projectboard
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pb_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projectboard -d projectboard"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped
    networks: [pb-network]

networks:
  pb-network:

volumes:
  pb_postgres_data:
```

**Bring-up:** `docker compose up -d` → the app is available at `http://localhost:3000` (or `WEB_PORT`).

**Day-2 commands:**

| Task | Command |
|---|---|
| Stop | `docker compose down` |
| Logs | `docker compose logs -f [web\|migrate\|postgres]` |
| Restart | `docker compose restart` |
| Upgrade (after pulling new images) | `docker compose up -d` (migrations re-run automatically) |

The `web` image is built multi-stage (dependency prune → standalone Next.js build → distroless Node runtime) and injects runtime environment variables at container start, so **one image serves dev, staging, and production** with only `.env` differing.

## 2. Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `POSTGRES_URL` | PostgreSQL connection URL | Yes (or external DB) |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the installation (links, auth callbacks) | Yes |
| `BETTER_AUTH_SECRET` | Auth encryption secret — random 32+ chars | Yes |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Allowed callback origins | No |
| `NEXT_PUBLIC_ALLOW_CREDENTIALS` | Enable email/password login | Yes |
| `NEXT_PUBLIC_DISABLE_SIGN_UP` | Close public registration (invite-only) | No |
| `REDIS_URL` | Rate limiting backend | No (in-memory fallback) |
| `EMAIL_FROM` / `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_SECURE` | Outbound email | For email features |
| `NEXT_PUBLIC_DISABLE_EMAIL` | Globally disable all email features | No |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google login | No |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub login | No |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord login | No |
| `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_DISCOVERY_URL` | Generic enterprise SSO | No |
| `BETTER_AUTH_ALLOWED_DOMAINS` | Domain allow-list for SSO logins | No |
| `S3_REGION` / `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_FORCE_PATH_STYLE` | S3-compatible storage for avatars/attachments | For uploads |
| `NEXT_PUBLIC_AVATAR_BUCKET_NAME` / `NEXT_PUBLIC_ATTACHMENTS_BUCKET_NAME` | Bucket names | For uploads |
| `S3_AVATAR_UPLOAD_LIMIT` | Avatar size cap (default 2 MB) | No |
| `NEXT_PUBLIC_STORAGE_URL` | Storage CDN/service URL | For uploads |
| `TRELLO_APP_API_KEY` / `TRELLO_APP_API_SECRET` | Trello board import | For import |
| `NEXT_PUBLIC_WHITE_LABEL_HIDE_POWERED_BY` | Hide vendor attribution on public boards | No |
| `PB_ADMIN_API_KEY` | Instance admin/stats endpoints | Recommended |
| `NEXT_API_BODY_SIZE_LIMIT` | Max request body (default 1 MB) | No |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | No |

## 3. Reverse Proxy / TLS

Terminate TLS in front of the container (nginx, Traefik, Caddy, or a cloud load balancer). Example nginx server block:

```nginx
server {
    listen 443 ssl;
    server_name boards.example.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 4. Local Development

```bash
pnpm install                 # monorepo deps
cp .env.example .env         # configure variables
pnpm db:migrate              # apply migrations (Drizzle Kit)
pnpm dev                     # start dev server
```

Tests: `pnpm test` (Vitest API integration) · `pnpm e2e` (Playwright).

## 5. Backups & Disaster Recovery

- **Database** (mandatory): nightly `pg_dump` of the `projectboard` database; point-in-time recovery if WAL archiving is enabled. A restore drill should be scheduled quarterly.
- **Object storage** (if enabled): bucket versioning/replication for the avatars and attachments buckets.
- **Secrets**: keep `.env` under version-controlled encryption (e.g. sops/age); rotate `BETTER_AUTH_SECRET` and `PB_ADMIN_API_KEY` on staff changes.
- **Recovery target**: RPO ≤ 24 h (nightly dump), RTO ≤ 2 h (restore dump + `docker compose up -d`).

## 6. Monitoring & Health

- Container health check: `pg_isready` on the database; app exposes a health endpoint for the web tier.
- Structured JSON logs with `LOG_LEVEL`; ship via the container runtime's log driver.
- Optional: admin API key unlocks instance statistics endpoints for uptime monitoring.
