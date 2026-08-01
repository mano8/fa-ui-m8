"""Static compose-policy tests for the hardened_ui_m8 PRODUCTION overlay (item 2.1).

These tests parse the YAML/env files directly — no running Docker required. They
assert the thin production overlay's hardening contract and that the dev/home-lab
base stays a safe, reversible default (the overlay never mutates it).

Policy:
  - The overlay publishes only :80 (HTTP→HTTPS redirect) and :443 — no plaintext
    app port, no host-published dashboard or internal :9000 entryPoint.
  - DB / Redis / Prometheus / Grafana host ports are reset (Docker-network only).
  - cert-init becomes a fail-closed presence check — it never mints a self-signed
    cert in production.
  - The auth image is pinned (never :latest); both app services mount their
    *.env.production file as .env.
  - The production env examples carry the production posture (ENVIRONMENT=
    production, strict mode, docs off, Secure cookies, ALLOWED_HOSTS, https
    issuer/audience, no localhost CORS) with every secret left as the fail-closed
    `changethis` placeholder.
  - The production Traefik config uses FQDN Host rules and keeps the security
    contract (internal /…/health, /…/metrics, /user/private paths never public).
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

_HARDENED = Path(__file__).parent.parent / "hardened_ui_m8"

OVERLAY = _HARDENED / "docker-compose.production.yml"
BASE = _HARDENED / "docker-compose.yml"
AUTH_ENV = _HARDENED / "auth.env.production.example"
MEDIA_ENV = _HARDENED / "media.env.production.example"
ROOT_ENV = _HARDENED / ".env.production.example"
PROD_TRAEFIK = _HARDENED / "traefik" / "production_dynamic_conf.yml"


# ── loaders ──────────────────────────────────────────────────────────────────


class _ComposeLoader(yaml.SafeLoader):
    """SafeLoader that tolerates Compose's `!reset` / `!override` merge tags."""


def _identity(loader: _ComposeLoader, node: yaml.Node) -> object:
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    if isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    return loader.construct_scalar(node)


_ComposeLoader.add_constructor("!reset", _identity)
_ComposeLoader.add_constructor("!override", _identity)


def _load_compose(path: Path) -> dict:
    # _ComposeLoader subclasses SafeLoader (only adds !reset/!override), so this
    # is a safe load despite passing a custom Loader to yaml.load.
    return yaml.load(path.read_text(), Loader=_ComposeLoader)  # nosec B506


def _parse_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        out[key.strip()] = value.strip()
    return out


# ── overlay shape ────────────────────────────────────────────────────────────


class TestOverlayShape:
    def test_overlay_files_exist(self):
        for p in (OVERLAY, AUTH_ENV, MEDIA_ENV, ROOT_ENV, PROD_TRAEFIK):
            assert p.is_file(), f"missing {p}"

    def test_traefik_publishes_only_redirect_and_https(self):
        ports = _load_compose(OVERLAY)["services"]["traefik"]["ports"]
        assert ports == ["80:80", "443:443/tcp", "443:443/udp"]
        # No plaintext app port, no host-published dashboard or internal entryPoint.
        joined = " ".join(ports)
        for forbidden in ("8000", "8080", "9000", "4430"):
            assert forbidden not in joined, f"{forbidden} still host-published"

    def test_traefik_mounts_production_dynamic_conf(self):
        mounts = _load_compose(OVERLAY)["services"]["traefik"]["volumes"]
        assert any(
            m.startswith("./traefik/production_dynamic_conf.yml:") for m in mounts
        ), mounts
        # The dev dynamic_conf (Host(`localhost`)) must NOT be mounted in prod.
        assert not any("/dynamic_conf.yml:" in m and "production" not in m for m in mounts)

    def test_data_and_observability_ports_reset(self):
        services = _load_compose(OVERLAY)["services"]
        for name in ("m8_db", "redis_cache", "prometheus", "grafana"):
            assert services[name]["ports"] == [], f"{name} still publishes host ports"

    def test_cert_init_is_fail_closed_presence_check_not_generator(self):
        cmd = " ".join(_load_compose(OVERLAY)["services"]["cert-init"]["command"])
        assert "never generates self-signed" in cmd
        assert "exit 1" in cmd
        assert "openssl" not in cmd  # the dev generator is gone in production

    def test_auth_service_image_is_pinned(self):
        img = _load_compose(OVERLAY)["services"]["auth_user_service"]["image"]
        assert img.startswith("tepochtli/fa-auth-m8:")
        assert not img.endswith(":latest")

    def test_app_services_mount_production_env(self):
        services = _load_compose(OVERLAY)["services"]
        auth = services["auth_user_service"]
        assert auth["env_file"] == ["./auth.env.production"]
        assert any(
            v.startswith("./auth.env.production:/opt/auth_user_service/.env")
            for v in auth["volumes"]
        )
        media = services["media_service"]
        assert media["env_file"] == ["./media.env.production"]
        assert any(
            v.startswith("./media.env.production:/opt/media_service/.env")
            for v in media["volumes"]
        )

    def test_overlay_documents_migration_decision(self):
        text = OVERLAY.read_text()
        assert "MIGRATIONS" in text
        assert "alembic upgrade head" in text


# ── production env examples: fail-closed secrets + production posture ─────────

_SECRET_FIELDS_AUTH = (
    "DB_PASSWORD",
    "REDIS_PASSWORD",
    "REFRESH_SECRET_KEY",
    "PRIVATE_API_SECRET",
    "SESSION_SECRET",
    "TOKENS_ENCRYPTION_KEY",
    "EVENT_SIGNING_KEY",
    "FIRST_SUPERUSER_PASSWORD",
)

_SECRET_FIELDS_MEDIA = (
    "DB_PASSWORD",
    "MEDIA_REDIS_PASSWORD",
    "MEDIA_INTERNAL_SERVICE_TOKEN",
    "MEDIA_SHARE_SIGNING_SECRET",
    "MINIO_ACCESS_KEY",
    "MINIO_SECRET_KEY",
    "REFRESH_SECRET_KEY",
    "PRIVATE_API_SECRET",
    "EVENT_SIGNING_KEY",
)


class TestAuthProductionEnv:
    def test_posture(self):
        env = _parse_env(AUTH_ENV)
        assert env["ENVIRONMENT"] == "production"
        assert env["STRICT_PRODUCTION_MODE"] == "true"
        assert env["SET_DOCS"] == "false"
        assert env["SET_OPEN_API"] == "false"
        assert env["SET_REDOC"] == "false"
        assert env["SESSION_COOKIE_SECURE"] == "true"
        assert env["ALLOWED_HOSTS"]  # non-empty host allowlist
        assert env["TOKEN_ISSUER"].startswith("https://")
        assert env["TOKEN_AUDIENCE"].startswith("https://")
        assert "localhost" not in env["BACKEND_CORS_ORIGINS"]

    @pytest.mark.parametrize("field", _SECRET_FIELDS_AUTH)
    def test_secrets_are_fail_closed_placeholders(self, field: str):
        assert _parse_env(AUTH_ENV)[field] == "changethis", (
            f"{field} must stay the bare `changethis` placeholder (fail-closed)"
        )


class TestMediaProductionEnv:
    def test_posture(self):
        env = _parse_env(MEDIA_ENV)
        assert env["ENVIRONMENT"] == "production"
        assert env["STRICT_PRODUCTION_MODE"] == "true"
        assert env["SET_DOCS"] == "false"
        assert env["SESSION_COOKIE_SECURE"] == "true"
        assert env["ALLOWED_HOSTS"]
        # Internal http to auth over the Docker network is explicitly opted in.
        assert env["ALLOW_INTERNAL_HTTP"] == "true"
        assert env["TOKEN_ISSUER"].startswith("https://")
        assert env["TOKEN_AUDIENCE"].startswith("https://")
        assert "localhost" not in env["BACKEND_CORS_ORIGINS"]

    @pytest.mark.parametrize("field", _SECRET_FIELDS_MEDIA)
    def test_secrets_are_fail_closed_placeholders(self, field: str):
        assert _parse_env(MEDIA_ENV)[field] == "changethis", (
            f"{field} must stay the bare `changethis` placeholder (fail-closed)"
        )


class TestRootProductionEnv:
    def test_no_public_bind_and_fail_closed_secrets(self):
        env = _parse_env(ROOT_ENV)
        # API_BIND_IP is commented out (unused under the overlay); never 0.0.0.0.
        assert env.get("API_BIND_IP") != "0.0.0.0"
        for field in ("DB_PASSWORD", "REDIS_PASSWORD", "MEDIA_REDIS_PASSWORD",
                      "MINIO_ROOT_PASSWORD"):
            assert env[field] == "changethis", f"{field} must be fail-closed"


# ── production Traefik config: FQDN host rules + preserved security contract ──


class TestProductionTraefik:
    def _routers(self) -> dict:
        conf = yaml.safe_load(PROD_TRAEFIK.read_text())
        return conf["http"]["routers"]

    def test_auth_router_uses_fqdn_and_keeps_security_contract(self):
        rule = self._routers()["auth-public-router"]["rule"]
        assert "auth.example.com" in rule
        assert "Host(`localhost`)" not in rule
        for path in ("/user/health", "/user/metrics", "/user/private"):
            assert path in rule

    def test_media_router_uses_fqdn_and_keeps_security_contract(self):
        rule = self._routers()["media-public-router"]["rule"]
        assert "media.example.com" in rule
        assert "Host(`localhost`)" not in rule
        for path in ("/media/health", "/media/metrics"):
            assert path in rule

    def test_tls_floor_is_raised_to_13(self):
        conf = yaml.safe_load(PROD_TRAEFIK.read_text())
        assert conf["tls"]["options"]["default"]["minVersion"] == "VersionTLS13"

    def test_backends_resolve_over_container_dns(self):
        conf = yaml.safe_load(PROD_TRAEFIK.read_text())
        services = conf["http"]["services"]
        assert services["auth-service"]["loadBalancer"]["servers"] == [
            {"url": "http://auth_user_service:8000"}
        ]
        assert services["media-service"]["loadBalancer"]["servers"] == [
            {"url": "http://media_service:8000"}
        ]


# ── dev/home-lab base is unchanged (the overlay never mutates it) ────────────


class TestDevBaseUnchanged:
    def test_dev_base_keeps_safe_defaults(self):
        base = _load_compose(BASE)["services"]
        # The dev base still ships the self-signed generator and the public app port.
        assert "openssl" in " ".join(base["cert-init"]["command"])
        assert any("8000:80" in p for p in base["traefik"]["ports"])
        # And it still mounts the dev (localhost) dynamic config.
        assert any("/dynamic_conf.yml:" in v for v in base["traefik"]["volumes"])


# ── unit coverage for the merge-tag-tolerant loader ──────────────────────────


class TestParseEnv:
    def test_skips_blank_comment_and_malformed_lines(self, tmp_path: Path):
        env_file = tmp_path / ".env"
        env_file.write_text("\n# comment\nMALFORMED\n VALID = value \n")

        assert _parse_env(env_file) == {"VALID": "value"}


class TestComposeLoaderToleratesMergeTags:
    """Exercise every branch of the `!reset` / `!override` constructor."""

    def test_sequence_tag(self):
        doc = yaml.load("ports: !override [80, 443]", Loader=_ComposeLoader)
        assert doc == {"ports": [80, 443]}

    def test_mapping_tag(self):
        doc = yaml.load("env: !override {A: 1}", Loader=_ComposeLoader)
        assert doc == {"env": {"A": 1}}

    def test_scalar_tag(self):
        doc = yaml.load("name: !reset value", Loader=_ComposeLoader)
        assert doc == {"name": "value"}
