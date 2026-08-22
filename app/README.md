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

[Installation guide](https://tailwindcss.com/docs/installation/framework-guides/astro)

```bash
npm install tailwindcss @tailwindcss/vite
```

## Add Schadcn

[Installation guide](https://ui.shadcn.com/docs/installation/astro#scaffold-with-cli)

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
- Auth and media admin hooks check `user.is_superuser` before calling superuser endpoints.
- The prompt admin surface gates on a role floor instead: `PUBLIC_PROMPT_ADMIN_ROLE`
  (default `admin`), matching `require_admin` on `prompt-engine-m8`'s `/dashboard/*`.
  An explicit `is_superuser` flag still passes.
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
`@mano8/astro-auth-m8` shadcn registry. The logic stays a live dependency
(`useAuth`/`useProfile`/`useSessions`/`useApiKeys`/`useUsers`/`useDashboard` from the
package) — only the skin is copied in, adopting radix-nova tokens and editable here.

What was added from the registry (run from `app/`):

```bash
npx shadcn add ./node_modules/@mano8/astro-auth-m8/registry/r/dashboard-overview.json
npx shadcn add ./node_modules/@mano8/astro-auth-m8/registry/r/profile-panel.json
npx shadcn add ./node_modules/@mano8/astro-auth-m8/registry/r/sessions-panel.json
npx shadcn add ./node_modules/@mano8/astro-auth-m8/registry/r/api-keys-panel.json
npx shadcn add ./node_modules/@mano8/astro-auth-m8/registry/r/admin-users-panel.json
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
the `@mano8/astro-media-m8` registry. The logic stays a live dependency (`useMediaAdmin`
from the package) — only the skin is copied in, adopting radix-nova tokens and editable
here.

What was added from the registry (run from `app/`):

```bash
npx shadcn add ./node_modules/@mano8/astro-media-m8/registry/r/media-dashboard-overview.json
npx shadcn add ./node_modules/@mano8/astro-media-m8/registry/r/media-maintenance-panel.json
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
| Auth | `@mano8/astro-auth-m8` | **Required** (the one mandatory peer) | always |
| Media | `@mano8/astro-media-m8` | Opt-in (`optionalDependencies`) | package installed **and** `PUBLIC_MEDIA_API_BASE` set |
| Prompt | `@mano8/astro-prompt-m8` | Opt-in (`optionalDependencies`) | package installed **and** `PUBLIC_PROMPT_API_BASE` set |
| Reparto | `@mano8/astro-reparto-m8` | Opt-in (`optionalDependencies`) | package installed **and** `PUBLIC_REPARTO_API_BASE` set |

How the gate works (the same shape for every optional plugin):
[`astro.config.mjs`](astro.config.mjs) reads the plugin's `PUBLIC_*_API_BASE` and,
only when it is set *and* the package is installed, `await import()`s it and wires
it after auth. With the var unset the package is never imported, so an auth-only
deployment builds even with the optional packages absent; when the var is set but
the package is missing, the config warns and leaves the plugin off rather than
failing the build. Because the UI is a **static build** (`output: static`), this
gate is evaluated at **build time** — the env var must be present when
`astro build` runs (e.g. via the compose service's `environment:` block), not
merely at runtime.

A disabled plugin's imports resolve to local stubs (`src/lib/reparto-stubs/`,
and the equivalents for the other plugins), so a disabled build still typechecks
and emits **none** of the plugin's routes. `npm run verify:plugin-matrix` asserts
both directions across `auth-only`, `with-media`, `with-prompt`, `with-reparto`
and `all-on`.

Canonical env names (operator-facing — set these):

| Var | Plugin | Purpose |
| :-- | :-- | :-- |
| `PUBLIC_AUTH_API_BASE` | auth | backend auth base path |
| `PUBLIC_MEDIA_API_BASE` | media | backend media base path **and** the media on/off gate |
| `PUBLIC_MEDIA_V1_BASE` | media | versioned media routes sub-prefix |
| `PUBLIC_MEDIA_STORAGE_ORIGIN` | media | browser-direct storage origin for CSP `connect-src` (e.g. `https://storage.example.com`); unset for same-origin storage |
| `PUBLIC_PROMPT_API_BASE` | prompt | backend prompt base path **and** the prompt on/off gate |
| `PUBLIC_PROMPT_API_PREFIX` | prompt | optional API sub-prefix; leave unset for the current contract, where routes live directly below the base |
| `PUBLIC_PROMPT_ADMIN_ROLE` | prompt | minimum role for the prompt admin surface (defaults to `admin`, the `require_admin` floor the service enforces on `/dashboard/*`) |
| `PUBLIC_REPARTO_API_BASE` | reparto | backend reparto base path **and** the reparto on/off gate |
| `PUBLIC_REPARTO_API_PREFIX` | reparto | optional API sub-prefix; leave unset for the current contract, where routes live directly below the base |

Each integration re-exposes its `PUBLIC_<PLUGIN>_*` values internally as
`PUBLIC_FA_<PLUGIN>_*` at build time; those are an implementation detail and must
not be set directly.

> Note: the `file:` dependency paths are local dev links; published configurations
> will pin registry-versioned ranges once the plugins are published.

## Teaching assignment — reparto (opt-in)

`@mano8/astro-reparto-m8` adds the department teaching-assignment feature backed
by `reparto-docente-m8` on `/reparto`. It is an opt-in plugin like media and
prompt: install the package and set `PUBLIC_REPARTO_API_BASE`.

### The three stages

The domain is a three-stage workflow, and the left menu is grouped to match it.
The stage boundaries are real state transitions in the service, not UI phases:

1. **Configuration** — schools, academic years, departments, classroom stages,
   the teacher roster, the process's participants, its subjects and teaching
   groups, the group × subject matrix, and the leadership hour allocation.
2. **Planning** — one teaching plan per process. Materialize the matrix into
   *main* activities, add secondary ones (tutoring, co-teaching, support), reach
   both hour balances, then **lock** the plan and **generate** requirements.
3. **Assignment** — teachers take complete positions, in a LAN meeting with an
   ordered selection turn or directly; versions, exports and the audit trail.

### Routes

22 routes per locale, mounted under each Starlight locale prefix
(`/en/…`, `/es/…`, `/fr/…`). `[processId]` is the selected assignment process;
nav entries point at the placeholder `current` until one is opened.

| Group | Route | What |
| :-- | :-- | :-- |
| Configuration | `/reparto/processes` | process list — the entry point |
| Configuration | `/reparto` | department-head dashboard |
| Configuration | `/reparto/setup/schools` | schools |
| Configuration | `/reparto/setup/academic-years` | academic years |
| Configuration | `/reparto/setup/departments` | departments |
| Configuration | `/reparto/setup/classroom-stages` | classroom stages |
| Configuration | `/reparto/setup/teacher-roster` | teacher roster |
| Configuration | `/reparto/processes/[processId]/allocation` | allocation revisions |
| Configuration | `/reparto/processes/[processId]/participants` | process participants and their hours |
| Configuration | `/reparto/processes/[processId]/subjects` | subjects |
| Configuration | `/reparto/processes/[processId]/teaching-groups` | teaching groups |
| Configuration | `/reparto/processes/[processId]/group-subjects` | the group × subject matrix |
| Configuration | `/reparto/processes/[processId]/settings` | process settings |
| Planning | `/reparto/processes/[processId]/planning` | the teaching plan: materialize, activities, balances, lock |
| Planning | `/reparto/processes/[processId]/requirements` | generated positions |
| Planning | `/reparto/processes/[processId]/exports` | export centre (planning draft and provisional exports) |
| Assignment | `/reparto/processes/[processId]/assignments` | the assignment board |
| Assignment | `/reparto/meeting/[processId]` | LAN meeting and selection turns |
| Assignment | `/reparto/processes/[processId]/my-view` | a teacher's own view |
| Assignment | `/reparto/processes/[processId]/shared` | shared projection screen (no participant names) |
| Assignment | `/reparto/processes/[processId]/versions` | process versions |
| Assignment | `/reparto/processes/[processId]/exports` | export centre |
| Assignment | `/reparto/processes/[processId]/audit` | audit trail |

`exports` deliberately appears in both Stage 2 and Stage 3 — one route serving
the provisional and the final artifacts. `processes`/`dashboard` head the
Configuration group because nothing else can be opened before a process is
selected. Route paths are overridable through the integration's route fragments;
the table lists the defaults. The nav is built from the same route map, so a
route disabled in the config disappears from the menu rather than dangling.

### Allocation revisions

The leadership group-hour allocation is **immutable and append-only**. Recording
a new figure on `/allocation` supersedes the previous revision inside one
transaction and requires a reason plus its provenance; exactly one revision per
process is current. Nothing edits a revision in place, so the history of what was
allocated, when and on whose authority survives the plan being rebuilt.

The current revision is the target of the plan's **group** hour balance. Changing
it while a plan exists therefore invalidates that plan — the reconciliation panel
on `/planning` is where that change is resolved.

### The two balances

A plan is balanced on two independent axes, and both must be exact:

- **Group hours** — what the groups receive, against the current allocation
  revision.
- **Teacher hours** — what the teachers carry, against the sum of the
  participants' base + extra weekly hours.

They are legitimately different numbers: a co-teaching activity of 2 h for two
teachers adds 2 group hours and 4 teacher hours. `120 / 124` is the shape of a
correct plan, not a discrepancy. Only a `BALANCED` plan can be locked, and only a
locked plan generates requirements.

### Roles

Configuration and planning mutations belong to the department head; a teacher
reads planning-safe summaries and their own view, and the shared screen renders
nameless aggregates. The service is authoritative — the UI mirrors those rules so
the operator is not offered actions the backend will refuse.

### Running it locally

Only the [`dev_local_full_ui_m8`](../docker_compose/dev_local_full_ui_m8) stack
runs `reparto_service`. It ships no UI container, so run the host from `app/`:

```sh
npm run dev     # http://localhost:4321, with PUBLIC_REPARTO_API_BASE set
```

For the development **database reset** — including the `shared_migrations/`
step that makes it a clean one — and the `SEED_EXAMPLE_DATA` worked example
that lands a ready stage-1 department to walk the three stages against, see
[that stack's README](../docker_compose/dev_local_full_ui_m8/README.md).

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

[Installation guide](https://docs.astro.build/en/guides/testing/)

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
