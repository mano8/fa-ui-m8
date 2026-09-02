/**
 * CSP smoke test over a real build (W2.2).
 *
 * Re-derives, from `dist/` alone, exactly what a browser decides when it parses
 * a shipped page: for every inline `<script>` in the file, is its SHA-256 in the
 * `script-src` of that same file's CSP `<meta>`? A script whose hash is missing
 * is the `Refused to execute inline script` the browser reports, so this fails
 * with the offending hash, the script's first line and the pages carrying it —
 * the exact value to add to `STARLIGHT_INLINE_SCRIPT_HASHES` in `src/lib/csp.ts`
 * once whoever sees the failure has confirmed what the script is.
 *
 * That drift is expected: the pinned hashes cover Starlight's own `is:inline`
 * scripts, which Astro cannot hash and which change whenever Starlight edits
 * them. Without this check, such an upgrade would silently ship a page whose
 * theme and sidebar never initialise.
 *
 * Document order is deliberately ignored. A CSP delivered in a `<meta>` binds
 * nothing that precedes it, so a script Astro happens to emit above the meta
 * runs today whatever the policy says; that is not an exemption we control, and
 * a page whose head is reordered would start refusing it silently.
 *
 * It also refuses `'unsafe-inline'` in `script-src`. That is not a drift guard
 * but a standing rule: the `style-src` relaxation in `src/lib/csp.ts` does not
 * license the same trade for scripts.
 *
 * Run directly (`node scripts/verify-csp.mjs [dist]`, or `npm run verify:csp`)
 * or through `scripts/verify-plugin-matrix.mjs`, which calls it after each
 * build in the plugin matrix so plugin-injected scripts are covered too.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
const CSP_META_RE = /<meta http-equiv="content-security-policy" content="([^"]*)"/i;

/**
 * `<script>` types that hold data rather than code. A browser never executes
 * these, so CSP never refuses them either.
 */
const NON_EXECUTABLE_TYPE_RE =
  /\stype\s*=\s*["'](?:application\/json|application\/ld\+json|importmap|speculationrules|text\/template)["']/i;

/** Every `.html` file below `dir`, depth-first. */
function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

/** The CSP source expression a browser matches an inline script against. */
function inlineHash(body) {
  return `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`;
}

/** Executable inline scripts in `html`, as `[attrs, body]` pairs. */
function inlineScripts(html) {
  const scripts = [];
  for (const match of html.matchAll(SCRIPT_RE)) {
    const [, attrs, body] = match;
    if (/\ssrc\s*=/i.test(attrs)) continue; // external: covered by 'self'
    if (NON_EXECUTABLE_TYPE_RE.test(attrs)) continue;
    if (body.trim() === "") continue;
    scripts.push([attrs.trim(), body]);
  }
  return scripts;
}

/** The `script-src` directive of a page's CSP meta, or `null` when it has none. */
function scriptSrcOf(html) {
  const meta = html.match(CSP_META_RE);
  if (!meta) return null;
  const directive = meta[1]
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("script-src") && !part.startsWith("script-src-"));
  return directive ?? null;
}

/**
 * Throw unless every inline script in every page of `distDir` is admitted by
 * that page's own policy. `label` names the build in the failure.
 */
export function assertNoBlockedInlineScripts(distDir, label = "build") {
  if (!existsSync(distDir)) {
    throw new Error(`${label}: ${distDir} does not exist; run the build first.`);
  }

  /** @type {Map<string, { first: string, pages: string[] }>} */
  const blocked = new Map();
  const relaxed = [];
  const uncovered = [];
  let pages = 0;
  let scripts = 0;

  for (const file of htmlFiles(distDir)) {
    const html = readFileSync(file, "utf8");
    const relative = path.relative(distDir, file);
    const found = inlineScripts(html);
    pages += 1;
    scripts += found.length;

    const scriptSrc = scriptSrcOf(html);
    if (scriptSrc === null) {
      // A page with no policy but no inline script either (Astro's generated
      // root redirect) is fine; one with a script is unprotected.
      if (found.length > 0) uncovered.push(relative);
      continue;
    }
    if (scriptSrc.includes("'unsafe-inline'")) relaxed.push(relative);

    const allowed = new Set(scriptSrc.split(/\s+/).filter((token) => token.startsWith("'sha256-")));
    for (const [, body] of found) {
      const hash = inlineHash(body);
      if (allowed.has(hash)) continue;
      const entry = blocked.get(hash) ?? {
        first: body.trim().split("\n")[0].trim().slice(0, 100),
        pages: [],
      };
      entry.pages.push(relative);
      blocked.set(hash, entry);
    }
  }

  if (relaxed.length > 0) {
    throw new Error(
      `${label}: script-src carries 'unsafe-inline' on ${relaxed.length} page(s), ` +
        `starting with ${relaxed[0]}. Scripts stay hash-only — see src/lib/csp.ts.`,
    );
  }

  if (uncovered.length > 0) {
    throw new Error(
      `${label}: ${uncovered.length} page(s) ship an inline script with no CSP meta, ` +
        `starting with ${uncovered[0]}.`,
    );
  }

  if (blocked.size > 0) {
    const report = [...blocked.entries()]
      .map(
        ([hash, { first, pages: on }]) =>
          `  ${hash}\n    ${first}\n    on ${on.length} page(s), e.g. ${on.slice(0, 3).join(", ")}`,
      )
      .join("\n");
    throw new Error(
      `${label}: ${blocked.size} inline script(s) would be refused by the shipped CSP:\n${report}\n` +
        `  Prefer removing 'is:inline' so Astro hashes the script; pin the hash in\n` +
        `  STARLIGHT_INLINE_SCRIPT_HASHES (src/lib/csp.ts) only for a script we do not own.`,
    );
  }

  return { pages, scripts };
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const distDir = path.resolve(process.argv[2] ?? "dist");
  const { pages, scripts } = assertNoBlockedInlineScripts(distDir, "csp verification");
  console.log(
    `CSP verification passed: ${scripts} inline script(s) across ${pages} page(s) are all hashed.`,
  );
}
