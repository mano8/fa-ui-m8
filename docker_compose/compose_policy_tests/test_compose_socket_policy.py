"""Static compose-policy tests for the Docker-socket / Traefik provider (item 0.3).

These tests parse the YAML files directly — no running Docker required.

Policy:
  hardened_ui_m8 — Traefik must NOT mount /var/run/docker.sock and must route via
                   the **file provider only** (no `docker` provider, no per-service
                   `traefik.*` discovery labels). Backends are declared statically
                   in dynamic_conf.yml and resolve over Docker DNS by container
                   name, so routes still resolve without the socket. Mounting the
                   socket — even read-only — grants the Docker API, which is
                   equivalent to host root.
  dev_ui_m8      — the Docker provider + socket stay as a developer convenience
                   (auto-discovery on a trusted local host).
"""

from __future__ import annotations

from pathlib import Path

import yaml

_COMPOSE_DIR = Path(__file__).parent.parent
_HARDENED = _COMPOSE_DIR / "hardened_ui_m8" / "docker-compose.yml"
_HARDENED_TRAEFIK = _COMPOSE_DIR / "hardened_ui_m8" / "traefik" / "traefik.yml"
_HARDENED_DYNAMIC = _COMPOSE_DIR / "hardened_ui_m8" / "traefik" / "dynamic_conf.yml"
_DEV = _COMPOSE_DIR / "dev_ui_m8" / "docker-compose.yml"
_DEV_TRAEFIK = _COMPOSE_DIR / "dev_ui_m8" / "traefik" / "traefik.yml"

_SOCKET = "/var/run/docker.sock"

# Container-DNS backends expected in the hardened file-provider config; each must
# be a compose service so file-provider routing resolves without the Docker socket.
_EXPECTED_BACKENDS = {
    "auth-service": "http://auth_user_service:8000",
    "media-service": "http://media_service:8000",
}


def _load(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def _service_volumes(service: dict) -> list[str]:
    """Return the string volume mounts declared on a compose service."""
    return [v for v in service.get("volumes") or [] if isinstance(v, str)]


# ---------------------------------------------------------------------------
# hardened_ui_m8 — socketless, file-provider only
# ---------------------------------------------------------------------------


class TestHardenedSocketless:
    """The hardened stack must never mount the Docker socket."""

    def test_no_service_mounts_docker_socket(self):
        services = _load(_HARDENED)["services"]
        for name, service in services.items():
            for mount in _service_volumes(service):
                assert _SOCKET not in mount, (
                    f"hardened_ui_m8:{name} mounts the Docker socket ({mount}) — "
                    "the Docker API is equivalent to host root. Route via the "
                    "Traefik file provider instead."
                )

    def test_traefik_uses_file_provider_only(self):
        providers = _load(_HARDENED_TRAEFIK)["providers"]
        assert "file" in providers, providers
        assert "docker" not in providers, (
            "hardened_ui_m8: Traefik must not enable the `docker` provider — "
            "it requires the host root-equivalent Docker socket."
        )

    def test_no_traefik_discovery_labels(self):
        # File-provider routing needs no per-container `traefik.*` labels; their
        # presence would imply (and invite re-enabling) the Docker provider.
        services = _load(_HARDENED)["services"]
        for name, service in services.items():
            labels = service.get("labels") or []
            keys = labels.keys() if isinstance(labels, dict) else labels
            assert not any(str(k).startswith("traefik") for k in keys), (
                f"hardened_ui_m8:{name} declares a traefik discovery label — "
                "the file provider makes it unnecessary."
            )


class TestHardenedRoutesStillResolve:
    """Routes must still resolve via the file provider after the socket is gone."""

    def test_routers_resolve_to_defined_services(self):
        conf = _load(_HARDENED_DYNAMIC)["http"]
        defined = set(conf["services"])
        for name, router in conf["routers"].items():
            service = router["service"]
            # api@internal is Traefik's built-in dashboard service, not file-declared.
            if service == "api@internal":
                continue
            assert service in defined, (
                f"router {name} targets undeclared service {service}"
            )

    def test_backends_use_container_dns(self):
        conf = _load(_HARDENED_DYNAMIC)["http"]
        compose_services = set(_load(_HARDENED)["services"])
        for name, expected_url in _EXPECTED_BACKENDS.items():
            servers = conf["services"][name]["loadBalancer"]["servers"]
            urls = [s["url"] for s in servers]
            assert urls == [expected_url], (name, urls)
            # The DNS name must be a real compose service so it resolves on app_net.
            host = expected_url.removeprefix("http://").split(":", 1)[0]
            assert host in compose_services, f"{host} is not a compose service"


# ---------------------------------------------------------------------------
# dev_ui_m8 — Docker provider kept as a local-only convenience
# ---------------------------------------------------------------------------


class TestDevKeepsDockerProvider:
    """The dev stack intentionally keeps the Docker provider + socket."""

    def test_dev_traefik_mounts_socket(self):
        traefik = _load(_DEV)["services"]["traefik"]
        assert any(_SOCKET in v for v in _service_volumes(traefik)), (
            "dev_ui_m8: expected the Docker socket mount (dev-only auto-discovery)."
        )

    def test_dev_traefik_uses_docker_provider(self):
        providers = _load(_DEV_TRAEFIK)["providers"]
        assert "docker" in providers, (
            "dev_ui_m8: expected the `docker` provider for local auto-discovery."
        )
