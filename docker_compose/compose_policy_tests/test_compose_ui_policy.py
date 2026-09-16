"""Static policy tests for the containerised static UI (fa-ui-m8 itself).

These tests parse the compose YAML and docker/Dockerfile directly — no running
Docker required.

The UI was the one service in the hardened stack whose deployed bytes had no
name to pin, scan or roll back to, and whose container hardening was thinner
than the Python services standing next to it. These tests lock the fixes so they
cannot regress silently:

Image supply chain
  - Both Dockerfile base images are DIGEST-pinned, not tag-only: a floating tag
    lets the same Dockerfile produce a different image tomorrow.
  - sirv-cli is pinned to an exact version and installed with --ignore-scripts.
  - The runtime image strips npm/npx/corepack — a static file server needs no
    package manager, and their absence removes the ability to fetch and execute
    new code after a compromise.
  - The runtime declares a non-root USER and a HEALTHCHECK.

Compose posture (hardened_ui_m8)
  - The build output is a named, pinned, non-:latest image so it can be pushed
    once and pulled by hosts that must not build from source.
  - read_only root fs, all caps dropped, no-new-privileges, non-root user, init,
    a noexec/nosuid/nodev sized tmpfs, a pids cap, and bounded logs.
  - No host-published port (Traefik is the only way in) and app_net only — a
    static file server has no backing store and never needs data_net.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

_REPO_ROOT = Path(__file__).parent.parent.parent
_COMPOSE_DIR = Path(__file__).parent.parent

DOCKERFILE = _REPO_ROOT / "docker" / "Dockerfile"
HARDENED = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.yml"
DEV_FULL = _COMPOSE_DIR / "dev_local_full_ui_m8" / "docker-compose.yml"
OVERLAY = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.production.yml"


class _ComposeLoader(yaml.SafeLoader):
    """SafeLoader that tolerates Compose's `!reset` / `!override` merge tags.

    Both tags only ever wrap sequences in these files (`ports:`, `volumes:`,
    `env_file:`), so the constructor just unwraps the sequence.
    """


def _identity(loader: _ComposeLoader, node: yaml.Node) -> object:
    return loader.construct_sequence(node)


_ComposeLoader.add_constructor("!override", _identity)
_ComposeLoader.add_constructor("!reset", _identity)


def _ui_service(path: Path) -> dict:
    # _ComposeLoader subclasses SafeLoader (only adds !override / !reset), so
    # this is a safe load despite passing a custom Loader to yaml.load.
    doc = yaml.load(path.read_text(encoding="utf-8"), Loader=_ComposeLoader)  # nosec B506
    return doc["services"]["ui"]


def _dockerfile() -> str:
    return DOCKERFILE.read_text(encoding="utf-8")


# ── Dockerfile: image supply chain ───────────────────────────────────────────


class TestDockerfileSupplyChain:
    def test_every_base_image_is_digest_pinned(self):
        froms = [
            line.split()[1]
            for line in _dockerfile().splitlines()
            if line.startswith("FROM ")
        ]
        assert froms, "no FROM instructions found"
        for ref in froms:
            assert "@sha256:" in ref, (
                f"base image {ref!r} is tag-only — pin it by digest so the same "
                "Dockerfile cannot resolve to different bytes tomorrow."
            )

    def test_no_latest_base_image(self):
        assert ":latest" not in _dockerfile()

    def test_sirv_cli_is_version_pinned_and_scripts_ignored(self):
        text = _dockerfile()
        assert "sirv-cli@3.0.1" in text, "sirv-cli must be pinned to an exact version"
        assert "--ignore-scripts" in text

    def test_runtime_strips_every_package_manager(self):
        text = _dockerfile()
        for binary in ("/usr/local/bin/npm", "/usr/local/bin/npx", "/usr/local/bin/corepack"):
            assert binary in text, f"{binary} is not removed from the runtime image"
        # The removal is asserted inside the same layer, so a base-image change
        # that reinstates npm fails the build rather than shipping it.
        assert "! command -v npm" in text

    def test_runtime_is_non_root_with_a_healthcheck(self):
        text = _dockerfile()
        assert "USER $UID:$GID" in text
        assert "HEALTHCHECK" in text

    def test_site_is_not_writable_by_the_runtime_user(self):
        # dist/ is copied as root and never chowned to the runtime uid: the
        # served bytes must be readable and never rewritable from inside.
        text = _dockerfile()
        assert "COPY --from=build /app/dist ./dist" in text
        runtime_stage = text.split("AS runtime", 1)[1]
        instructions = [
            line for line in runtime_stage.splitlines() if not line.lstrip().startswith("#")
        ]
        assert not [line for line in instructions if "chown" in line], (
            "the runtime stage must not hand the site to the runtime uid"
        )


# ── hardened_ui_m8: the ui service's container posture ───────────────────────


class TestHardenedUiService:
    def test_build_output_is_a_pinned_named_image(self):
        image = _ui_service(HARDENED)["image"]
        assert ":" in image, "the UI build output needs a tag to pin, push and roll back to"
        assert not image.endswith(":latest")

    def test_build_is_still_from_repo_source(self):
        build = _ui_service(HARDENED)["build"]
        assert build["dockerfile"] == "docker/Dockerfile"
        assert build["context"] == "../../"

    def test_root_filesystem_is_read_only(self):
        assert _ui_service(HARDENED)["read_only"] is True

    def test_all_capabilities_dropped(self):
        assert _ui_service(HARDENED)["cap_drop"] == ["ALL"]

    def test_no_new_privileges(self):
        assert "no-new-privileges:true" in _ui_service(HARDENED)["security_opt"]

    def test_runs_as_the_non_root_uid(self):
        assert _ui_service(HARDENED)["user"] == "1000:1000"

    def test_init_process_is_enabled(self):
        # Without it PID 1 is sirv itself: no SIGTERM handling, no child reaping.
        assert _ui_service(HARDENED)["init"] is True

    @pytest.mark.parametrize("option", ["noexec", "nosuid", "nodev", "size="])
    def test_tmpfs_is_constrained(self, option: str):
        mounts = _ui_service(HARDENED)["tmpfs"]
        tmp = [m for m in mounts if m.startswith("/tmp")]
        assert tmp, mounts
        assert option in tmp[0], (
            f"/tmp is the only writable path in a read-only container; {option} "
            "keeps it from being used to stage and run a payload, or to fill the disk."
        )

    def test_pids_are_capped(self):
        limits = _ui_service(HARDENED)["deploy"]["resources"]["limits"]
        assert limits["pids"] > 0

    def test_logs_are_bounded(self):
        options = _ui_service(HARDENED)["logging"]["options"]
        assert options["max-size"]
        assert options["max-file"]

    def test_no_host_published_port(self):
        # Traefik's ui-router is the only way in, same as the API services.
        assert "ports" not in _ui_service(HARDENED)

    def test_attached_to_app_net_only(self):
        # A static file server has no backing store, so it never needs data_net.
        assert _ui_service(HARDENED)["networks"] == ["app_net"]


# ── production overlay ───────────────────────────────────────────────────────


class TestProductionOverlayUi:
    def test_ui_image_is_pinned_and_not_latest(self):
        image = _ui_service(OVERLAY)["image"]
        assert not image.endswith(":latest")
        # Overridable per deployment: PUBLIC_* build args are baked into the
        # static HTML, so a different site URL or plugin set is a different
        # artifact and must not reuse the base stack's tag.
        assert image.startswith("${UI_IMAGE:-")

    def test_site_url_is_baked_from_the_environment(self):
        args = _ui_service(OVERLAY)["build"]["args"]
        assert "PUBLIC_SITE_URL" in args


# ── dev_local_full_ui_m8: the dev counterpart runs the same container ────────
#
# This stack is the development mirror of the Raspberry Pi deployment
# (rpi_server/docente_reparto): same service set, same routing shape. It grew a
# containerised `ui` so the production Astro build — baked PUBLIC_* values,
# build-time CSP, same-origin Traefik routing — can be exercised before it ships.
# If that container drifts from the hardened posture, the dev stack stops being
# a faithful rehearsal of production, so the same invariants are asserted here.


class TestDevFullUiService:
    def test_ui_service_exists(self):
        assert _ui_service(DEV_FULL)["build"]["dockerfile"] == "docker/Dockerfile"

    def test_image_is_a_local_tag_not_a_registry_tag(self):
        # This build enables media + prompt + reparto and is NOT the artifact the
        # Pi runs (reparto-only). A registry namespace here would invite pushing
        # it over a deployment tag.
        image = _ui_service(DEV_FULL)["image"]
        assert "/" not in image, f"{image} looks pushable; this build is local-only"
        assert not image.endswith(":latest")

    def test_every_plugin_in_this_stack_is_enabled_in_the_build(self):
        # Each PUBLIC_*_API_BASE is that plugin's build-time on/off gate. The
        # stack runs media, prompt and reparto, so all three must be baked in or
        # the container silently serves a UI missing those routes entirely.
        args = _ui_service(DEV_FULL)["build"]["args"]
        assert args["PUBLIC_AUTH_API_BASE"] == "/user"
        assert args["PUBLIC_MEDIA_API_BASE"] == "/media"
        assert args["PUBLIC_PROMPT_API_BASE"] == "/prompt"
        assert args["PUBLIC_REPARTO_API_BASE"] == "/reparto"

    @pytest.mark.parametrize("key,expected", [
        ("read_only", True),
        ("init", True),
        ("user", "1000:1000"),
        ("cap_drop", ["ALL"]),
    ])
    def test_container_hardening_matches_the_hardened_stack(self, key: str, expected: object):
        assert _ui_service(DEV_FULL)[key] == expected

    def test_no_new_privileges(self):
        assert "no-new-privileges:true" in _ui_service(DEV_FULL)["security_opt"]

    def test_no_host_published_port_and_app_net_only(self):
        svc = _ui_service(DEV_FULL)
        assert "ports" not in svc
        assert svc["networks"] == ["app_net"]
