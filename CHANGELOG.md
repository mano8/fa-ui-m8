# Changelog

All notable changes to `fa-ui-m8` are documented here.

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`fa-ui-m8` has never been published to a registry — `v0.1.0` is a git tag
only, not a release artifact — so this file starts with a single initial
entry rather than a per-release history.

## [Unreleased]

### Added

- **A lock that does not pin every package fails the build**
  (`B34-npm-lock-integrity-guard`, finding `G34`(b)).
  `app/scripts/verify-lock-integrity.mjs` (`npm run verify:lock-integrity`)
  refuses a `package-lock.json` below `lockfileVersion` 3, or one with any
  entry that lacks `integrity` or `resolved`, carries a non-`sha512` hash,
  resolves outside `https://registry.npmjs.org/`, or is a link or `file:`
  source, and names every offending key. `npm ci` installs an entry with no
  `integrity` without checking a hash and says nothing, which is how `G33`
  went unseen. CI runs it before `npm ci` in every job that installs, and
  `docker/Dockerfile` runs it before the image's `npm ci`, so an unpinned
  lock builds no image even locally (a compose-policy test holds that order).
  `app/tests/lock-integrity.test.ts` proves each refusal against a fixture lock
  and asserts this repository's own lock passes. The script is
  dependency-free and byte-identical in the fleet's six npm repositories.
  It read red on 909 entries of `app/package-lock.json` until `B33`
  (below) restored them.

### Security

- **The runtime image's static server installs from a hash-pinned lock**
  (`B38-static-server-lock`, finding `G37`). The server stage ran
  `npm install sirv-cli@3.0.1`, which pins one package: its eight direct
  dependencies are caret ranges (`sirv` is `^3.0.0`, with its own), so the
  thirteen packages that serve the production UI were re-resolved on every
  build, with no lock for `B34`'s guard to read. `docker/static-server/`
  now holds that tree as a `package.json` (`sirv-cli` `3.0.1`, exact) and a
  `package-lock.json` pinning all thirteen by sha512; the server stage copies
  both, runs the lock guard, then `npm ci --ignore-scripts`. CI's Security
  job guards and audits the lock, Dependabot watches the directory, and two
  compose-policy tests hold the stage's order (both read red on the old
  Dockerfile). The image built from this commit carries exactly the lock's
  thirteen versions, and still ships no npm.
- **The UI image installs a verified dependency graph again**
  (`B33-npm-lock-integrity-repair`, finding `G33`). 909 of the 1,084
  entries in `app/package-lock.json`, 517 of them production packages, had
  no `integrity` and no `resolved` since `da40e03`, so the image's `npm ci`
  installed them without checking a hash. Each is filled from the npm
  registry's record of its exact version: no version moves, a clean `npm ci`
  verifies all 1,084 hashes, a following `npm install` leaves the lock
  byte-identical, and the image built from this lock carries the same five
  `@mano8` versions.

### Changed

- **Both stacks pin the fleet's pending service releases**
  (`B32-pre-publish-pin-alignment`). `dev_ui_m8` and `hardened_ui_m8`
  (compose, production overlay and `README.md`) and
  `compose_policy_tests/test_compose_image_pins.py` move
  `tepochtli/fa-auth-m8` `2.2.1` → `2.2.3`, `tepochtli/media-service-m8`
  `3.0.1` → `3.0.2` and `tepochtli/media-worker-m8` `1.0.0` → `1.0.2`. All
  three were pinned ahead of their publish, and all three have been
  published and read back since (2026-09-26), so both stacks pull. The plugin
  dependency floors moved in a separate change (below), once npm could lock
  them.
- **The app runs the plugin releases that track the published services**
  (`B31-plugin-tracking-tail`). The `app/package.json` floors move to the
  newest published versions: `@mano8/astro-auth-m8` `^2.6.0` → `^2.7.0`,
  `@mano8/astro-media-m8` `^2.2.0` → `^2.3.0`, `@mano8/astro-prompt-m8`
  `^2.1.0` → `^2.2.0` and `@mano8/astro-reparto-m8` `^2.2.0` → `^2.3.0`.
  `@mano8/astro-ui-m8` stays `^1.5.1`. Each plugin's tested service version
  is now the published service release: `fa-auth-m8` `2.2.3` and
  `media-service-m8` `3.0.2` (the images these stacks pin),
  `prompt-engine-m8` `2.2.1` and `reparto-docente-m8` `2.2.2`. No plugin's
  contract or service range moved.
  `app/package-lock.json` was regenerated with `npm install`, and its only
  changes are those five `@mano8` entries.

## [0.1.0] - 2026-07-12

Initial version. Astro 7 + Starlight static-first front end for the M8
platform, composing optional backend features as feature-flagged plugins.

### Added

- Astro + Starlight app scaffold, with English/French/Spanish localization
  (`/en`, `/fr`, `/es`) and docs/portfolio content routes.
- `@mano8/astro-auth-m8` wired in as the one required plugin: login,
  sessions, profile, API keys, admin users, and OAuth redirect-prefix
  pinning with fail-closed validation.
- Optional, feature-flagged plugin composition for media
  (`@mano8/astro-media-m8`), prompt (`@mano8/astro-prompt-m8`), and
  teaching-assignment (`@mano8/astro-reparto-m8`) — each gated on its own
  `PUBLIC_*_API_BASE` env var, with a disabled plugin's routes and code kept
  out of the build entirely.
- Media browser UI, media admin landing view as a storage dashboard, and
  account dashboard landing view built from the shared `astro-ui-m8`
  registry.
- Production build-time Content-Security-Policy via Astro's `security.csp`.
- App container images and entrypoints, plus dev and hardened Docker Compose
  orchestration stacks, including public-endpoint and CORS configuration for
  browser-direct media uploads against the then-current object-storage
  backend (the now-retired MinIO, later replaced fleet-wide).
- Compose policy tests (image pins, npm audit policy) and live security
  tests.
- CI, Dependabot, editor and ignore configuration.
