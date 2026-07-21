# fa-ui-m8

## Layer

Client: a static-first Astro and Starlight UI and documentation host. The deployable
application lives in `app/`; `app/` is internal to this repository, not a separate
repository or workspace target.

## Role and plugin model

`fa-ui-m8` composes user-facing features but does not own backend contracts. Features
arrive through Astro plugin packages and HTTP contracts.

- `@mano8/astro-auth-m8` is the required baseline plugin. Other plugins are optional
  per deployment: their package must be installed and its matching `PUBLIC_*`
  configuration supplied.
- Load optional plugins after auth so an auth-only build does not require them. Use
  the plugin adapter for authenticated optional features.
- Plugins own their headless runtime, hooks, and API clients. This app may copy or
  adapt shadcn registry skins, but must not fork plugin logic into local hooks or
  service clients.
- Keep host-specific integration points small and stable. Apply generic host
  procedures only when the relevant host task is explicitly selected.

## Local architecture and conventions

- Keep business logic out of app components; use plugin hooks, providers, and
  clients. Do not import service-layer code or cross-repository source.
- Use static Astro by default and React islands only when interaction requires them.
- Use `@/*` for imports rooted at `app/src/*`.
- Keep English, French, and Spanish content and registry labels aligned.
- Use Tailwind v4 tokens in `app/src/styles/global.css`; avoid ad-hoc CSS files.
- Add shadcn primitives from `app/` with `npx shadcn@latest add <component>`.
- When environment requirements change, update `app/.env.example` and relevant
  repository documentation.

## Repository commands

Run from `app/`:

- `npm run dev`
- `npm run build`
- `npm test`
- `npm run test:coverage`

## Standalone authority

This file and repository documentation provide the local context. A verified nearest
workspace may optionally add launcher-selected policies and tasks; its absence is a
successful standalone condition and never requires a parent workspace.
