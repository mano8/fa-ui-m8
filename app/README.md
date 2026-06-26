# Starlight Starter Kit: Basics

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

```bash
npm create astro@latest -- --add react --template starlight
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```bash
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## add Tailwind

(Installation guide)[https://tailwindcss.com/docs/installation/framework-guides/astro]

```bash
npm install tailwindcss @tailwindcss/vite
```

## Add Schadcn

(Installation guide)[https://ui.shadcn.com/docs/installation/astro#scaffold-with-cli]

Add the following code to the `tsconfig.json` file to resolve paths:

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

Run the `init` command to scaffold a new Astro project. Follow the prompts to configure your project: base, preset, monorepo, and more.

```bash
npx shadcn@latest init -t astro
```

## Auth integration

The UI integrates with `fa-auth-m8` from client-only React islands. The default backend base path is
same-origin `/user`, which matches the Traefik dev stack route.

Environment variables:

```bash
PUBLIC_AUTH_API_BASE=/user
# Same-origin callback (the default, no configuration needed).
# For absolute override redirects, set PUBLIC_AUTH_OAUTH_REDIRECT and
# PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES (see .env.example for rules).
PUBLIC_SITE_URL=http://localhost:4321
```

Auth routes are localized through Starlight locales:

- `/en/auth/login`, `/fr/auth/login`, `/es/auth/login`
- `/en/auth/signup`, `/fr/auth/signup`, `/es/auth/signup`
- `/en/auth/callback`, `/fr/auth/callback`, `/es/auth/callback`
- `/en/user/account`, `/fr/user/account`, `/es/user/account`

Security model:

- Access tokens are kept in memory only.
- Refresh uses the HttpOnly `refresh_token` cookie with `credentials: "include"`.
- The PKCE verifier is stored temporarily in `sessionStorage` and removed during callback handling.
- Admin hooks check `user.is_superuser` before calling superuser endpoints.
- API responses are validated with Zod schemas.

Verification:

```bash
npm test
npm run test:coverage
npm run build
```

Before production, verify the live auth contract against the running backend:

```bash
curl http://localhost:8000/user/openapi.json
```

OAuth redirect validation: the UI applies an early-warning check that mirrors backend policy.
Same-origin callbacks (no `PUBLIC_AUTH_OAUTH_REDIRECT` set) are always accepted.
Absolute override redirects are validated before enabling the Google login button:
`https://` overrides require a matching entry in `PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES`;
`http://` overrides are accepted only for `localhost` / `127.0.0.1` (dev-only);
`chrome-extension://` overrides require a matching prefix (fail-closed).
Backend validation remains authoritative — the UI check catches misconfiguration early.

## Auth account dashboard (shadcn registry)

The account page's landing tab is an **activity dashboard**, and every other tab
(profile, sessions, API keys, admin users) is also a registry skin from the
`@fa-m8/astro-auth-m8` shadcn registry. The logic stays a live dependency
(`useAuth`/`useProfile`/`useSessions`/`useApiKeys`/`useUsers`/`useDashboard` from the
package) — only the skin is copied in, adopting radix-nova tokens and editable here.

What was added from the registry (run from `app/`):

```bash
npx shadcn add ./node_modules/@fa-m8/astro-auth-m8/registry/r/dashboard-overview.json
npx shadcn add ./node_modules/@fa-m8/astro-auth-m8/registry/r/profile-panel.json
npx shadcn add ./node_modules/@fa-m8/astro-auth-m8/registry/r/sessions-panel.json
npx shadcn add ./node_modules/@fa-m8/astro-auth-m8/registry/r/api-keys-panel.json
npx shadcn add ./node_modules/@fa-m8/astro-auth-m8/registry/r/admin-users-panel.json
# pulls: src/components/fa-auth/{dashboard-overview,activity-bar-chart,profile-panel,
#        sessions-panel,api-keys-panel,admin-users-panel}.tsx + shadcn primitives
```

`components.json` declares the registry namespace (`@fa-m8-auth`) for documentation;
local installs use the direct `.json` path above (shadcn resolves namespaced registries
over HTTP, file paths from disk). [src/components/auth/AccountApp.tsx](src/components/auth/AccountApp.tsx)
mounts `DashboardOverview` as the **default** nav item and the four panels as secondary
tabs, passing locale labels from `t.auth.*` (en/es/fr) to each. The previous local copies
(`src/components/auth/{ProfilePanel,SessionInfo,ApiKeysPanel,AdminUsersPanel}.tsx` and the
`src/hooks/auth/{useProfile,useSessions,useApiKeys,useUsers,useDashboard}.ts` adapters)
were removed — the registry is now the single source of truth for the skin. To re-pull
after a plugin upgrade, re-run the `shadcn add` commands with `--overwrite`.

See the plugin's "shadcn views" README for the full item list (incl. `data-table` and the
`account-dashboard` shell used by other configurations).

## Media admin dashboard (shadcn registry)

When media is enabled (`PUBLIC_MEDIA_API_BASE` set), the Media Studio's superuser
**Admin** tab landing view is a **storage dashboard**, and the destructive operations
live behind confirmations in a separate **Maintenance** tab — both registry skins from
the `@fa-m8/astro-media-m8` registry. The logic stays a live dependency (`useMediaAdmin`
from the package) — only the skin is copied in, adopting radix-nova tokens and editable
here.

What was added from the registry (run from `app/`):

```bash
npx shadcn add ./node_modules/@fa-m8/astro-media-m8/registry/r/media-dashboard-overview.json
npx shadcn add ./node_modules/@fa-m8/astro-media-m8/registry/r/media-maintenance-panel.json
# pulls: src/components/fa-media/{media-dashboard-overview,media-storage-chart,
#        data-table,media-maintenance-panel}.tsx + shadcn primitives (table, alert-dialog)
```

`components.json` declares the registry namespace (`@fa-m8-media`) for documentation;
local installs use the direct `.json` path above.
[src/components/media/MediaApp.tsx](src/components/media/MediaApp.tsx) mounts
`MediaDashboardOverview` as the admin landing view and `MediaMaintenancePanel` as a
superuser-only Maintenance tab, passing locale labels from `t.media.admin.*` (en/es/fr)
to each. The app keeps its own media chrome + `MediaProvider` (fa-auth-backed adapter),
so it consumes the two panel items rather than the registry's `admin-media-dashboard`
shell. To re-pull after a plugin upgrade, re-run the `shadcn add` commands with
`--overwrite`.

## Deployment contract (plugins + env = a configuration)

fa-ui-m8 is a **single deployable app**. Its backend microservices are composable
Astro plugins published as independent npm packages — never as branches or
per-config repos. A *configuration* is defined entirely by two things:

1. **Which plugins are installed** (npm packages present in `node_modules`).
2. **Which `PUBLIC_*` env vars are set** (per the canonical names below).

There are no per-deployment branches and no duplicated config across repos. The
same `astro.config.mjs` serves every configuration.

| Plugin | Package | Required? | Enabled when |
| :-- | :-- | :-- | :-- |
| Auth | `@fa-m8/astro-auth-m8` | **Required** (the one mandatory peer) | always |
| Media | `@fa-m8/astro-media-m8` | Opt-in (`optionalDependencies`) | package installed **and** `PUBLIC_MEDIA_API_BASE` set |

How the media gate works: [`astro.config.mjs`](astro.config.mjs) reads
`PUBLIC_MEDIA_API_BASE` and, only when it is set, `await import()`s the media
package and wires it after auth. With the var unset the package is never imported,
so an auth-only deployment builds even with the media package absent. Because the
UI is a **static build** (`output: static`), this gate is evaluated at **build
time** — the env var must be present when `astro build` runs (e.g. via the compose
service's `environment:` block), not merely at runtime.

Canonical env names (operator-facing — set these):

| Var | Plugin | Purpose |
| :-- | :-- | :-- |
| `PUBLIC_AUTH_API_BASE` | auth | backend auth base path |
| `PUBLIC_MEDIA_API_BASE` | media | backend media base path **and** the media on/off gate |
| `PUBLIC_MEDIA_V1_BASE` | media | versioned media routes sub-prefix |
| `PUBLIC_MEDIA_STORAGE_ORIGIN` | media | browser-direct storage origin for CSP `connect-src` (e.g. `https://storage.example.com`); unset for same-origin storage |

The media integration re-exposes the `PUBLIC_MEDIA_*` values internally as
`PUBLIC_FA_MEDIA_*` at build time; those are an implementation detail and must not
be set directly.

> Note: fa-ui-m8's own `src/` still contains hand-maintained media components that
> import `@fa-m8/astro-media-m8/react` directly, which is why the package is kept
> installed as an `optionalDependencies` rather than fully removed. Decoupling those
> source imports (so a true auth-only checkout needs no media package at all) is
> tracked by the registry/reconciliation work in the fa-ui-m8 plan (Steps 5–6).
> Likewise, the `file:` dependency paths are local dev links; published
> configurations will pin registry-versioned ranges once the plugins are published.

## Content-Security-Policy (production)

The static UI ships a production Content-Security-Policy as a `<meta http-equiv="content-security-policy">`
tag baked into every page at build time (plan item 8.1). Because the site is a static build
(`output: static`) there is no UI runtime to set response headers, so the meta tag is the authoritative
control and the policy travels with `dist/` regardless of which host serves it. CSP is a **no-op under
`astro dev`** (a Vite limitation) — it only takes effect in `npm run build` / `npm run preview` and in
production, so local development is unaffected.

Where it lives:

- [`src/lib/csp.ts`](src/lib/csp.ts) — the policy (directives + helpers), fully unit-tested.
- [`astro.config.mjs`](astro.config.mjs) — enables `security.csp` (Astro hashes inline scripts).
- [`src/middleware.ts`](src/middleware.ts) — relaxes the emitted `style-src` at build time.

Policy shape and the React/Tailwind trade-off:

- **Scripts are strict.** `script-src` is `'self'` plus the per-build hashes Astro computes for
  Starlight's inline theme/init scripts and island bootstraps — **no `'unsafe-inline'`** (the real XSS
  vector stays shut). `'wasm-unsafe-eval'` is added only so Starlight's Pagefind search (compiled
  WebAssembly) keeps working.
- **Styles are relaxed.** React, Radix/shadcn, and Starlight rely on runtime inline styles and
  `style="…"` attributes that hash-based CSP cannot cover (browsers silently void `'unsafe-inline'`
  when a hash shares the directive). The build therefore rewrites `style-src` to a hash-free
  `style-src 'self' 'unsafe-inline'`. Style injection is a far weaker vector than script injection.
- Everything else (`default-src`, `base-uri`, `object-src`, `frame-ancestors`, `form-action`,
  `img/font/connect/worker-src`) is locked to a minimal `'self'` baseline. `connect-src` defaults to
  `'self'` (the UI calls same-origin `/user` and `/media`); if you point the UI at absolute API origins
  via `PUBLIC_AUTH_API_BASE` / `PUBLIC_MEDIA_API_BASE` / `PUBLIC_MEDIA_V1_BASE` / `PUBLIC_SITE_URL`,
  those origins are added to `connect-src` automatically at build time. For deployments where the browser
  POSTs presigned uploads directly to a separate MinIO/object-storage host, set
  `PUBLIC_MEDIA_STORAGE_ORIGIN` to that host's `scheme://host[:port]` and it is included in `connect-src`
  without needing to wildcard the directive.

This is the **UI-layer** CSP and is separate from the JSON-API CSP that Traefik emits for the
auth/media services (just `frame-ancestors 'none'`). Validate with `npm run build` and confirm the meta
tag in `dist/**/index.html`; then load the build (`npm run preview`) and check the browser console shows
no CSP violations on login, refresh, media upload, search, and static-asset loads.

## Required tools

- 1. Zod

```bash
npm install zod
```

## Tests

(Installation guide)[https://docs.astro.build/en/guides/testing/]

Install Vitest, a DOM library for component rendering (such as happy-dom), and the testing library

```bash
npm install -D vitest happy-dom
```

Create a vitest.config.ts in the root of your project. Astro provides a getViteConfig() helper that automatically merges your test setups.

```typescript
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom', // or 'node' for pure backend tests
    globals: true,
  },
});
```

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
