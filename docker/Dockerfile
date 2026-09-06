# syntax=docker/dockerfile:1.7

# ---- Build stage ----
# Digest-pinned, not tag-only: a floating tag lets the same Dockerfile produce a
# different image tomorrow, which defeats reproducible builds and means an
# upstream compromise lands silently. The tag is kept alongside the digest so
# Dependabot's docker ecosystem can still resolve and bump the pair.
#
# Debian trixie (13), not bookworm (12): bookworm is oldstable and accumulates
# unfixed low/medium CVEs that never get backported. Node 24, not 26: 24 is the
# Active LTS line and is what CI actually exercises (see .github/workflows,
# matrix 22.18.0 + 24.x). Revisit 26 once it enters LTS and CI covers it.
FROM node:24-trixie@sha256:f7d34e58713740f9eef9092c0bd6ff10369d132f7238399a4b270f16d47fa608 AS build

WORKDIR /app

# The Astro app lives in app/ at the repo root (build context is the repo root).
# .npmrc here carries only `legacy-peer-deps=true` (a peer-resolution
# compatibility shim), never registry credentials — safe to copy as-is. If it
# ever needs to carry an auth token, switch to a `--mount=type=secret` instead
# of copying it into a layer.
COPY app/package.json app/package-lock.json app/.npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY app/ ./

# Astro's static output reads PUBLIC_* config at BUILD time (see
# app/.env.example): each var is baked into the generated HTML/JS, so it must
# be present before `npm run build`, not at container start. Defaults below
# mirror astro.config.mjs's own fallbacks exactly, so an unset build-arg
# behaves identically to today (auth-only, relative /user, localhost site
# URL) — only an operator-supplied value changes the build.
#
# CONSEQUENCE FOR DEPLOYMENT: the build args ARE the deployment's identity. Two
# stacks that enable different plugins need two different images, and each must
# carry its own tag (see the `image:` pins in the compose stacks). Never reuse
# one tag across two different build-arg sets.
ARG PUBLIC_SITE_URL=http://localhost:4321
ARG PUBLIC_AUTH_API_BASE=/user
ARG PUBLIC_MEDIA_API_BASE=
ARG PUBLIC_MEDIA_V1_BASE=/v1
ARG PUBLIC_MEDIA_STORAGE_ORIGIN=
ARG PUBLIC_PROMPT_API_BASE=
ARG PUBLIC_PROMPT_API_PREFIX=/fastapi
ARG PUBLIC_REPARTO_API_BASE=
ARG PUBLIC_REPARTO_API_PREFIX=
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_AUTH_API_BASE=$PUBLIC_AUTH_API_BASE \
    PUBLIC_MEDIA_API_BASE=$PUBLIC_MEDIA_API_BASE \
    PUBLIC_MEDIA_V1_BASE=$PUBLIC_MEDIA_V1_BASE \
    PUBLIC_MEDIA_STORAGE_ORIGIN=$PUBLIC_MEDIA_STORAGE_ORIGIN \
    PUBLIC_PROMPT_API_BASE=$PUBLIC_PROMPT_API_BASE \
    PUBLIC_PROMPT_API_PREFIX=$PUBLIC_PROMPT_API_PREFIX \
    PUBLIC_REPARTO_API_BASE=$PUBLIC_REPARTO_API_BASE \
    PUBLIC_REPARTO_API_PREFIX=$PUBLIC_REPARTO_API_PREFIX \
    NODE_ENV=production

# Starlight/Astro's default output is a static site: `npm run build` writes it
# to dist/. Fail the build (not just at runtime) if that assumption ever breaks.
RUN npm run build && \
    test -d dist && \
    test -n "$(find dist -mindepth 1 -maxdepth 1 -print -quit)"


# ---- Static server stage ----
# sirv-cli is resolved in its OWN stage so the runtime image never sees npm's
# working state (cache, lockfile metadata, temp trees) — only the finished
# node_modules tree is copied forward.
FROM node:24-trixie-slim@sha256:50c3b2f6988dfc307b86e5301d69611af31f4789bdf232863b07d3b02fe55ae0 AS server

WORKDIR /opt/static-server

# Installed into a SELF-CONTAINED prefix, not `--global`. A global install
# hoists sirv-cli's transitive deps (sade, sirv, kleur, …) as siblings directly
# under /usr/local/lib/node_modules, so copying only the sirv-cli directory
# forward yields a binary that cannot resolve its own imports. A local prefix
# keeps the whole resolvable tree under one path that copies as a unit.
#
# Pinned exact version — bump deliberately, never track a moving tag.
# --ignore-scripts: sirv-cli and its ~8 transitive deps declare no install
# scripts, so this changes nothing today and fails closed if one ever appears.
# The final `--version` is a build-time smoke test: it fails the build here if
# the copied-forward tree is ever incomplete, instead of at container start.
RUN npm install --ignore-scripts --omit=dev --no-audit --no-fund sirv-cli@3.0.1 && npm cache clean --force && node node_modules/sirv-cli/bin.js --version


# ---- Runtime image ----
# No Node app code, npm, or the Astro CLI in production — `astro preview` is a
# local verification server, not a production one, and none of this repo's
# other services use nginx, so we stay in the Node ecosystem and swap in
# `sirv-cli`: a small, purpose-built static file server (~8 tiny deps, no
# install scripts) instead of shipping the app's full (much heavier)
# node_modules tree just to serve prebuilt HTML/JS/CSS.
FROM node:24-trixie-slim@sha256:50c3b2f6988dfc307b86e5301d69611af31f4789bdf232863b07d3b02fe55ae0 AS runtime

ARG UID=1000
ARG GID=1000
RUN (getent group $GID  >/dev/null || groupadd -g $GID appgroup) && \
    (getent passwd $UID >/dev/null || useradd -m -u $UID -g $GID appuser)

# Strip every package manager from the PRODUCTION image. A static file server
# needs none of them, and their absence removes the most useful post-exploit
# primitive in a Node container: the ability to fetch and execute new code.
# Globs tolerate absence so this stays correct across base-image revisions.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn-v* /usr/local/bin/yarn /usr/local/bin/yarnpkg \
           /root/.npm /tmp/* && \
    ! command -v npm >/dev/null

COPY --from=server /opt/static-server/node_modules /opt/static-server/node_modules

WORKDIR /app

# Copied as root, NOT chowned to $UID: the runtime user must be able to read the
# site and never to rewrite it. Combined with the compose stacks' `read_only:
# true`, the served bytes are immutable for the life of the container.
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

USER $UID:$GID

EXPOSE 8080

# /en/ (astro.config.mjs's defaultLocale), not /: every locale in this build
# is a prefixed route (no root locale), so dist/ has no top-level index.html
# and a bare `GET /` always 404s. Update the path here if defaultLocale changes.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:8080/en/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Invoked as `node <path>` rather than through a bin symlink on PATH: one fewer
# indirection to get wrong, and it does not depend on a symlink or an exec bit
# surviving the cross-stage COPY.
CMD ["node", "/opt/static-server/node_modules/sirv-cli/bin.js", "dist", "--host", "0.0.0.0", "--port", "8080", "--etag"]

# ---- Provenance ----
# Last so a changed revision/version invalidates nothing above it. Populate from
# CI (`--build-arg VCS_REF=$(git rev-parse HEAD)`); the defaults keep a local
# `docker compose build` working without them. `docker image inspect` then
# answers "which commit and which plugin set is this container running?" —
# unanswerable today, and the first question asked during an incident.
ARG UI_VERSION=0.0.0-dev
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.title="fa-ui-m8" \
      org.opencontainers.image.description="Astro/Starlight M8 front end, served as static files by sirv-cli" \
      org.opencontainers.image.source="https://github.com/mano8/fa-ui-m8" \
      org.opencontainers.image.version="$UI_VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE" \
      org.opencontainers.image.licenses="Apache-2.0"
