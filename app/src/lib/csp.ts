import type { AstroUserConfig } from 'astro';

type SecurityConfig = NonNullable<AstroUserConfig['security']>;
type CspConfig = Exclude<NonNullable<SecurityConfig['csp']>, boolean>;
type CspDirective = NonNullable<CspConfig['directives']>[number];
type EnabledCspSecurityConfig = SecurityConfig & {
  csp: CspConfig & {
    directives: CspDirective[];
    scriptDirective: NonNullable<CspConfig['scriptDirective']> & {
      resources: string[];
      hashes: string[];
    };
  };
};

/**
 * Production Content-Security-Policy for the Astro UI (plan item 8.1).
 *
 * This is the *UI-layer* CSP and is intentionally separate from the JSON-API CSP
 * that Traefik emits for the auth/media services (which is just
 * `frame-ancestors 'none'` — see the Traefik `dynamic_conf.yml` files under
 * `docker_compose/`).
 *
 * Enforcement model
 * -----------------
 * The UI ships as a fully static build (`output: static`), so there is no UI
 * runtime to set response headers. Astro's `security.csp` is therefore the
 * authoritative control: at *build* time Astro hashes every inline `<script>` it
 * emits and writes a `<meta http-equiv="content-security-policy">` into each
 * page's `<head>`. The policy travels with the HTML regardless of which host
 * serves `dist/`. CSP is a no-op under `astro dev` (Vite limitation), so the
 * developer/home-lab experience is unchanged — it only takes effect in
 * `build`/`preview` and in production.
 *
 * Why scripts are strict but styles are relaxed (the stack is *not*
 * strict-CSP-ready out of the box)
 * --------------------------------------------------------------------
 * - **scripts stay strict**: `script-src` is `'self'` + the per-build hashes Astro
 *   computes for the scripts it processes (bundled page scripts and island
 *   bootstraps), plus {@link STARLIGHT_INLINE_SCRIPT_HASHES} — the five upstream
 *   `is:inline` scripts Astro's pass never sees, so it cannot hash them. No
 *   `'unsafe-inline'` for scripts — that is the real XSS vector and we keep it shut.
 *   `'wasm-unsafe-eval'` is added *only* so Starlight's Pagefind search (compiled
 *   WebAssembly) keeps working; it permits WASM compilation without enabling `eval()`.
 *   `scripts/verify-csp.mjs` re-checks a real build and fails on any inline script
 *   the shipped policy would refuse.
 * - **styles are relaxed**: React + Radix/shadcn set `element.style.*` and inject
 *   `<style>` at runtime (popover/dialog positioning, scroll-lock via
 *   react-remove-scroll), and Starlight renders inline `style="--sl-icon-size…"`
 *   attributes. Hash-based CSP cannot cover those, and browsers *silently void*
 *   `'unsafe-inline'` whenever it shares a directive with a hash — which Astro always
 *   adds to `style-src`. We therefore let Astro emit its hashed `style-src`, then
 *   {@link hardenCspMeta} (run from `src/middleware.ts` at build time) rewrites that
 *   one directive to a hash-free `style-src 'self' 'unsafe-inline'` so inline styles
 *   are actually honored. Style injection is a far weaker vector than script
 *   injection, so this is an acceptable trade.
 *
 * Everything else (`default-src`, `base-uri`, `object-src`, `frame-ancestors`,
 * `form-action`, `img/font/connect/worker-src`) is locked to a minimal baseline.
 */

/** Env keys whose values may point the UI at an absolute API/site origin. */
export const CONNECT_ORIGIN_ENV_KEYS = [
  'PUBLIC_SITE_URL',
  'PUBLIC_AUTH_API_BASE',
  'PUBLIC_MEDIA_API_BASE',
  'PUBLIC_MEDIA_V1_BASE',
  'PUBLIC_MEDIA_STORAGE_ORIGIN',
  'PUBLIC_PROMPT_API_BASE',
  'PUBLIC_REPARTO_API_BASE',
] as const;

type EnvLike = Record<string, string | undefined>;

/**
 * Resolve the `scheme://host[:port]` origin of a configured value.
 *
 * Relative paths (the default — e.g. `/user`, `/media`) and non-http(s) values
 * return `null`: they are same-origin and already covered by `'self'`, so they
 * add nothing to `connect-src`.
 */
export function originOf(value: string | undefined): string | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url.origin;
}

/**
 * Build the `connect-src` source list: always `'self'`, plus any absolute
 * origins the UI is configured to call (deduplicated, order-stable).
 */
export function connectSrc(env: EnvLike = process.env): string[] {
  const sources = ["'self'"];
  for (const key of CONNECT_ORIGIN_ENV_KEYS) {
    const origin = originOf(env[key]);
    if (origin && !sources.includes(origin)) sources.push(origin);
  }
  return sources;
}

/** The static (env-independent) directive lines, minus `connect-src`. */
export const STATIC_CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
] as const satisfies readonly CspDirective[];

/** Full directive list (static lines + the env-derived `connect-src`). */
export function cspDirectives(env: EnvLike = process.env): CspDirective[] {
  return [
    ...STATIC_CSP_DIRECTIVES,
    `connect-src ${connectSrc(env).join(' ')}` as CspDirective,
  ];
}

/**
 * Starlight's `is:inline` scripts, which Astro's CSP pass cannot hash (W2.2).
 *
 * Astro hashes only the scripts it *processes*: bundled/inlined page scripts,
 * `injectScript` payloads, client directives and the island bootstrap
 * (`core/csp/common.ts` → `trackScriptHashes`). An `is:inline` script is copied
 * into the HTML verbatim and never enters that set, so it ships unhashed and the
 * browser refuses it. Measured against a real build served under enforcement:
 * four of the five were reported blocked on every page — the sidebar's
 * open/closed state and scroll offset were never restored, the search button
 * kept the wrong platform shortcut, and the theme picker never synced with the
 * applied theme.
 *
 * The fifth, ThemeProvider's, happens to execute today only because Astro emits
 * it *above* the CSP `<meta>`, and a policy delivered that way binds nothing
 * before it. That is document order we do not control rather than an exemption,
 * so it is hashed with the rest.
 *
 * Each one is inline *on purpose* upstream (FOUC and an invalid keyboard hint
 * are the stated reasons), so neither un-inlining it nor moving it to an
 * external module is available to us without forking the component. Pinning the
 * literal hash is the documented last resort, and it is the only entry here that
 * needs maintenance: `scripts/verify-csp.mjs` fails the build with the new hash
 * whenever a Starlight upgrade edits one of these scripts.
 *
 * Hashes are given unquoted — Astro's renderer wraps each one in `'…'` itself
 * (`runtime/server/render/csp.ts`) and its schema rejects a quoted value.
 *
 * Measured against `@astrojs/starlight@0.41.3`.
 */
export const STARLIGHT_INLINE_SCRIPT_HASHES = [
  // ThemeProvider.astro — defines `window.StarlightThemeProvider` and applies the
  // stored theme to `<html data-theme>`. Inline upstream to avoid FOUC.
  'sha256-VWo5Wp4aqSj6nSgMpeAp9cKieaoIfwFUAunAVugI5gA=',
  // ThemeSelect.astro — `StarlightThemeProvider.updatePickers()`, syncing the
  // theme picker with the theme the provider just applied.
  'sha256-GkZBRnvSuhtx/cvzvukVkX2JJZW+DdPlVr7BX8Tefqo=',
  // Search.astro — swaps the Ctrl/⌘ hint in the search button on Apple devices.
  // Inline upstream so an invalid shortcut is never briefly shown.
  'sha256-f/zAUE74ucc3JYp4r4QQvkJofoQdkOIhHYK+jeZ6eko=',
  // SidebarPersister.astro (first) — restores the persisted open/closed state of
  // the sidebar groups before they paint, via a `sl-sidebar-restore` element.
  'sha256-wX2yOADeV+NMngflD5uYi3vl50SHC4sfM1EmylVjlX4=',
  // SidebarPersister.astro (second) — restores the sidebar scroll offset stashed
  // on `window._starlightScrollRestore` by the first script.
  'sha256-7eCV4jtsr4t4knb3c4FCRPeu7GGZeOUGE3XvWix0XOQ=',
] as const;

/**
 * The object passed to Astro's `security` config. `script-src` is left to Astro
 * (it adds `'self'` + per-build hashes), extended with `'wasm-unsafe-eval'` for
 * Pagefind and with {@link STARLIGHT_INLINE_SCRIPT_HASHES} for the upstream
 * inline scripts Astro cannot see; the `style-src` relaxation happens later in
 * {@link hardenCspMeta}. `style-src` / `style-src-*` cannot be set here — Astro
 * rejects them in `security.csp.directives`.
 *
 * `'unsafe-inline'` is never added to `script-src`. Hashes are an allowlist of
 * exactly five known scripts; `'unsafe-inline'` would admit every injected one,
 * and the style relaxation above does not license the same trade for scripts.
 */
export function buildSecurityConfig(env: EnvLike = process.env): EnabledCspSecurityConfig {
  return {
    csp: {
      directives: cspDirectives(env),
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'"],
        hashes: [...STARLIGHT_INLINE_SCRIPT_HASHES],
      },
    },
  };
}

/**
 * The hash-free `style-src` we want in the shipped policy. No hashes means
 * `'unsafe-inline'` is honored (browsers only void it when a hash/nonce shares
 * the directive), so React/Radix/Starlight inline styles work.
 */
export const RELAXED_STYLE_SRC = "style-src 'self' 'unsafe-inline'";

/**
 * Rewrite the `style-src` directive of a CSP string to {@link RELAXED_STYLE_SRC}.
 * If the policy has no `style-src` (it always does once Astro CSP is on, but be
 * defensive), append the relaxed directive instead.
 */
export function relaxStyleSrc(cspContent: string): string {
  if (/style-src[^;]*/.test(cspContent)) {
    return cspContent.replace(/style-src[^;]*/, RELAXED_STYLE_SRC);
  }
  const trimmed = cspContent.trimEnd();
  const separator = trimmed.endsWith(';') || trimmed.length === 0 ? '' : ';';
  return `${trimmed}${separator}${RELAXED_STYLE_SRC};`;
}

/** Matches the CSP `<meta>` Astro injects, capturing its `content` attribute. */
const CSP_META_RE =
  /(<meta http-equiv="content-security-policy" content=")([^"]*)(")/i;

/**
 * Relax the `style-src` of the CSP `<meta>` inside a built HTML document. Pages
 * without a CSP meta (none, once CSP is enabled) are returned unchanged.
 */
export function hardenCspMeta(html: string): string {
  return html.replace(CSP_META_RE, (_match, open, content, close) => {
    return `${open}${relaxStyleSrc(content)}${close}`;
  });
}
