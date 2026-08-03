import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const useShellForNpm = process.platform === "win32";
const optionalPackages = [
  "@mano8/astro-media-m8",
  "@mano8/astro-prompt-m8",
  "@mano8/astro-reparto-m8",
];
const stashRoot = path.join(root, "node_modules", ".auth-only-optional-packages");
const previewPort = Number(process.env.AUTH_ONLY_PREVIEW_PORT ?? "4328");

function packagePath(specifier) {
  const [scope, name] = specifier.split("/");
  return path.join(root, "node_modules", scope, name);
}

function stashPath(specifier) {
  return path.join(stashRoot, specifier.replace("/", "__"));
}

async function hideOptionalPackages() {
  if (existsSync(stashRoot)) {
    const entries = await readdir(stashRoot);
    if (entries.length > 0) {
      throw new Error(`${stashRoot} already contains package stashes; restore or remove it before retrying.`);
    }
  }

  await mkdir(stashRoot, { recursive: true });

  const hidden = [];
  for (const specifier of optionalPackages) {
    const source = packagePath(specifier);
    if (!existsSync(source)) continue;

    const target = stashPath(specifier);
    await rename(source, target);
    hidden.push({ specifier, source, target });
  }

  return hidden;
}

async function restoreOptionalPackages(hidden) {
  for (const { source, target } of hidden.reverse()) {
    if (!existsSync(target)) continue;
    await rename(target, source);
  }

  await rm(stashRoot, { recursive: true, force: true });
}

function authOnlyEnv() {
  return {
    ...process.env,
    NODE_ENV: "production",
    PUBLIC_MEDIA_API_BASE: "",
    PUBLIC_MEDIA_V1_BASE: "",
    PUBLIC_MEDIA_STORAGE_ORIGIN: "",
    PUBLIC_PROMPT_API_BASE: "",
    PUBLIC_PROMPT_API_PREFIX: "",
    PUBLIC_REPARTO_API_BASE: "",
    PUBLIC_REPARTO_API_PREFIX: "",
    PUBLIC_FA_MEDIA_ENABLED: "false",
    PUBLIC_FA_PROMPT_ENABLED: "false",
    PUBLIC_FA_REPARTO_ENABLED: "false",
    VITE_CACHE_DIR: ".astro/vite-auth-only",
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

function startPreview(env) {
  const child = spawn(
    npmCommand,
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(previewPort)],
    {
      cwd: root,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: useShellForNpm,
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return child;
}

async function stopPreview(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;

  const closed = new Promise((resolve) => {
    child.once("close", resolve);
  });

  if (process.platform === "win32" && child.pid) {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        shell: false,
      });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    await Promise.race([closed, new Promise((resolve) => setTimeout(resolve, 2_000))]);
    child.stdout?.destroy();
    child.stderr?.destroy();
    return;
  }

  child.kill("SIGTERM");
  await Promise.race([closed, new Promise((resolve) => setTimeout(resolve, 2_000))]);
}

async function waitForPreview(pathname) {
  const deadline = Date.now() + 30_000;
  const url = `http://127.0.0.1:${previewPort}${pathname}`;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const html = await response.text();
        if (!html.includes("My Docs")) {
          throw new Error(`${url} responded without the expected Starlight shell.`);
        }
        return;
      }
      lastError = new Error(`${url} responded with HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}.`);
}

function assertOptionalRoutesAbsent() {
  const routeRoots = [
    "dist/en/media",
    "dist/es/media",
    "dist/fr/media",
    "dist/en/prompt",
    "dist/es/prompt",
    "dist/fr/prompt",
    "dist/en/reparto",
    "dist/es/reparto",
    "dist/fr/reparto",
  ];

  const present = routeRoots.filter((routeRoot) => existsSync(path.join(root, routeRoot)));
  if (present.length > 0) {
    throw new Error(`Auth-only build generated optional route output: ${present.join(", ")}`);
  }
}

const env = authOnlyEnv();
const hidden = await hideOptionalPackages();
let preview;

try {
  console.log(`Auth-only verification: hidden optional packages: ${hidden.map((item) => item.specifier).join(", ") || "none"}`);
  await run(npmCommand, ["run", "build"], env);
  assertOptionalRoutesAbsent();
  preview = startPreview(env);
  await waitForPreview("/en/user/account/");
  console.log("Auth-only build and preview verification passed.");
} finally {
  if (preview) await stopPreview(preview);
  await restoreOptionalPackages(hidden);
}

process.exit(0);
