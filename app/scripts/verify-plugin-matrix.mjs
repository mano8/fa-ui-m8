import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
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
    `dist/${locale}/reparto/setup/teacher-roster/index.html`,
    `dist/${locale}/reparto/processes/index.html`,
    `dist/${locale}/reparto/meeting/current/index.html`,
    `dist/${locale}/reparto/processes/current/subjects/index.html`,
    `dist/${locale}/reparto/processes/current/classrooms/index.html`,
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
    PUBLIC_PROMPT_API_PREFIX: isEnabled("prompt") ? "/fastapi" : "",
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

    if (enabledSet.has(plugin) && missing.length > 0) {
      throw new Error(`${name} did not generate expected ${plugin} routes: ${missing.join(", ")}`);
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

console.log("\nPlugin matrix verification passed.");
