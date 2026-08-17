"""Static compose-policy tests for image pinning (item 4.1).

These tests parse the YAML files directly — no running Docker required.

Policy (both stacks):
  - No bare image names (no tag at all).
  - No mutable :latest tags in any service.
  - Previously-bare images now resolve to their expected pinned prefixes.

Previously unpinned images and their required pins (both stacks):
  alpine              → alpine:3.21.3
  quay.io/minio/minio → quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z.hotfix.7aa24e772
  minio/mc            → quay.io/minio/mc:RELEASE.2025-08-13T08-35-41Z

Previously :latest service images now carry explicit version pins (both stacks
track the same fleet versions):
  tepochtli/fa-auth-m8       → tepochtli/fa-auth-m8:2.0.3
  tepochtli/media-service-m8 → tepochtli/media-service-m8:0.0.9
  tepochtli/media-worker-m8  → tepochtli/media-worker-m8:0.2.0
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

_COMPOSE_DIR = Path(__file__).parent.parent
_HARDENED = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.yml"
_DEV = _COMPOSE_DIR / "dev_ui_m8" / "docker-compose.yml"

# Images that were previously bare/latest; key = image prefix, value = expected pinned tag/prefix.
# Use prefix matching so release-tag formats (RELEASE.…) don't need to be re-asserted char-by-char.
_PREVIOUSLY_BARE = {
    "alpine": "alpine:3.21.3",
    "quay.io/minio/minio": "quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z.hotfix.7aa24e772",
    "quay.io/minio/mc": "quay.io/minio/mc:RELEASE.2025-08-13T08-35-41Z",
}
_PREVIOUSLY_LATEST = {
    # Tracks the pin the stacks actually carry: the JTI-status v2 issuer floor is
    # fa-auth-m8 2.0.0, and the stacks are pinned to the published 2.0.3 patch.
    "tepochtli/fa-auth-m8": "tepochtli/fa-auth-m8:2.0.3",
    "tepochtli/media-service-m8": "tepochtli/media-service-m8:0.0.9",
    "tepochtli/media-worker-m8": "tepochtli/media-worker-m8:0.2.0",
}


def _load(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def _all_images(compose: dict) -> dict[str, str]:
    """Return {service_name: image} for every service that declares an image."""
    return {
        name: svc["image"]
        for name, svc in compose.get("services", {}).items()
        if "image" in svc
    }


# ---------------------------------------------------------------------------
# Shared helpers used by both stacks
# ---------------------------------------------------------------------------


def _assert_no_bare_images(compose: dict, stack_label: str) -> None:
    for service, image in _all_images(compose).items():
        # A bare image has no colon (no tag) — e.g. "alpine" or "quay.io/minio/minio".
        assert ":" in image, (
            f"{stack_label}:{service} uses bare image '{image}' (no tag) — "
            "pin it to an explicit version or digest."
        )


def _assert_no_latest(compose: dict, stack_label: str) -> None:
    for service, image in _all_images(compose).items():
        assert not image.endswith(":latest"), (
            f"{stack_label}:{service} uses mutable ':latest' tag (image={image!r}) — "
            "pin to an explicit version or digest."
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8
# ---------------------------------------------------------------------------


class TestHardenedImagePins:
    def test_no_bare_image_names(self):
        _assert_no_bare_images(_load(_HARDENED), "hardened_ui_m8")

    def test_no_latest_tags(self):
        _assert_no_latest(_load(_HARDENED), "hardened_ui_m8")

    @pytest.mark.parametrize("prefix,expected", list(_PREVIOUSLY_BARE.items()))
    def test_previously_bare_images_are_pinned(self, prefix: str, expected: str):
        images = _all_images(_load(_HARDENED))
        matched = {s: img for s, img in images.items() if img.startswith(prefix + ":")}
        assert matched, f"hardened_ui_m8: no service found with image prefix '{prefix}'"
        for service, image in matched.items():
            assert image == expected, (
                f"hardened_ui_m8:{service} image is '{image}', expected '{expected}'"
            )

    @pytest.mark.parametrize("prefix,expected", list(_PREVIOUSLY_LATEST.items()))
    def test_previously_latest_images_are_pinned(self, prefix: str, expected: str):
        images = _all_images(_load(_HARDENED))
        matched = {s: img for s, img in images.items() if img.startswith(prefix + ":")}
        assert matched, f"hardened_ui_m8: no service found with image prefix '{prefix}'"
        for service, image in matched.items():
            assert image == expected, (
                f"hardened_ui_m8:{service} image is '{image}', expected '{expected}'"
            )


# ---------------------------------------------------------------------------
# dev_ui_m8
# ---------------------------------------------------------------------------


class TestDevImagePins:
    def test_no_bare_image_names(self):
        _assert_no_bare_images(_load(_DEV), "dev_ui_m8")

    def test_no_latest_tags(self):
        _assert_no_latest(_load(_DEV), "dev_ui_m8")

    @pytest.mark.parametrize("prefix,expected", list(_PREVIOUSLY_BARE.items()))
    def test_previously_bare_images_are_pinned(self, prefix: str, expected: str):
        images = _all_images(_load(_DEV))
        matched = {s: img for s, img in images.items() if img.startswith(prefix + ":")}
        assert matched, f"dev_ui_m8: no service found with image prefix '{prefix}'"
        for service, image in matched.items():
            assert image == expected, (
                f"dev_ui_m8:{service} image is '{image}', expected '{expected}'"
            )

    @pytest.mark.parametrize("prefix,expected", list(_PREVIOUSLY_LATEST.items()))
    def test_previously_latest_images_are_pinned(self, prefix: str, expected: str):
        images = _all_images(_load(_DEV))
        matched = {s: img for s, img in images.items() if img.startswith(prefix + ":")}
        assert matched, f"dev_ui_m8: no service found with image prefix '{prefix}'"
        for service, image in matched.items():
            assert image == expected, (
                f"dev_ui_m8:{service} image is '{image}', expected '{expected}'"
            )
