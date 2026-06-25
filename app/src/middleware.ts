import { defineMiddleware } from 'astro:middleware';
import { hardenCspMeta } from '@/lib/csp';
import { defaultLocaleRootRedirectUrl } from '@/lib/localeRedirect';

/**
 * Post-processes Astro's CSP `<meta>` so inline styles work (plan item 8.1).
 *
 * Astro's `security.csp` emits a hashed `style-src`, which silently voids
 * `'unsafe-inline'` and breaks the inline styles React/Radix/shadcn/Starlight
 * require. We let Astro own the (strict, hashed) `script-src` and rewrite only
 * `style-src` to a hash-free, inline-allowing value. See `src/lib/csp.ts`.
 *
 * With `output: static` this runs at build time for every prerendered page, so
 * the relaxation is baked into `dist/`; there is no UI runtime in production.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const defaultLocaleRedirect = defaultLocaleRootRedirectUrl(context.url);
  if (defaultLocaleRedirect) return Response.redirect(defaultLocaleRedirect, 307);

  const response = await next();
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  // Body length changes after the rewrite; let the server recompute it.
  headers.delete('content-length');

  return new Response(hardenCspMeta(html), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
