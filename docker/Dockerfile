FROM node:24-bookworm AS build

WORKDIR /app

# The Astro app lives in app/ at the repo root (build context is the repo root).
COPY app/package*.json ./
RUN npm ci

COPY app/ ./

RUN npm run build

# Drop devDependencies (vitest, testing libs, etc.) so they never reach the
# runtime image. `astro` itself is a runtime dependency, so `astro preview`
# still works after pruning.
RUN npm prune --omit=dev


# ---- Runtime image ----
FROM node:24-bookworm-slim

ARG UID=1000
ARG GID=1000
RUN (getent group $GID  >/dev/null || groupadd -g $GID appgroup) && \
    (getent passwd $UID >/dev/null || useradd -m -u $UID -g $GID appuser)

WORKDIR /app

ENV NODE_ENV=production

# Ship the built static output plus the pruned (prod-only) deps needed to serve
# it. Source (src/) and devDependencies are intentionally NOT copied.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/astro.config.mjs ./astro.config.mjs

# Production entrypoint serves dist/ via a static server (astro preview), never
# the Vite dev server. A missing source file already fails `docker build`; the
# guard below also fails the build if the file is present but empty.
COPY docker/entrypoint.prod.sh /usr/local/bin/entrypoint.sh
RUN test -s /usr/local/bin/entrypoint.sh || \
    (echo 'FATAL: docker/entrypoint.prod.sh is missing or empty' >&2; exit 1)
RUN chmod +x /usr/local/bin/entrypoint.sh

USER $UID:$GID

EXPOSE 4321

ENTRYPOINT ["entrypoint.sh"]
