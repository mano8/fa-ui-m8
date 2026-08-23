import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const useShellForNpm = process.platform === "win32";
const locales = ["en", "es", "fr"];

const routeGroups = {
  media: locales.flatMap((locale) => [
    `dist/${locale}/media/index.html`,
    `dist/${locale}/media/upload/index.html`,
    `dist/${locale}/media/presets/index.html`,
    `dist/${locale}/media/admin/index.html`,
    `dist/${locale}/media/maintenance/index.html`,
  ]),
  prompt: locales.flatMap((locale) => [
    `dist/${locale}/prompt/index.html`,
    `dist/${locale}/prompt/blocks/index.html`,
    `dist/${locale}/prompt/composer/index.html`,
    `dist/${locale}/prompt/admin/index.html`,
  ]),
  reparto: locales.flatMap((locale) => [
    `dist/${locale}/reparto/index.html`,
    `dist/${locale}/reparto/setup/schools/index.html`,
    `dist/${locale}/reparto/setup/academic-years/index.html`,
    `dist/${locale}/reparto/setup/departments/index.html`,
    `dist/${locale}/reparto/setup/classroom-stages/index.html`,
    `dist/${locale}/reparto/setup/teacher-roster/index.html`,
    `dist/${locale}/reparto/processes/index.html`,
    `dist/${locale}/reparto/meeting/current/index.html`,
    `dist/${locale}/reparto/processes/current/allocation/index.html`,
    `dist/${locale}/reparto/processes/current/subjects/index.html`,
    `dist/${locale}/reparto/processes/current/teaching-groups/index.html`,
    `dist/${locale}/reparto/processes/current/group-subjects/index.html`,
    `dist/${locale}/reparto/processes/current/settings/index.html`,
    `dist/${locale}/reparto/processes/current/planning/index.html`,
    `dist/${locale}/reparto/processes/current/requirements/index.html`,
    `dist/${locale}/reparto/processes/current/participants/index.html`,
    `dist/${locale}/reparto/processes/current/assignments/index.html`,
    `dist/${locale}/reparto/processes/current/my-view/index.html`,
    `dist/${locale}/reparto/processes/current/shared/index.html`,
    `dist/${locale}/reparto/processes/current/versions/index.html`,
    `dist/${locale}/reparto/processes/current/exports/index.html`,
    `dist/${locale}/reparto/processes/current/audit/index.html`,
  ]),
};

/**
 * Routes the host expects that an *installed* plugin below a known version does
 * not generate yet.
 *
 * This is plugin-version drift, not a host regression: `astro-reparto-m8@2.0.0`
 * adds the five process-scoped routes below and is not published, so `npm ci`
 * resolves `1.0.0` and the host builds without them (`B6`/`B8` own the
 * publish). Recorded here rather than deleted from `routeGroups`, because
 * deleting them would lose the expectation entirely.
 *
 * The allowance retires itself twice over: it stops applying once the installed
 * plugin reaches `sinceVersion`, and a listed route that *does* get generated
 * is a hard failure telling whoever sees it to remove this block.
 */
const knownDrift = [
  {
    plugin: "reparto",
    package: "@mano8/astro-reparto-m8",
    sinceVersion: "2.0.0",
    owner: "B6/B8",
    routeSuffixes: [
      "reparto/processes/current/allocation/index.html",
      "reparto/processes/current/teaching-groups/index.html",
      "reparto/processes/current/group-subjects/index.html",
      "reparto/processes/current/settings/index.html",
      "reparto/processes/current/planning/index.html",
    ],
  },
];

/**
 * Installed version of a plugin, or null when it is not installed.
 *
 * Read from `node_modules` rather than resolved as `<pkg>/package.json`: a
 * package with an `exports` map does not expose that subpath, so resolution
 * throws and every plugin would look uninstalled.
 */
function installedVersion(packageName) {
  const manifest = path.join(root, "node_modules", ...packageName.split("/"), "package.json");
  if (!existsSync(manifest)) return null;
  try {
    return JSON.parse(readFileSync(manifest, "utf8")).version ?? null;
  } catch {
    return null;
  }
}

/** True when `version` is at or past `floor`, comparing numeric release parts. */
function atLeast(version, floor) {
  const parts = (value) => value.split("-")[0].split(".").map((part) => Number(part) || 0);
  const [left, right] = [parts(version), parts(floor)];
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}

/**
 * Route suffixes currently excused, plus the note explaining each one. An entry
 * whose plugin has reached `sinceVersion` excuses nothing.
 */
function resolveDrift() {
  const excused = new Map();
  for (const entry of knownDrift) {
    const version = installedVersion(entry.package);
    if (version !== null && atLeast(version, entry.sinceVersion)) continue;
    const note =
      `${entry.package} ${version ?? "not installed"} is below ${entry.sinceVersion}` +
      ` (owner: ${entry.owner})`;
    for (const suffix of entry.routeSuffixes) excused.set(suffix, note);
  }
  return excused;
}

const excusedRoutes = resolveDrift();

/** Whether a `dist/<locale>/...` route is one of the excused suffixes. */
function driftNoteFor(route) {
  for (const [suffix, note] of excusedRoutes) {
    if (route.endsWith(suffix)) return note;
  }
  return null;
}

const matrix = [
  { name: "auth-only", enabled: [] },
  { name: "with-media", enabled: ["media"] },
  { name: "with-prompt", enabled: ["prompt"] },
  { name: "with-reparto", enabled: ["reparto"] },
  { name: "all-on", enabled: ["media", "prompt", "reparto"] },
];

function pluginEnv(enabled) {
  const isEnabled = (plugin) => enabled.includes(plugin);

  return {
    ...process.env,
    NODE_ENV: "production",
    PUBLIC_MEDIA_API_BASE: isEnabled("media") ? "/media" : "",
    PUBLIC_MEDIA_V1_BASE: isEnabled("media") ? "/v1" : "",
    PUBLIC_MEDIA_STORAGE_ORIGIN: "",
    PUBLIC_PROMPT_API_BASE: isEnabled("prompt") ? "/prompt" : "",
    PUBLIC_PROMPT_API_PREFIX: "",
    PUBLIC_PROMPT_ADMIN_ROLE: "",
    PUBLIC_REPARTO_API_BASE: isEnabled("reparto") ? "/reparto" : "",
    PUBLIC_REPARTO_API_PREFIX: "",
    PUBLIC_FA_MEDIA_ENABLED: isEnabled("media") ? "true" : "false",
    PUBLIC_FA_PROMPT_ENABLED: isEnabled("prompt") ? "true" : "false",
    PUBLIC_FA_REPARTO_ENABLED: isEnabled("reparto") ? "true" : "false",
    VITE_CACHE_DIR: `.astro/vite-plugin-matrix-${enabled.join("-") || "auth-only"}`,
  };
}

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: "inherit",
      shell: useShellForNpm && command === npmCommand,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with ${signal ?? `exit code ${code}`}.`));
    });
  });
}

function assertRoutes({ name, enabled }) {
  const enabledSet = new Set(enabled);

  for (const [plugin, routes] of Object.entries(routeGroups)) {
    const missing = routes.filter((route) => !existsSync(path.join(root, route)));
    const present = routes.filter((route) => existsSync(path.join(root, route)));

    if (enabledSet.has(plugin)) {
      const unexplained = missing.filter((route) => driftNoteFor(route) === null);
      if (unexplained.length > 0) {
        throw new Error(
          `${name} did not generate expected ${plugin} routes: ${unexplained.join(", ")}`,
        );
      }

      // An excused route that now builds means the drift is over. Failing here
      // is what stops the allowance outliving the problem it describes.
      const resolved = present.filter((route) => driftNoteFor(route) !== null);
      if (resolved.length > 0) {
        throw new Error(
          `${name} generated routes recorded as known drift, so the allowance in ` +
            `scripts/verify-plugin-matrix.mjs is stale and must be removed: ${resolved.join(", ")}`,
        );
      }

      const excused = missing.filter((route) => driftNoteFor(route) !== null);
      if (excused.length > 0) {
        console.warn(
          `  known drift: ${excused.length} ${plugin} route(s) not generated — ` +
            `${driftNoteFor(excused[0])}`,
        );
      }
    }

    if (!enabledSet.has(plugin) && present.length > 0) {
      throw new Error(`${name} generated disabled ${plugin} routes: ${present.join(", ")}`);
    }
  }
}

for (const entry of matrix) {
  console.log(`\nPlugin matrix verification: ${entry.name}`);
  await run(npmCommand, ["run", "build"], pluginEnv(entry.enabled));
  assertRoutes(entry);
}

if (excusedRoutes.size > 0) {
  console.log(
    `\nPlugin matrix verification passed, with ${excusedRoutes.size} route(s) excused as known plugin-version drift.`,
  );
} else {
  console.log("\nPlugin matrix verification passed.");
}
