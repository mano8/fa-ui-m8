# fa-ui-m8

## Authority

Read the workspace root `AGENTS.md` first. This repo follows the workspace
TypeScript/client policy; use workspace `.Codex/` plus this repo's `AGENTS.md`.

## Role

Single deployable Astro + Starlight UI app for M8. The actual app is in `app/`.

`fa-ui-m8` is a consumer/composer, not the owner of backend contracts. Service
features arrive through Astro plugin packages and HTTP contracts.

## Plugin Model

- `@mano8/astro-auth-m8` is the only required plugin and the default baseline.
- Every other plugin is optional per deployment: installed package plus matching
  `PUBLIC_*` env enables it.
- `@mano8/astro-media-m8` is optional for this app, but when enabled it must run
  after auth and use auth through the plugin adapter.
- A deployment configuration is packages installed + env vars set. Do not create
  branches, forks, or per-config repos for plugin combinations.
- Plugins own the headless runtime (`/react`, `/hooks`, `/api`) and ship default
  UI. `fa-ui-m8` may copy/edit shadcn registry skins, but must not fork plugin
  logic into local hooks or service clients.
- Registry skins should use pure shadcn/Tailwind patterns where possible. Auth
  account and media admin landing views should be dashboards, with secondary or
  destructive actions behind focused panels.

## Local Rules

- Static-first Astro; use React islands only for interactive UI.
- Keep business logic out of app components. Use plugin hooks/providers/clients.
- No service-layer imports and no cross-repo imports except package dependencies.
- Keep i18n aligned for `en`, `fr`, and `es`; registry labels come from the app.
- Use `@/*` for `app/src/*` imports.
- Use Tailwind v4 tokens in `app/src/styles/global.css`; avoid ad-hoc CSS files.
- Add shadcn primitives from `app/` with `npx shadcn@latest add <component>`.
- If required env changes, update `app/.env.example` and README as needed.

## Commands

Run from `app/`:

- `npm run dev`
- `npm run build`
- `npm test`
- `npm run test:coverage`



