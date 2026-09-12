# hardened_media_m8

Local hardened stack for `auth_user_service` + `media_service`.

Includes PostgreSQL 18, two Redis instances (auth + media), SeaweedFS (S3
object storage), Traefik, Prometheus, Grafana, RS256/JWKS auth integration,
hardened containers, and network segmentation.

Use this example while developing the media microservice. Other compose examples
are intentionally not aligned until this one is working.

## Architecture

```text
Browser / Frontend
       |
       v
  Traefik :9000
       | app_net
       +--> /user/*  -> auth_user_service :8000  (RS256 issuer)
       +--> /media/* -> media_service :8000      (RS256 consumer via JWKS)
       +--> /*       -> ui :8080                 (static Astro/Starlight build, catch-all)

  media_service
       +--> PostgreSQL on data_net
       +--> auth_user_service private API (HTTP introspection) for token revocation
       +--> Media Redis on data_net for media queues/rate limits/cache
       +--> Object storage (SeaweedFS) on data_net
```

`app_net` is external-facing for Traefik, app services, and observability.
`data_net` is internal and has no gateway; DB, Redis, and object storage are
not exposed through that network.

> **Token revocation:** the media service does **not** connect to the auth
> Redis. In `stateful` mode it queries the auth service's private introspection
> endpoint (`INTROSPECTION_URL` → `/user/private/v1/jti-status`) over HTTP. The
> auth Redis (`redis_cache`) is used only by `auth_user_service`.

## Services

| Service | Image/build | Local access |
| --- | --- | --- |
| traefik | `traefik:v3.7.5` | `:8000`, `:4430`, `127.0.0.1:9000`, `127.0.0.1:8080` |
| auth_user_service | `tepochtli/fa-auth-m8:2.2.0` | `/user` via Traefik |
| media_service | local `../../media_service` build | `/media` via Traefik |
| ui | local `../../` build (`docker/Dockerfile`) | `/` via Traefik, static build served by sirv-cli |
| m8_db | `postgres:18.4-alpine` | internal data network |
| redis_cache | `redis:8.8.0-alpine` | auth Redis — internal data network |
| media_redis_cache | `redis:8.8.0-alpine` | media Redis — internal data network |
| storage-config | `alpine:3.21.3` | one-shot: writes the SeaweedFS identity table (no host port) |
| storage | `chrislusf/seaweedfs:4.45` | internal only — S3 gateway reachable via Traefik, no host port |
| storage-init | `amazon/aws-cli:2.36.40` | one-shot: buckets + per-bucket CORS |
| prometheus | `ubuntu/prometheus:3.11-26.04_stable` | `127.0.0.1:9090` |
| grafana | `grafana/grafana:13.1.0-25530058790` | `127.0.0.1:3000` |

## Setup

From `docker_compose/hardened_media_m8`:

```sh
cp .env.example .env
cp auth.env.example auth.env
cp media.env.example media.env
```

Edit `.env` (infrastructure / bootstrap):

```ini
DB_USER=<postgres-superuser>
DB_PASSWORD=<postgres-superuser-password>
AUTH_DB_USER=<auth-db-user>
AUTH_DB_PASSWORD=<auth-db-password>
AUTH_DB_NAME=auth_db
MEDIA_DB_USER=<media-db-user>
MEDIA_DB_PASSWORD=<media-db-password>
MEDIA_DB_NAME=media_db
REDIS_PASSWORD=<auth-redis-password>
MEDIA_REDIS_PASSWORD=<media-redis-password>
S3_ROOT_USER=<storage-root-user>
S3_ROOT_PASSWORD=<storage-root-password>
S3_CORS_ALLOW_ORIGIN=https://localhost:4430
```

Edit `auth.env` so its generic runtime DB values match the `AUTH_DB_*` triplet in
`.env`, and set its `REDIS_PASSWORD` to match `.env`. `auth_user_service` is the
only service that connects to the auth Redis.

Edit `media.env` so it matches the `MEDIA_DB_*` triplet in `.env`:

```ini
DB_DATABASE=media_db
DB_USER=<same-as-MEDIA_DB_USER>
DB_PASSWORD=<same-as-MEDIA_DB_PASSWORD>
S3_ENDPOINT=storage:8333
S3_ACCESS_KEY=<media-rw-user>
S3_SECRET_KEY=<media-rw-password>
MEDIA_REDIS_HOST=media_redis_cache
MEDIA_REDIS_PASSWORD=<same-as-MEDIA_REDIS_PASSWORD-in-.env>
```

`MEDIA_REDIS_*` is the media-owned Redis for queues, rate limits, locks, and
cache keys under the `media:*` namespace. `media.env` has **no** `REDIS_*`
(auth Redis) settings — revocation goes through HTTP introspection.

**Per-service scoped Redis ACLs (plan 6.x.1).** Each Redis bootstraps a scoped
ACL user instead of an open `~* +@all`: `redis_cache` creates `auth` (locked to
the auth service's own key prefixes) and `media_redis_cache` creates `media`
(locked to the `media:*` namespace + the `arq:*` queue keys). Both grant only
the command categories the apps use and deny `@dangerous`/admin; the `default`
user is stripped to connection-only so the healthcheck `PING` still works.
`REDIS_USER=auth` / `MEDIA_REDIS_USER=media` wire the apps to those users.
(`dev_ui_m8` applies the same scoped ACLs.)

The `storage-config` one-shot writes the SeaweedFS identity table from
`media.env`'s `S3_ACCESS_KEY` / `S3_SECRET_KEY` (the scoped `media-rw`
identity), so set those to the media-rw credentials you want — never the
`S3_ROOT_USER` admin identity.

### Secure-by-default settings (auth-sdk-m8 ≥ 1.0.0)

Both `auth.env` and `media.env` ship with two boot-required blocks. Leaving them
unset makes the service **fail closed** at startup:

- **`TOKEN_ISSUER` / `TOKEN_AUDIENCE`** — required because
  `TOKEN_STRICT_VALIDATION` defaults to `true`. Use identical issuer/audience
  values across the auth service and every consumer (opt out with
  `TOKEN_STRICT_VALIDATION=false` for local-only experiments).
- **`EVENT_SIGNING_KEY`** — required because `EVENT_SIGNING_ENABLED` defaults to
  `true`. Use the **same** key in `auth.env` and `media.env`. The auth-state
  event bus is not wired into any service yet, so this is a boot-time requirement
  only; set `EVENT_SIGNING_ENABLED=false` in both files to defer it.

Initialize keys and local certificates:

```sh
bash init.sh
```

On Windows, run this from Git Bash.

Start the stack:

```sh
docker-compose up -d --build
```

If your Docker install supports Compose v2, `docker compose up -d --build` is
equivalent.

## Object storage

The storage backend (SeaweedFS, S3-compatible) has no `ports:` block — it is
reachable only on the Docker network, and only through Traefik's storage
router for browser-direct presigned ops:

| Endpoint | URL |
| --- | --- |
| S3 data path (via Traefik) | `https://storage.localhost` |

`storage-config` writes the backend's static identity table (admin +
`media-rw`) before it boots; `storage-init` then creates these logical
buckets and pins per-bucket CORS from `S3_CORS_ALLOW_ORIGIN`:

```text
public-media
private-media
sensitive-media
temp-media
archive-media
```

`media_service` waits for `storage-init` to complete before starting and
uses `S3_ACCESS_KEY` / `S3_SECRET_KEY` (the scoped `media-rw` identity), not
the `S3_ROOT_USER` admin credentials.

## URLs

| What | URL |
| --- | --- |
| Auth docs | `http://localhost:9000/user/docs` |
| Media docs | `http://localhost:9000/media/docs` |
| JWKS | `http://localhost:9000/user/.well-known/jwks.json` |
| Media metrics | `http://localhost:9000/media/metrics` |
| Traefik dashboard | `http://localhost:8080` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` |
| Storage (S3 data path) | `https://storage.localhost` |

## Observability

Prometheus scrapes:

| Job | Target | Path |
| --- | --- | --- |
| traefik | `traefik:8082` | built-in metrics |
| auth_user_service | `auth_user_service:8000` | `/user/metrics` |
| media_service | `media_service:8000` | `/media/metrics` |

Grafana uses the local Prometheus datasource. Default local credentials are
controlled by `grafana/config.monitoring`.

## Configuration Notes

- `.env` is infrastructure/bootstrap config. It provisions `AUTH_DB_*` and
  `MEDIA_DB_*` through `../shared/db_init/init-db.sh`, and supplies the Redis
  passwords used by `redis_cache` / `media_redis_cache` and the storage admin
  identity (`S3_ROOT_USER` / `S3_ROOT_PASSWORD`) read by `storage-config` /
  `storage-init` via `env_file`.
- `auth.env` and `media.env` are runtime application configs consumed by
  `auth-sdk-m8`. They use generic `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` — do
  **not** replace those with the `MEDIA_DB_*` / `AUTH_DB_*` names.
- Only `auth_user_service` connects to the auth Redis (`redis_cache`). The media
  service reaches the auth service over HTTP (`INTROSPECTION_URL`) for revocation.
- Use `MEDIA_REDIS_*` (→ `media_redis_cache`) for media-owned runtime state.
- `.env`, `auth.env`, and `media.env` hold secrets and are git-ignored (`*.env`);
  only the `*.example` files are tracked.
- The media service base path is `/media`.
- **Socketless Traefik (file provider only).** This hardened stack never mounts
  `/var/run/docker.sock`. Traefik routes via the **file provider only**
  (`traefik/traefik.yml` declares no `docker` provider); `auth-service` and
  `media-service` backends are declared statically in `traefik/dynamic_conf.yml`
  and resolve over Docker DNS by container name
  (`http://auth_user_service:8000`, `http://media_service:8000`), so no socket
  mount and no per-container `traefik.*` discovery labels are needed. Mounting
  the socket — even read-only — grants the Docker API, which is equivalent to
  host root. The `dev_ui_m8` example keeps the Docker provider as a local-only
  convenience. This contract is locked by
  `docker_compose/compose_policy_tests/test_compose_socket_policy.py`.
- Other compose examples are not updated by this hardened example.
- `app_net` / `scan_net` / `clamav_egress` carry **no** explicit `name:` —
  Compose project-prefixes each one, so this stack never shares a network
  with another project. Two compose projects must never declare the same
  literal `networks.*.name`: an explicit name is external and Docker treats
  it as shared, so whichever project boots first "owns" it and the second
  silently attaches, letting Docker DNS resolve a service name (e.g.
  `auth_user_service`) to **either** stack's container. See
  `.workspace/plans/stack/analysis/audit-fa-auth-jwks-kid-key-binding-2026-09-08.md`
  §0.2 for the measured collision this caused.

## Production deployment

This example is a **dev/home-lab default**, not a deployable artifact. A thin
**production overlay** drives it to a hardened posture **without** forking a
second stack that drifts — you apply it on top of the base, you do not copy a
different tree:

```sh
cp .env.production.example          .env
cp auth.env.production.example      auth.env.production
cp media.env.production.example     media.env.production
# fill in every `changethis`, provision real TLS certs (see below), then:
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

Requires Docker Compose **v2.24+** (for the `!reset` / `!override` merge tags).
When the overlay is **not** applied the dev base is unchanged — nothing dangerous
is ever default-on.

What the overlay changes vs. the dev default:

- **Fail-closed app config.** `ENVIRONMENT=production` + `STRICT_PRODUCTION_MODE=true`
  via `auth.env.production` / `media.env.production`. The services then fail closed
  at boot on placeholder/duplicate secrets, missing `ALLOWED_HOSTS`, missing
  `TOKEN_ISSUER`/`TOKEN_AUDIENCE`, localhost CORS, and unsafe internal-http /
  event-signing rollout (auth-sdk-m8 `check_config_health`). Docs are off,
  cookies are `Secure`, and every secret in the `*.example` files stays the bare
  `changethis` placeholder so an unfilled deploy refuses to start.
- **Real certs only.** `cert-init` stops being a self-signed generator and becomes
  a fail-closed **presence check** for operator-provisioned certs at
  `traefik/certs/local.crt` + `local.key`. It never mints a cert.
- **Minimal public surface.** Traefik publishes only `:80` (HTTP→HTTPS redirect)
  and `:443`. The dashboard (`:8080`) and the internal `:9000` service entryPoint
  are no longer host-published; DB / Redis / Prometheus / Grafana host ports are
  reset (`!reset []`) — all reachable only on the Docker network. (The storage
  backend already has no host ports in the hardened base; the overlay also
  repoints `storage-config` / `storage-init` at `media.env.production` so the
  identity table and buckets match the credentials `media_service` actually
  authenticates with.)
- **FQDN host rules.** `traefik/production_dynamic_conf.yml` replaces the dev
  ``Host(`localhost`)`` rules with real FQDNs (`auth.example.com`,
  `media.example.com`) and raises the TLS floor to 1.3. `Content-Security-Policy`
  and HSTS ship **commented out** in `security-headers-prod` — opt in only after
  TLS is stable on a trusted certificate (HSTS, once sent, makes browsers refuse
  plain HTTP to the host for the full `stsSeconds` even after you disable it).
  The app **also** enforces the hosts via `ALLOWED_HOSTS`
  (`TrustedHostMiddleware`); the proxy rules are defense-in-depth. Update both to
  your domain.
- **Pinned auth image** (the media image is already pinned in the base).

**Topology.** The overlay publishes both `/user` and `/media` over HTTPS — the
**Case B** topology where the fa-ui front end (or a browser extension) calls the
services directly. For the more closed **Case A** (UI/gateway-only), delete the
`media-public-router` from `production_dynamic_conf.yml` so the media service is
reachable only on the Docker network. Either way the **security contract** path
exclusions stay: `/user/health`, `/user/metrics`, `/user/private`,
`/media/health` and `/media/metrics` are never publicly routable.

**Socketless by design.** The production path inherits the file-provider-only
Traefik config from the base (see the socketless note above): it never mounts
`/var/run/docker.sock`.

**Migrations.** The stack applies Alembic migrations automatically on `up` (the
app entrypoint runs the idempotent `alembic upgrade head`). For this single-node
overlay that is **kept** — images are pinned, so the migration set is
deterministic per release. For multi-replica / zero-downtime rollouts, gate it to
a one-shot run **before** starting the app instead:

```sh
docker compose -f docker-compose.yml -f docker-compose.production.yml \
  run --rm auth_user_service alembic upgrade head
```

The overlay contract is locked by
`docker_compose/compose_policy_tests/test_compose_production_overlay.py`.

## Common Commands

```sh
docker-compose config
docker-compose up -d --build
docker-compose ps
docker-compose logs -f media_service
docker-compose logs -f storage-init
docker-compose down
```

Resetting the DB is destructive:

```sh
bash init.sh --reset-db --yes
```

## Troubleshooting

**`changethis` rejection on startup**: replace placeholder values in `.env`,
`auth.env`, and `media.env`.

**Service exits at boot complaining about `EVENT_SIGNING_KEY` or
`TOKEN_ISSUER`/`TOKEN_AUDIENCE`**: these are required under auth-sdk-m8 ≥ 1.0.0.
Set them (identically across auth + media), or set `EVENT_SIGNING_ENABLED=false`
/ `TOKEN_STRICT_VALIDATION=false` for local-only runs.

**Media service cannot connect to storage**: inside Docker, use
`S3_ENDPOINT=storage:8333`. The backend has no host port in this stack — reach
it from the host only through the Traefik storage router
(`https://storage.localhost`).

**`storage-config` fails**: check `docker-compose logs storage-config`. It
fails closed on an empty/placeholder credential, a bucket name it can't embed
in JSON, or `S3_ROOT_USER` equal to `S3_ACCESS_KEY`.

**`storage-init` fails or buckets are missing**: check
`docker-compose logs storage-init`. It waits for `storage` to be healthy,
then creates the five buckets and pins CORS from `S3_CORS_ALLOW_ORIGIN`
(refuses a wildcard origin).

**DB user authentication fails**: confirm `media.env` `DB_USER` / `DB_PASSWORD`
match `.env` `MEDIA_DB_USER` / `MEDIA_DB_PASSWORD`. If `db_data/` already exists,
DB init will not rerun unless you reset it.

**Prometheus media target is down**: check `media_service` logs and confirm
`/media/metrics` is enabled with `METRICS_ENABLED=true`.
