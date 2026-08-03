# syntax=docker/dockerfile:1.7

# ---- Build stage ----
FROM node:24-bookworm AS build

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


# ---- Static runtime image ----
# No Node app code, npm, or the Astro CLI in production — `astro preview` is a
# local verification server, not a production one, and none of this repo's
# other services use nginx, so we stay in the Node ecosystem and swap in
# `sirv-cli`: a small, purpose-built static file server (~8 tiny deps, no
# install scripts) instead of shipping the app's full (much heavier)
# node_modules tree just to serve prebuilt HTML/JS/CSS.
FROM node:24-bookworm-slim AS runtime

ARG UID=1000
ARG GID=1000
RUN (getent group $GID  >/dev/null || groupadd -g $GID appgroup) && \
    (getent passwd $UID >/dev/null || useradd -m -u $UID -g $GID appuser)

# Pinned exact version — bump deliberately, never track a moving tag.
RUN npm install --global --ignore-scripts sirv-cli@3.0.1 && \
    npm cache clean --force

WORKDIR /app

COPY --from=build /app/dist ./dist

USER $UID:$GID

EXPOSE 8080

# /en/ (astro.config.mjs's defaultLocale), not /: every locale in this build
# is a prefixed route (no root locale), so dist/ has no top-level index.html
# and a bare `GET /` always 404s. Update the path here if defaultLocale changes.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:8080/en/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "8080", "--etag"]
