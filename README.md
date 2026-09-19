# fa-ui-m8

Static-first Astro + Starlight front end for the M8 platform. It hosts the
public site, docs, and authenticated app surfaces, and composes optional
backend features (media, prompt, teaching-assignment) as plugin packages
behind feature flags.

![CI/CD](https://github.com/mano8/fa-ui-m8/actions/workflows/CI.yaml/badge.svg?branch=main)
[![codecov](https://codecov.io/github/mano8/fa-ui-m8/graph/badge.svg?token=HPXRTKXP2X)](https://codecov.io/github/mano8/fa-ui-m8)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4285b504bd86427fbce6afa597580f4a)](https://app.codacy.com/gh/mano8/fa-ui-m8/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

---

## What this is

- **App**: Astro 7 + Starlight, static build (`output: static`), React
  islands only where interaction is needed.
- **Layout**: the deployable app lives entirely in [`app/`](app/). Everything
  outside `app/` (Docker images, Compose stacks, docs) supports that one app —
  there is no separate frontend elsewhere in this repo.
- **Auth**: `@mano8/astro-auth-m8` is the one required plugin — every
  deployment needs it.
- **Optional features**: media, prompt, and teaching-assignment ("reparto")
  ship as opt-in plugins. Each is enabled by installing its package **and**
  setting its `PUBLIC_*_API_BASE` env var; leaving the var unset keeps the
  plugin's routes and code out of the build entirely.
- **Localization**: English, French, and Spanish throughout (`/en`, `/fr`,
  `/es`).

## Quick start

```bash
cd app
npm install
cp .env.example .env   # then set PUBLIC_AUTH_API_BASE at minimum
npm run dev             # http://localhost:4321
```

The dev server needs a running auth backend to actually log in — see
[Running it with Docker](#running-it-with-docker) for a batteries-included stack.

### Common commands (run from `app/`)

| Command | Action |
| :-- | :-- |
| `npm run dev` | Start the local dev server (`localhost:4321`) |
| `npm run build` | Production static build to `app/dist/` |
| `npm run preview` | Serve the built output locally |
| `npm test` | Run the unit test suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint `src/` |
| `npm run typecheck` | `astro sync` + strict TypeScript check |
| `npm run verify:auth-only` | Assert an auth-only build has no optional-plugin leakage |
| `npm run verify:plugin-matrix` | Assert every plugin on/off combination builds and typechecks cleanly |
| `npm run verify:csp` | Assert the production CSP is well-formed |

## Optional plugins at a glance

| Plugin | Package | Gate env var | Feature |
| :-- | :-- | :-- | :-- |
| Auth (required) | `@mano8/astro-auth-m8` | `PUBLIC_AUTH_API_BASE` | login, sessions, profile, API keys, admin users |
| Media | `@mano8/astro-media-m8` | `PUBLIC_MEDIA_API_BASE` | media library, uploads, storage admin |
| Prompt | `@mano8/astro-prompt-m8` | `PUBLIC_PROMPT_API_BASE` | prompt engine admin dashboard |
| Reparto | `@mano8/astro-reparto-m8` | `PUBLIC_REPARTO_API_BASE` | department teaching-assignment workflow |

A plugin is only ever wired in when its package is installed **and** its gate
variable is set at build time — a disabled plugin resolves to local stubs, so
an auth-only build typechecks and ships none of its routes. Full details,
every env var, security model, CSP policy, and the reparto feature's routes
and workflow live in [`app/README.md`](app/README.md).

## Running it with Docker

Three ready-to-run Compose stacks live in [`docker_compose/`](docker_compose/):

| Stack | Best for | UI runs as |
| :-- | :-- | :-- |
| [`dev_ui_m8`](docker_compose/dev_ui_m8/) | Day-to-day UI work against auth + media | container, live reload |
| [`dev_local_full_ui_m8`](docker_compose/dev_local_full_ui_m8/) | Full platform incl. reparto (the only stack with `reparto_service`) | on the host (`npm run dev` from `app/`) |
| [`hardened_ui_m8`](docker_compose/hardened_ui_m8/) | Verifying the production build, CSP, and hardened posture | container, serving built `dist/` |

See [`docker_compose/README.md`](docker_compose/README.md) for the full
decision guide, port map, and environment file layout.

## More documentation

- [`app/README.md`](app/README.md) — the full guide: auth integration,
  shadcn registry dashboards, the plugin deployment contract, the reparto
  three-stage workflow, Content-Security-Policy, and testing.
- [`REPOSITORY_CONTEXT.md`](REPOSITORY_CONTEXT.md) — repository role,
  conventions, and standalone authority notes for agents working in this repo.
- [`docker_compose/README.md`](docker_compose/README.md) and
  [`docker_compose/SECURITY.md`](docker_compose/SECURITY.md) — stack
  architecture and hardening notes.

## License

Apache License 2.0 — see [`app/LICENSE`](app/LICENSE).
