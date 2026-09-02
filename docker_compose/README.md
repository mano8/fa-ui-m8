# Docker Compose Examples

Three ready-to-run stacks for the `fa-ui-m8` host, each targeting a distinct use case. They differ in which backend services they run and in how the UI itself is served.

---

## Summary

- [Which stack should I use?](#which-stack-should-i-use)
- [Common architecture](#common-architecture)
- [Token modes](#token-modes)
- [Quick start](#quick-start)
- [Environment file system](#environment-file-system)
- [Database isolation](#database-isolation)
- [Shared migrations](#shared-migrations)
- [Ports](#ports-same-for-all-stacks)
- [Live testing](#live-testing)

---

## Which stack should I use?

| Stack | Backend services | UI | Monitoring | Best for |
| --- | --- | --- | --- | --- |
| [dev_ui_m8](dev_ui_m8/) | auth + media (+ workers, MinIO, ClamAV) | `astro` container running `npm run dev` on `127.0.0.1:4321`, app and plugins bind-mounted for live reload | Prometheus + Grafana | Day-to-day UI development against auth + media |
| [dev_local_full_ui_m8](dev_local_full_ui_m8/) | auth + media + **prompt** + **reparto** (+ workers, MinIO, ClamAV) | **none** — run `npm run dev` from [`../app`](../app) on the host | Prometheus + Grafana | The full platform; the only stack that runs `reparto_service` |
| [hardened_ui_m8](hardened_ui_m8/) | auth + media (+ media worker, MinIO, ClamAV) | `ui` container serving the **built** `dist/` behind Traefik as a catch-all route | Prometheus + Grafana | Verifying the shipped static build, its CSP and the hardened posture |

All three use PostgreSQL 18, RS256/JWKS between the issuer and its consumers,
`stateful` token mode, container hardening and network segmentation, and build
every application service from the sibling repositories rather than published
images.

**Decision guide:**

- **Working on auth or media UI** → [dev_ui_m8](dev_ui_m8/) — everything in containers, live reload
- **Working on the three-stage teaching-assignment (reparto) feature** → [dev_local_full_ui_m8](dev_local_full_ui_m8/) — it is the only stack with `reparto_service`, and the UI runs on the host so working-tree plugin source is exercised
- **Checking what actually ships** → [hardened_ui_m8](hardened_ui_m8/) — the production CSP and the static build are only real here (both are no-ops under `astro dev`)
- **A reparto-only backend, no UI** → [`reparto-docente-m8/docker_compose/dev_reparto_m8`](../../reparto-docente-m8/docker_compose/dev_reparto_m8)
- **Stateless mode** → set `TOKEN_MODE=stateless` in `auth.env` (disables Google OAuth; see [Token modes](#token-modes))

---

## Common architecture

All stacks share the same shape — one Traefik entry point, one path prefix per
service, and a per-service database on an internal network:

```text
Browser / Frontend
       │
       ▼
  Traefik :9000                          (app_net)
       ├── /user/*    ─► auth_user_service :8000     (RS256 issuer)
       ├── /media/*   ─► media_service :8000         (consumer via JWKS)
       ├── /prompt/*  ─► prompt_engine_service :8000 (dev_local_full_ui_m8 only)
       ├── /reparto/* ─► reparto_service :8000       (dev_local_full_ui_m8 only)
       └── /*         ─► ui :8080                    (hardened_ui_m8 only)
                          │
                  (data_net, no gateway)
                          ▼
        m8_db (PostgreSQL 18) · redis_cache · media_redis_cache · minio
```

Traefik is the single entry point. Application services sit on `app_net` and
`data_net`; the database, Redis and MinIO are only on `data_net` and are not
reachable from the host except through the loopback ports each stack publishes
for dev convenience. Consumers never touch the auth Redis — revocation goes
through the issuer's private introspection endpoint over HTTP.

Where the UI runs differs per stack: a dev-server container in `dev_ui_m8`, a
static-file container behind the catch-all router in `hardened_ui_m8`, and a
host-run `npm run dev` in `dev_local_full_ui_m8`.

---

## Token modes

Set `TOKEN_MODE` in `auth.env` to control how access tokens are validated:

| Mode | How it works | Redis for JWT | Google OAuth | Use case |
| --- | --- | --- | --- | --- |
| `stateless` | Verify JWT signature only — no server-side state | No | ❌ disabled | Maximum scalability, no revocation needed |
| `hybrid` | JWT access token + Redis-stored refresh allowlist | Refresh only | ✅ | Good balance: scalable access + revocable refresh |
| `stateful` | Every request checks Redis blacklist | Yes | ✅ | Instant logout guarantee |

> **Stateless limitation:** Google OAuth requires Redis for the PKCE code-exchange flow and is
> disabled when `TOKEN_MODE=stateless`. All other features work normally.
>
> **Hybrid trade-off:** A stolen access token remains valid for its full lifetime after logout.
> Refresh tokens are revoked immediately. Use `stateful` if instant access token revocation is required.

---

## Quick start

Every stack follows the same four steps:

```sh
# 1. Copy EVERY .env.example in the stack directory and fill in all secrets
#    (replace every 'changethis'). Which files exist depends on the stack —
#    dev_local_full_ui_m8 adds prompt.env and reparto.env.
for f in *.env.example; do cp -n "$f" "${f%.example}"; done
cp -n .env.example .env          # infrastructure vars, where the stack has one

# 2. Generate keys (RS256/ES256 stacks) and TLS certificates
bash init.sh

# 3. (Optional) Reset the database volume if it already exists
# bash init.sh --reset-db    # prompts for confirmation; use --yes for CI

# 4. Bring up the stack — DB is provisioned automatically on first boot
docker compose up -d --build
```

> **Windows:** `init.sh` requires bash — use **Git Bash** (included with Git for Windows) or **WSL**.

Generate secret values with:

```sh
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

To rotate cryptographic keys without reinitializing: `bash init.sh --rotate-keys`.

---

## Environment file system

Each stack uses **one env file per application service**. Copy the `.example` files and fill in your values:

```text
.env          ← infrastructure/bootstrap: DB superuser, per-service *_DB_* triplets,
                Redis and MinIO root passwords (read by the DB init script and by
                Compose interpolation — never by the services themselves)
auth.env      ← auth_user_service: algorithm, token mode, secrets, DB/Redis config, expiry
media.env     ← media_service: consumer role, token validation, MinIO credentials
worker.env    ← media_worker
prompt.env    ← prompt_engine_service   (dev_local_full_ui_m8 only)
reparto.env   ← reparto_service         (dev_local_full_ui_m8 only)
grafana.env   ← Grafana admin credentials
test.env      ← security-tests-m8 live runner
```

Service env files use the **generic** `DB_DATABASE` / `DB_USER` / `DB_PASSWORD`
names; `.env` uses the **prefixed** `AUTH_DB_*` / `MEDIA_DB_*` / `PROMPT_DB_*` /
`REPARTO_DB_*` triplets. The two must agree per service — they are not
interchangeable spellings of the same variable.

All runtime `*.env` files hold secrets and are git-ignored; only the `*.example`
templates are tracked. When a service gains a setting, update its `.example`
alongside the running file.

Generate secrets with:

```sh
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Database isolation

`init-db.sh` runs inside the DB container on first volume creation and provisions databases automatically. Choose one model:

**Scenario 1 — single shared DB** (simplest):

```ini
DB_USER=myuser
DB_PASSWORD=a-strong-password
DB_NAME=myapp
```

All services share one database and one user.

**Scenario 2 — per-service isolation** (default in all stacks):

```ini
AUTH_DB_USER=auth_user        AUTH_DB_PASSWORD=...     AUTH_DB_NAME=auth_db
MEDIA_DB_USER=media_user      MEDIA_DB_PASSWORD=...    MEDIA_DB_NAME=media_db
PROMPT_DB_USER=prompt_user    PROMPT_DB_PASSWORD=...   PROMPT_DB_NAME=prompt_engine_db
REPARTO_DB_USER=reparto_user  REPARTO_DB_PASSWORD=...  REPARTO_DB_NAME=reparto_db
```

Each service gets its own database and credentials. `init-db.sh` creates them automatically.

**Scenario 3 — N-service isolation** (extend Scenario 2 freely):

```ini
WORKER_DB_USER=worker_user  WORKER_DB_PASSWORD=...  WORKER_DB_NAME=worker_db
SEARCH_DB_USER=search_user  SEARCH_DB_PASSWORD=...  SEARCH_DB_NAME=search_db
```

Add any `PREFIX_DB_{USER,PASSWORD,NAME}` triplet. Prefixes must be `UPPERCASE`, start with a letter, and use only `[A-Z0-9_]`. No compose edits needed — the DB container sees all `.env` vars via `env_file:` and discovers triplets automatically.

**Validation**: `init-db.sh` detects and rejects: missing/empty fields, duplicate `DB_NAME` or `DB_USER` across prefixes (silent isolation collapse), invalid identifier characters, and mixed bare+prefixed configuration. Weak or reused passwords produce warnings without blocking startup.

**Stale volume**: Database provisioning runs **once** on first volume creation. If DB config changes after the volume exists, reset with `bash init.sh --reset-db`.

---

## Shared migrations

The `shared_migrations/` directory is created automatically on first start. It holds one Alembic version tree per service schema:

```text
shared_migrations/
├── auth_user/versions/         ← users, sessions, API keys, rate limits
├── media/versions/             ← media objects, variants, outbox
├── prompt_engine/versions/     ← prompt engine tables
└── reparto_docentes/versions/  ← teaching-assignment tables
```

Migrations run automatically every time the containers start, and each service
autogenerates a revision when its models differ from the live schema. The
directory is a bind mount, so history is preserved across restarts — and
**across `--reset-db`**, which deletes `db_data/` but not this tree. A reset that
leaves revisions behind replays an old schema onto the new database, so a clean
reset means deleting the relevant `versions/*.py` too:

```sh
bash init.sh --reset-db --yes
rm -f shared_migrations/reparto_docentes/versions/*.py
docker compose up -d
```

Booting the stack a second time must autogenerate **no** further revision. If it
does, the models and the applied schema have drifted.

---

## Ports (same for all stacks)

| Port | Bound to | What |
| --- | --- | --- |
| `8000` | `0.0.0.0` | Traefik HTTP — public |
| `4430` | `0.0.0.0` | Traefik HTTPS — public |
| `9000` | `127.0.0.1` | API services entry (override with `API_BIND_IP` in the stack's `.env`) |
| `8080` | `127.0.0.1` | Traefik dashboard |
| `5432` | `127.0.0.1` | PostgreSQL |
| `6379` | `127.0.0.1` | Redis |
| `4321` | `127.0.0.1` | Astro dev server — a container in `dev_ui_m8`, a host process in `dev_local_full_ui_m8` |
| `9005` / `9006` | `127.0.0.1` | MinIO API / console |
| `9090` | `127.0.0.1` | Prometheus |
| `3000` | `127.0.0.1` | Grafana |

Port `9000` is the one you'll use most in development — all API requests go through it.

---

## Browser-direct media uploads/downloads

When using `media-service-m8` with browser-direct presigned URLs (Option A —
uploads/downloads bypass the media service), you must configure:

1. **`MINIO_PUBLIC_ENDPOINT`** in `media.env` — the URL the browser uses to
   reach MinIO's data path (e.g. `http://127.0.0.1:9005` in dev, `https://storage.example.com` in prod).
2. **Storage ingress** — The hardened stacks expose MinIO via a dedicated
   Traefik router. See your stack's `hardened_ui_m8/README.md` or
   [hardened_media_m8/README.md](../media-service-m8/docker_compose/hardened_media_m8/README.md)
   for TLS + CORS setup.

For proxy-through deployments (bytes transit the media service), omit `MINIO_PUBLIC_ENDPOINT`.

---

## Live testing

Every stack ships a `test.env.example` wired for [`security-tests-m8`](https://github.com/mano8/security-tests-m8) — a reusable live security suite that attacks the *running* stack (auth bypass, token forgery, `alg=none`, JWKS/algorithm confusion, privilege escalation, OWASP API Top 10). These flaws only surface end-to-end against a fully wired deployment — here, the `fa-auth-m8` issuer plus the `media-service-m8` consumer behind Traefik — not in unit tests. Run it after `docker compose up` and after any auth/token/network/image change.

**Recommended — CLI mode** (excludes destructive tests by default):

```sh
pip install --upgrade security-tests-m8

cd <stack>/                  # e.g. hardened_ui_m8
cp test.env.example test.env
# Edit test.env: point LIVE_TEST_ADMIN_EMAIL / LIVE_TEST_ADMIN_PASSWORD at a
# DEDICATED test-only superuser — it must already exist, and must NOT be the
# bootstrap FIRST_SUPERUSER (preflight refuses that). Fill or remove the opt-in
# secret lines; never leave 'changethis' in test.env.

security-tests-m8 preflight --deployment-root .
security-tests-m8 run --env-file test.env
# Full mutation-heavy run: add --include-destructive
```

The suite auto-detects the stack's algorithm and token mode and skips checks that don't apply, so the same workflow covers every stack here. **Clean up afterward:** the suite does not delete the dedicated test superuser (or the `redteam_*` users it creates) — remove or disable them after a run on any shared or long-lived stack.

**Advanced — pytest mode.** For local marker selection, custom tests, or suite extension, use [`shared_live_tests/`](shared_live_tests/), which also documents the full rationale: why a dedicated superuser, when to run, and cleanup.

For a manual smoke test, check the health endpoint after `docker compose up`:

```sh
curl http://localhost:9000/user/health/
# Expected: {"status":"ok","token_mode":"...","redis":"ok","database":"ok",...}
```

Then open `http://localhost:9000/user/docs` in a browser (requires `SET_DOCS=true` in `auth.env`).

---

> Back to [repository root](../) · UI deployment contract and route map: [`../app/README.md`](../app/README.md)
