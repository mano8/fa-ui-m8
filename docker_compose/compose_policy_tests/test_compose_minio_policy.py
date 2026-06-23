"""Static compose-policy tests for MinIO host-port exposure (item 0.2) and the
browser-direct presigned upload/download ingress (Phase 4).

These tests parse the YAML files directly — no running Docker required.

Policy:
  hardened_ui_m8  — MinIO must have NO `ports:` block at all (internal-only).
                  — Traefik storage router must be on websecure (TLS) with tls:{},
                    route by Host (not bare /), exclude /minio paths, and use a
                    minio-storage backend with passHostHeader:true at
                    http://minio:9000 — asserted against BOTH dynamic_conf.yml and
                    production_dynamic_conf.yml.
                  — MINIO_API_CORS_ALLOW_ORIGIN must be set and must NOT be *.
                  — media.env.example / media.env.production.example must declare
                    MINIO_PUBLIC_ENDPOINT starting with https://.
  dev_ui_m8       — MinIO ports must be loopback-bound only (no 0.0.0.0 bind).
                  — MINIO_API_CORS_ALLOW_ORIGIN must be set and must NOT be *.
                  — media.env.example must declare MINIO_PUBLIC_ENDPOINT starting
                    with loopback.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest
import yaml

_COMPOSE_DIR = Path(__file__).parent.parent
_HARDENED = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.yml"
_HARDENED_TRAEFIK = _COMPOSE_DIR / "hardened_ui_m8" / "traefik" / "dynamic_conf.yml"
_HARDENED_TRAEFIK_PROD = (
    _COMPOSE_DIR / "hardened_ui_m8" / "traefik" / "production_dynamic_conf.yml"
)
_HARDENED_ENV = _COMPOSE_DIR / "hardened_ui_m8" / "media.env.example"
_HARDENED_PROD_ENV = _COMPOSE_DIR / "hardened_ui_m8" / "media.env.production.example"
_DEV = _COMPOSE_DIR / "dev_ui_m8" / "docker-compose.yml"
_DEV_ENV = _COMPOSE_DIR / "dev_ui_m8" / "media.env.example"

# Both hardened Traefik file-provider configs must carry an identical storage router.
_TRAEFIK_CONFS = [_HARDENED_TRAEFIK, _HARDENED_TRAEFIK_PROD]

_LOOPBACK_RE = re.compile(r"^127\.")


def _load(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def _env_vars(path: Path) -> dict[str, str]:
    """Parse a KEY=value env-example file into a dict (skips comments/blanks)."""
    result: dict[str, str] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, value = line.partition("=")
            result[key.strip()] = value.strip()
    return result


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
# hardened_ui_m8 — Traefik storage router (Phase 4)
# ---------------------------------------------------------------------------


class TestHardenedTraefikStorageRouter:
    """The hardened stack must expose the S3 data path via a Traefik storage router
    that is TLS-only, Host-pinned, and explicitly excludes admin/console paths.

    Asserted against BOTH dynamic_conf.yml (storage.localhost) and
    production_dynamic_conf.yml (storage.example.com placeholder)."""

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_minio_storage_router_exists(self, conf: Path):
        routers = _load(conf)["http"]["routers"]
        assert "media-storage-router" in routers, (
            f"hardened_ui_m8: {conf.name} must define a 'media-storage-router' "
            "router for browser-direct presigned ops."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_on_websecure_entrypoint(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        entry_points = router.get("entryPoints", [])
        assert "websecure" in entry_points, (
            f"hardened_ui_m8: {conf.name} media-storage-router must use the "
            f"'websecure' (TLS) entrypoint, not {entry_points!r}. The 'api' "
            "entrypoint is HTTP-only and must NOT be used for public storage."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_has_tls(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        assert "tls" in router, (
            f"hardened_ui_m8: {conf.name} media-storage-router must carry "
            "'tls: {}' — MINIO_PUBLIC_ENDPOINT is https:// and the route must be "
            "TLS-only."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_rule_uses_host(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        rule = router.get("rule", "")
        assert "Host(" in rule, (
            f"hardened_ui_m8: {conf.name} media-storage-router rule must match by "
            f"Host(), not a bare PathPrefix. Got: {rule!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_excludes_minio_admin_paths(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        rule = router.get("rule", "")
        assert "!PathPrefix(`/minio`)" in rule, (
            f"hardened_ui_m8: {conf.name} media-storage-router rule must include "
            "'!PathPrefix(`/minio`)' to block admin API and console access. "
            f"Got: {rule!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_minio_storage_service_exists(self, conf: Path):
        services = _load(conf)["http"]["services"]
        assert "minio-storage" in services, (
            f"hardened_ui_m8: {conf.name} must define a 'minio-storage' "
            "Traefik service."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_minio_storage_backend_url(self, conf: Path):
        lb = _load(conf)["http"]["services"]["minio-storage"]["loadBalancer"]
        urls = [s["url"] for s in lb.get("servers", [])]
        assert "http://minio:9000" in urls, (
            f"hardened_ui_m8: {conf.name} minio-storage backend must point to "
            f"'http://minio:9000'. Got: {urls!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_minio_storage_pass_host_header(self, conf: Path):
        lb = _load(conf)["http"]["services"]["minio-storage"]["loadBalancer"]
        assert lb.get("passHostHeader") is True, (
            f"hardened_ui_m8: {conf.name} minio-storage loadBalancer must set "
            "'passHostHeader: true' — GET SigV4 signatures bind the Host header "
            "and the proxy must forward it unchanged for signatures to validate."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_service_is_minio_storage(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        assert router.get("service") == "minio-storage", (
            f"hardened_ui_m8: {conf.name} media-storage-router must route to the "
            f"'minio-storage' service. Got: {router.get('service')!r}"
        )


# ---------------------------------------------------------------------------
# CORS policy — hardened + dev (Phase 4)
# ---------------------------------------------------------------------------


class TestMinioCorsNotWildcard:
    """Every stack's minio service must set MINIO_API_CORS_ALLOW_ORIGIN and
    it must NOT be the wildcard '*'."""

    @pytest.mark.parametrize(
        "stack_name,compose_path",
        [
            ("hardened_ui_m8", _HARDENED),
            ("dev_ui_m8", _DEV),
        ],
    )
    def test_cors_origin_is_set(self, stack_name: str, compose_path: Path):
        minio_env = _load(compose_path)["services"]["minio"].get("environment", {})
        assert "MINIO_API_CORS_ALLOW_ORIGIN" in minio_env, (
            f"{stack_name}: minio must set MINIO_API_CORS_ALLOW_ORIGIN "
            "(scoped to the UI origin, never *)."
        )

    @pytest.mark.parametrize(
        "stack_name,compose_path",
        [
            ("hardened_ui_m8", _HARDENED),
            ("dev_ui_m8", _DEV),
        ],
    )
    def test_cors_origin_is_not_wildcard(self, stack_name: str, compose_path: Path):
        minio_env = _load(compose_path)["services"]["minio"].get("environment", {})
        value = str(minio_env.get("MINIO_API_CORS_ALLOW_ORIGIN", ""))
        assert value != "*", (
            f"{stack_name}: MINIO_API_CORS_ALLOW_ORIGIN must NOT be '*' — "
            "scope it to the specific UI origin."
        )


# ---------------------------------------------------------------------------
# MINIO_PUBLIC_ENDPOINT in env.example — hardened + dev (Phase 4)
# ---------------------------------------------------------------------------


class TestMinioPublicEndpointEnvExample:
    """Every stack's media.env.example must declare MINIO_PUBLIC_ENDPOINT.
    The dev stack must point at loopback; hardened (dev + production examples)
    must use https://."""

    def test_hardened_declares_public_endpoint(self):
        env = _env_vars(_HARDENED_ENV)
        assert "MINIO_PUBLIC_ENDPOINT" in env, (
            "hardened_ui_m8: media.env.example must declare MINIO_PUBLIC_ENDPOINT."
        )

    def test_hardened_public_endpoint_is_https(self):
        env = _env_vars(_HARDENED_ENV)
        value = env.get("MINIO_PUBLIC_ENDPOINT", "")
        assert value.startswith("https://"), (
            "hardened_ui_m8: MINIO_PUBLIC_ENDPOINT must start with 'https://' — "
            f"the storage router is on websecure (TLS). Got: {value!r}"
        )

    def test_hardened_production_declares_public_endpoint(self):
        env = _env_vars(_HARDENED_PROD_ENV)
        assert "MINIO_PUBLIC_ENDPOINT" in env, (
            "hardened_ui_m8: media.env.production.example must declare "
            "MINIO_PUBLIC_ENDPOINT."
        )

    def test_hardened_production_public_endpoint_is_https(self):
        env = _env_vars(_HARDENED_PROD_ENV)
        value = env.get("MINIO_PUBLIC_ENDPOINT", "")
        assert value.startswith("https://"), (
            "hardened_ui_m8: production MINIO_PUBLIC_ENDPOINT must start with "
            f"'https://' (FQDN storage host over TLS). Got: {value!r}"
        )

    def test_dev_declares_public_endpoint(self):
        env = _env_vars(_DEV_ENV)
        assert "MINIO_PUBLIC_ENDPOINT" in env, (
            "dev_ui_m8: media.env.example must declare MINIO_PUBLIC_ENDPOINT."
        )

    def test_dev_public_endpoint_is_loopback(self):
        env = _env_vars(_DEV_ENV)
        value = env.get("MINIO_PUBLIC_ENDPOINT", "")
        assert "127." in value, (
            "dev_ui_m8: MINIO_PUBLIC_ENDPOINT must point at loopback (127.x.x.x) "
            f"for the dev stack. Got: {value!r}"
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
