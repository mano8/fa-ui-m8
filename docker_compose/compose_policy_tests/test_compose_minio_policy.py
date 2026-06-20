"""Static compose-policy tests for MinIO host-port exposure (item 0.2).

These tests parse the YAML files directly — no running Docker required.

Policy:
  hardened_ui_m8  — MinIO must have NO `ports:` block at all (internal-only).
  dev_ui_m8       — MinIO ports must be loopback-bound only (no 0.0.0.0 bind).
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest
import yaml

_COMPOSE_DIR = Path(__file__).parent.parent
_HARDENED = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.yml"
_DEV = _COMPOSE_DIR / "dev_ui_m8" / "docker-compose.yml"

_LOOPBACK_RE = re.compile(r"^127\.")


def _load(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def _assert_loopback_bound(mapping: str) -> None:
    """Fail unless `mapping` publishes a port on an explicit loopback host IP.

    Accepts only the 3-part `127.x:host:container` form; a 2-part `host:container`
    mapping has no explicit host IP and defaults to 0.0.0.0 (all interfaces).
    """
    parts = str(mapping).split(":")
    if len(parts) == 3:
        host_ip = parts[0]
        assert _LOOPBACK_RE.match(host_ip), (
            f"minio port {mapping!r} binds on {host_ip!r}, not loopback — "
            "change to 127.0.0.1:<host>:<container>."
        )
    elif len(parts) == 2:
        pytest.fail(
            f"minio port {mapping!r} has no explicit host IP "
            "(defaults to 0.0.0.0). Change to 127.0.0.1:<host>:<container>."
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8
# ---------------------------------------------------------------------------


class TestHardenedMinioNoHostPorts:
    """In the hardened stack MinIO must not publish any host port."""

    def test_minio_has_no_ports_block(self):
        compose = _load(_HARDENED)
        minio = compose["services"]["minio"]
        assert "ports" not in minio, (
            "hardened_ui_m8: minio must not have a `ports:` block — "
            "it must be reachable only on the Docker network (minio:9000). "
            f"Got: {minio.get('ports')}"
        )


# ---------------------------------------------------------------------------
# dev_ui_m8
# ---------------------------------------------------------------------------


class TestDevMinioLoopbackOnly:
    """In the dev stack MinIO ports must be loopback-bound (127.0.0.1), never 0.0.0.0."""

    def _minio_ports(self) -> list[str]:
        compose = _load(_DEV)
        return compose["services"]["minio"].get("ports", [])

    def test_minio_has_ports_block(self):
        """Dev stack must still expose MinIO for local tooling."""
        assert self._minio_ports(), (
            "dev_ui_m8: minio has no `ports:` block — "
            "the dev stack should expose MinIO on loopback for local mc/dashboard access."
        )

    @pytest.mark.parametrize("mapping", ["127.0.0.1:9005:9000", "127.0.0.1:9006:9001"])
    def test_minio_port_is_loopback_bound(self, mapping: str):
        ports = self._minio_ports()
        assert mapping in ports, (
            f"dev_ui_m8: expected loopback port mapping {mapping!r} not found. "
            f"Got: {ports}"
        )

    def test_no_minio_port_on_all_interfaces(self):
        for mapping in self._minio_ports():
            _assert_loopback_bound(mapping)


class TestLoopbackBindHelper:
    """Unit coverage for the bind-policy helper, including the rejected forms."""

    @pytest.mark.parametrize("mapping", ["127.0.0.1:9005:9000", "127.0.0.1:9006:9001"])
    def test_loopback_three_part_passes(self, mapping: str):
        _assert_loopback_bound(mapping)

    def test_non_loopback_three_part_fails(self):
        with pytest.raises(AssertionError):
            _assert_loopback_bound("0.0.0.0:9005:9000")

    def test_two_part_mapping_fails(self):
        with pytest.raises(pytest.fail.Exception):
            _assert_loopback_bound("9005:9000")
