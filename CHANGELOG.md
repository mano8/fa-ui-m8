# Changelog

All notable changes to `fa-ui-m8` are documented here.

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
`fa-ui-m8` has never been published to a registry — `v0.1.0` is a git tag
only, not a release artifact — so this file starts with a single initial
entry rather than a per-release history.

## [Unreleased]

### Changed

- **Both stacks pin the fleet's pending service releases**
  (`B32-pre-publish-pin-alignment`). `dev_ui_m8` and `hardened_ui_m8`
  (compose, production overlay and `README.md`) and
  `compose_policy_tests/test_compose_image_pins.py` move
  `tepochtli/fa-auth-m8` `2.2.1` → `2.2.3`, `tepochtli/media-service-m8`
  `3.0.1` → `3.0.2` and `tepochtli/media-worker-m8` `1.0.0` → `1.0.2`. All
  three are pending publish, so the stacks pull once the fleet's publish
  sweep reads each tag back, and not before. The plugin dependency floors
  in `app/package.json` do not move here: npm can only lock a published
  version.

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
