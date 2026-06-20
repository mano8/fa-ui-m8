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
# Optional Google OAuth.
# Default UI behavior shows Google only for non-HTTP(S) native redirects.
# If your running stack permits HTTP(S) redirect targets, set:
# PUBLIC_AUTH_GOOGLE_ENABLED=true
# PUBLIC_AUTH_OAUTH_REDIRECT=chrome-extension://your-extension-id/auth/callback
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

The currently probed `/user/google-api/login-url/` endpoint rejected
`https://localhost:4430/en/auth/callback` with `400 redirect_target scheme not allowed: web origins
are not permitted`. The UI therefore hides Google login by default for HTTP(S) redirects, but it can
be enabled with `PUBLIC_AUTH_GOOGLE_ENABLED=true` when the running stack/backend permits those
redirect targets.

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
