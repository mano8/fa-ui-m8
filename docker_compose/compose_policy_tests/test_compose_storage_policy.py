"""Static compose-policy tests for the storage backend's host-port exposure
(item 0.2), the browser-direct presigned upload/download ingress (Phase 4),
and the SeaweedFS hardening/bootstrap invariants closed by the
object-storage-backend-migration plan's `T21-fa-ui-stacks-port` (mirroring
`media-service-m8`'s own `T15`-`T20`).

These tests parse the YAML files directly — no running Docker required.

Policy:
  hardened_ui_m8  — backend is SeaweedFS. The `storage` service must have NO
                  `ports:` block at all (internal-only, S1) and must carry the
                  same hardening as every other service in the stack —
                  no-new-privileges, cap_drop: ALL, read_only,
                  deploy.resources.limits (S15). Its boot command must bind
                  every admin surface (master/volume/filer/webdav) to loopback
                  and advertise loopback too, leaving only the S3 gateway
                  reachable from siblings.
                  Traefik storage router (asserted against BOTH
                  dynamic_conf.yml and production_dynamic_conf.yml) must be on
                  websecure (TLS) with tls:{}, route by Host (not bare /),
                  exclude the two non-S3 liveness paths SeaweedFS serves on
                  the S3 port (`/healthz`, `/status`), and use a
                  media-storage backend with passHostHeader:true at
                  http://storage:8333 (S6).
                  S3_CORS_ALLOW_ORIGIN (root .env/.env.production, read by
                  storage-init) must be set and must NOT be a wildcard, and
                  the bootstrap script itself must still refuse to apply a
                  wildcard origin (S3).
                  media.env.example / media.env.production.example must
                  declare S3_PUBLIC_ENDPOINT starting with https://.
  dev_ui_m8       — backend is SeaweedFS too. The `storage` service must
                  publish exactly one loopback-bound host port for the S3
                  gateway (never 0.0.0.0) and no other port. S3_CORS_ALLOW_ORIGIN
                  (.env) must be set and must NOT be a wildcard; media.env.example
                  must declare S3_PUBLIC_ENDPOINT starting with loopback.
  dev_local_full_ui_m8 — backend is SeaweedFS too, same one-loopback-port
                  contract as dev_ui_m8. Unlike the other two stacks it has no
                  dedicated storage FQDN: the storage backend is reached
                  same-origin through a catch-all Traefik router
                  (`storage-public-router`) that excludes the app-service path
                  prefixes plus the two non-S3 liveness paths — asserted
                  separately below rather than folded into
                  TestHardenedTraefikStorageRouter, which assumes a Host()-
                  pinned FQDN rule this stack does not use.

Only the env-var lookups this file asserts on for the *application* side
moved to `S3_*` earlier in the plan (T10-T12, matching media-service-m8);
`hardened_ui_m8`'s own storage container/bootstrap vocabulary and all three
stacks' host topology move to SeaweedFS terms here — MinIO/`minio`/
`MINIO_API_CORS_ALLOW_ORIGIN` literals are gone from every stack this suite
covers.
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
_HARDENED_DOTENV = _COMPOSE_DIR / "hardened_ui_m8" / ".env.example"
_HARDENED_PROD_DOTENV = _COMPOSE_DIR / "hardened_ui_m8" / ".env.production.example"
_DEV = _COMPOSE_DIR / "dev_ui_m8" / "docker-compose.yml"
_DEV_ENV = _COMPOSE_DIR / "dev_ui_m8" / "media.env.example"
_DEV_DOTENV = _COMPOSE_DIR / "dev_ui_m8" / ".env.example"
_DEV_LOCAL_FULL = _COMPOSE_DIR / "dev_local_full_ui_m8" / "docker-compose.yml"
_DEV_LOCAL_FULL_TRAEFIK = (
    _COMPOSE_DIR / "dev_local_full_ui_m8" / "traefik" / "dynamic_conf.yml"
)
_DEV_LOCAL_FULL_ENV = _COMPOSE_DIR / "dev_local_full_ui_m8" / "media.env.example"
_DEV_LOCAL_FULL_DOTENV = _COMPOSE_DIR / "dev_local_full_ui_m8" / ".env.example"

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


def _assert_loopback_bound(stack_name: str, mapping: str) -> None:
    """Fail unless `mapping` publishes a port on an explicit loopback host IP.

    Accepts only the 3-part `127.x:host:container` form; a 2-part `host:container`
    mapping has no explicit host IP and defaults to 0.0.0.0 (all interfaces).
    """
    parts = str(mapping).split(":")
    if len(parts) == 3:
        host_ip = parts[0]
        assert _LOOPBACK_RE.match(host_ip), (
            f"{stack_name}: storage port {mapping!r} binds on {host_ip!r}, not "
            "loopback — change to 127.0.0.1:<host>:<container>."
        )
    elif len(parts) == 2:
        pytest.fail(
            f"{stack_name}: storage port {mapping!r} has no explicit host IP "
            "(defaults to 0.0.0.0). Change to 127.0.0.1:<host>:<container>."
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8 — host-port policy (S1)
# ---------------------------------------------------------------------------


class TestHardenedStorageNoHostPorts:
    """In the hardened stack the storage backend must not publish any host
    port — it is reachable only on the Docker network (S1)."""

    def test_hardened_storage_publishes_no_host_ports(self):
        compose = _load(_HARDENED)
        storage = compose["services"]["storage"]
        assert "ports" not in storage, (
            "hardened_ui_m8: storage must not have a `ports:` block — "
            "it must be reachable only on the Docker network (storage:8333). "
            f"Got: {storage.get('ports')}"
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8 — storage backend admin-surface binding (input to S2)
# ---------------------------------------------------------------------------


class TestHardenedStorageAdminSurfaceLoopbackOnly:
    """The storage service's boot command must bind every admin surface
    (master/volume/filer/webdav) to loopback and advertise loopback too,
    leaving only the S3 gateway reachable from sibling containers."""

    def _command(self) -> list[str]:
        compose = _load(_HARDENED)
        return compose["services"]["storage"].get("command", [])

    def test_storage_command_binds_admin_surfaces_to_loopback(self):
        command = self._command()
        assert "-ip.bind=127.0.0.1" in command, (
            "hardened_ui_m8: storage command must include "
            f"'-ip.bind=127.0.0.1' to bind master/volume/filer/webdav to the "
            f"container's own loopback. Got: {command!r}"
        )

    def test_storage_command_advertises_loopback(self):
        command = self._command()
        assert "-ip=localhost" in command, (
            "hardened_ui_m8: storage command must include '-ip=localhost' so "
            "the address components advertise agrees with -ip.bind — without "
            "it the filer's own chunk upload to the volume server dials the "
            f"routable address and every write fails (D1). Got: {command!r}"
        )

    def test_storage_command_exposes_only_s3_gateway_to_siblings(self):
        command = self._command()
        assert "-s3.ip.bind=0.0.0.0" in command, (
            "hardened_ui_m8: storage command must include "
            f"'-s3.ip.bind=0.0.0.0' — the S3 gateway is the only surface "
            f"siblings (Traefik included) may reach. Got: {command!r}"
        )
        assert "-ip.bind=0.0.0.0" not in command, (
            "hardened_ui_m8: storage command must not bind the admin "
            f"address components to 0.0.0.0. Got: {command!r}"
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8 — Traefik storage router (Phase 4 / S6)
# ---------------------------------------------------------------------------


class TestHardenedTraefikStorageRouter:
    """The hardened stack must expose the S3 data path via a Traefik storage
    router that is TLS-only, Host-pinned, forwards the original Host, and
    explicitly excludes the two non-S3 liveness paths SeaweedFS serves on the
    S3 gateway port (S6).

    Asserted against BOTH dynamic_conf.yml (storage.localhost) and
    production_dynamic_conf.yml (storage.example.com placeholder)."""

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_media_storage_router_exists(self, conf: Path):
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
            "'tls: {}' — S3_PUBLIC_ENDPOINT is https:// and the route must be "
            "TLS-only."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_rule_uses_host(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        rule = router.get("rule", "")
        assert "Host(" in rule, (
            f"hardened_ui_m8: {conf.name} media-storage-router rule must match "
            f"by Host(), not a bare PathPrefix. Got: {rule!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_excludes_non_s3_liveness_paths(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        rule = router.get("rule", "")
        assert "PathPrefix(`/healthz`)" in rule and "PathPrefix(`/status`)" in rule, (
            f"hardened_ui_m8: {conf.name} media-storage-router rule must "
            "exclude the two non-S3 liveness paths SeaweedFS serves "
            f"unauthenticated on the S3 gateway port. Got: {rule!r}"
        )
        assert re.search(r"!\s*\(", rule), (
            f"hardened_ui_m8: {conf.name} the liveness-path exclusion must be "
            f"a negated group, not merely mentioned in the rule. Got: {rule!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_media_storage_service_exists(self, conf: Path):
        services = _load(conf)["http"]["services"]
        assert "media-storage" in services, (
            f"hardened_ui_m8: {conf.name} must define a 'media-storage' "
            "Traefik service."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_media_storage_backend_url(self, conf: Path):
        lb = _load(conf)["http"]["services"]["media-storage"]["loadBalancer"]
        urls = [s["url"] for s in lb.get("servers", [])]
        assert "http://storage:8333" in urls, (
            f"hardened_ui_m8: {conf.name} media-storage backend must point to "
            f"the S3 gateway 'http://storage:8333'. Got: {urls!r}"
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_media_storage_pass_host_header(self, conf: Path):
        lb = _load(conf)["http"]["services"]["media-storage"]["loadBalancer"]
        assert lb.get("passHostHeader") is True, (
            f"hardened_ui_m8: {conf.name} media-storage loadBalancer must set "
            "'passHostHeader: true' — GET SigV4 signatures bind the Host "
            "header and the proxy must forward it unchanged for signatures "
            "to validate."
        )

    @pytest.mark.parametrize("conf", _TRAEFIK_CONFS, ids=lambda p: p.name)
    def test_storage_router_service_is_media_storage(self, conf: Path):
        router = _load(conf)["http"]["routers"]["media-storage-router"]
        assert router.get("service") == "media-storage", (
            f"hardened_ui_m8: {conf.name} media-storage-router must route to "
            f"the 'media-storage' service. Got: {router.get('service')!r}"
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8 — storage container hardening (S15)
# ---------------------------------------------------------------------------


class TestHardenedStorageServiceHardening:
    """The storage container must carry the same hardening as every other
    service in the hardened stack: no-new-privileges, cap_drop: ALL,
    read_only, and deploy.resources.limits (S15)."""

    def _storage(self) -> dict:
        compose = _load(_HARDENED)
        return compose["services"]["storage"]

    def test_storage_service_carries_standard_hardening(self):
        storage = self._storage()

        security_opt = storage.get("security_opt", [])
        assert "no-new-privileges:true" in security_opt, (
            "hardened_ui_m8: storage must set "
            f"'security_opt: [no-new-privileges:true]'. Got: {security_opt!r}"
        )

        assert storage.get("cap_drop") == ["ALL"], (
            "hardened_ui_m8: storage must set 'cap_drop: [ALL]'. "
            f"Got: {storage.get('cap_drop')!r}"
        )

        assert storage.get("read_only") is True, (
            "hardened_ui_m8: storage must set 'read_only: true'. "
            f"Got: {storage.get('read_only')!r}"
        )

        limits = storage.get("deploy", {}).get("resources", {}).get("limits", {})
        assert limits.get("cpus") and limits.get("memory"), (
            "hardened_ui_m8: storage must set "
            "'deploy.resources.limits.{cpus,memory}'. "
            f"Got: {limits!r}"
        )


# ---------------------------------------------------------------------------
# hardened_ui_m8 — storage-init CORS bootstrap (S3)
# ---------------------------------------------------------------------------


class TestHardenedStorageCorsBootstrap:
    """SeaweedFS has no MINIO_API_CORS_ALLOW_ORIGIN equivalent — CORS is a
    per-bucket PutBucketCors call the storage-init one-shot issues from
    S3_CORS_ALLOW_ORIGIN (root .env / .env.production). It must be set,
    scoped to the UI origin, never a wildcard, and the bootstrap script
    itself must still refuse to apply a wildcard origin even if the .env
    value is ever misconfigured (S3)."""

    def _storage_init_script(self, compose_path: Path) -> str:
        compose = _load(compose_path)
        entrypoint = compose["services"]["storage-init"]["entrypoint"]
        # ["/bin/sh", "-c", "<script>"] — the script is the last element.
        return entrypoint[-1]

    @pytest.mark.parametrize(
        "stack_name,dotenv_path",
        [
            ("hardened_ui_m8 (.env.example)", _HARDENED_DOTENV),
            ("hardened_ui_m8 (.env.production.example)", _HARDENED_PROD_DOTENV),
        ],
    )
    def test_storage_cors_is_scoped_to_ui_origin(
        self, stack_name: str, dotenv_path: Path
    ):
        env = _env_vars(dotenv_path)
        value = env.get("S3_CORS_ALLOW_ORIGIN", "")
        assert value, (
            f"{stack_name} must declare S3_CORS_ALLOW_ORIGIN, scoped to the "
            "UI origin(s) allowed on the presigned data path."
        )
        assert "*" not in value, (
            f"{stack_name}: S3_CORS_ALLOW_ORIGIN must NOT contain '*' — "
            f"scope it to the specific UI origin(s). Got: {value!r}"
        )

    def test_storage_init_guards_wildcard_origin(self):
        script = self._storage_init_script(_HARDENED)
        assert "S3_CORS_ALLOW_ORIGIN" in script and "*" in script, (
            "hardened_ui_m8: storage-init must still refuse to apply a "
            "wildcard S3_CORS_ALLOW_ORIGIN at bootstrap time — this guard is "
            "the last line of defense if the .env value is ever misconfigured."
        )
        assert "exit 1" in script, (
            "hardened_ui_m8: storage-init's wildcard-origin guard must abort "
            "the bootstrap (exit 1), not merely warn."
        )


# ---------------------------------------------------------------------------
# CORS policy — dev stacks (SeaweedFS)
# ---------------------------------------------------------------------------

_DEV_STACKS = [
    ("dev_ui_m8", _DEV, _DEV_DOTENV),
    ("dev_local_full_ui_m8", _DEV_LOCAL_FULL, _DEV_LOCAL_FULL_DOTENV),
]


class TestDevStorageCorsBootstrap:
    """Every dev stack's storage-init bootstrap must read S3_CORS_ALLOW_ORIGIN
    and it must NOT be the wildcard '*' — same contract as
    TestHardenedStorageCorsBootstrap, applied to the two dev stacks.

    dev_local_full_ui_m8 overrides S3_CORS_ALLOW_ORIGIN in its compose
    `environment:` block (to interpolate the optional M8_LAN_IP), so its
    .env.example alone is checked for presence/non-wildcard while the guard
    itself is asserted against the running script."""

    @pytest.mark.parametrize("stack_name,_compose_path,dotenv_path", _DEV_STACKS)
    def test_cors_origin_is_set(
        self, stack_name: str, _compose_path: Path, dotenv_path: Path
    ):
        env = _env_vars(dotenv_path)
        assert env.get("S3_CORS_ALLOW_ORIGIN"), (
            f"{stack_name}: .env.example must declare S3_CORS_ALLOW_ORIGIN "
            "(scoped to the UI origin, never *)."
        )

    @pytest.mark.parametrize("stack_name,_compose_path,dotenv_path", _DEV_STACKS)
    def test_cors_origin_is_not_wildcard(
        self, stack_name: str, _compose_path: Path, dotenv_path: Path
    ):
        value = _env_vars(dotenv_path).get("S3_CORS_ALLOW_ORIGIN", "")
        assert "*" not in value, (
            f"{stack_name}: S3_CORS_ALLOW_ORIGIN must NOT contain '*' — "
            f"scope it to the specific UI origin(s). Got: {value!r}"
        )

    @pytest.mark.parametrize("stack_name,compose_path,_dotenv_path", _DEV_STACKS)
    def test_storage_init_guards_wildcard_origin(
        self, stack_name: str, compose_path: Path, _dotenv_path: Path
    ):
        entrypoint = _load(compose_path)["services"]["storage-init"]["entrypoint"]
        script = entrypoint[-1]
        assert "S3_CORS_ALLOW_ORIGIN" in script and "*" in script, (
            f"{stack_name}: storage-init must still refuse to apply a "
            "wildcard S3_CORS_ALLOW_ORIGIN at bootstrap time — this guard is "
            "the last line of defense if the .env value is ever misconfigured."
        )
        assert "exit 1" in script, (
            f"{stack_name}: storage-init's wildcard-origin guard must abort "
            "the bootstrap (exit 1), not merely warn."
        )

    def test_dev_local_full_overrides_cors_for_lan_ip(self):
        """dev_local_full_ui_m8 is the one stack where the origin needs
        M8_LAN_IP interpolation, which env_file values cannot do — the
        compose `environment:` block on storage-init must set it directly."""
        storage_init = _load(_DEV_LOCAL_FULL)["services"]["storage-init"]
        value = str(storage_init.get("environment", {}).get("S3_CORS_ALLOW_ORIGIN", ""))
        assert "M8_LAN_IP" in value, (
            "dev_local_full_ui_m8: storage-init's environment block must "
            "override S3_CORS_ALLOW_ORIGIN with the M8_LAN_IP-interpolated "
            f"origin list (env_file values are not shell-expanded). Got: {value!r}"
        )


# ---------------------------------------------------------------------------
# S3_PUBLIC_ENDPOINT in env.example — all stacks (Phase 4)
# ---------------------------------------------------------------------------


class TestStoragePublicEndpointEnvExample:
    """Every stack's media.env.example must declare S3_PUBLIC_ENDPOINT.
    Dev stacks must point at loopback; hardened (dev + production examples)
    must use https://."""

    def test_hardened_declares_public_endpoint(self):
        env = _env_vars(_HARDENED_ENV)
        assert "S3_PUBLIC_ENDPOINT" in env, (
            "hardened_ui_m8: media.env.example must declare S3_PUBLIC_ENDPOINT."
        )

    def test_hardened_public_endpoint_is_https(self):
        env = _env_vars(_HARDENED_ENV)
        value = env.get("S3_PUBLIC_ENDPOINT", "")
        assert value.startswith("https://"), (
            "hardened_ui_m8: S3_PUBLIC_ENDPOINT must start with 'https://' — "
            f"the storage router is on websecure (TLS). Got: {value!r}"
        )

    def test_hardened_production_declares_public_endpoint(self):
        env = _env_vars(_HARDENED_PROD_ENV)
        assert "S3_PUBLIC_ENDPOINT" in env, (
            "hardened_ui_m8: media.env.production.example must declare "
            "S3_PUBLIC_ENDPOINT."
        )

    def test_hardened_production_public_endpoint_is_https(self):
        env = _env_vars(_HARDENED_PROD_ENV)
        value = env.get("S3_PUBLIC_ENDPOINT", "")
        assert value.startswith("https://"), (
            "hardened_ui_m8: production S3_PUBLIC_ENDPOINT must start with "
            f"'https://' (FQDN storage host over TLS). Got: {value!r}"
        )

    def test_dev_declares_public_endpoint(self):
        env = _env_vars(_DEV_ENV)
        assert "S3_PUBLIC_ENDPOINT" in env, (
            "dev_ui_m8: media.env.example must declare S3_PUBLIC_ENDPOINT."
        )

    def test_dev_public_endpoint_is_loopback(self):
        env = _env_vars(_DEV_ENV)
        value = env.get("S3_PUBLIC_ENDPOINT", "")
        assert "127." in value, (
            "dev_ui_m8: S3_PUBLIC_ENDPOINT must point at loopback (127.x.x.x) "
            f"for the dev stack. Got: {value!r}"
        )

    def test_dev_local_full_declares_public_endpoint(self):
        env = _env_vars(_DEV_LOCAL_FULL_ENV)
        assert "S3_PUBLIC_ENDPOINT" in env, (
            "dev_local_full_ui_m8: media.env.example must declare S3_PUBLIC_ENDPOINT."
        )


# ---------------------------------------------------------------------------
# dev stacks — storage host-port policy
# ---------------------------------------------------------------------------

_DEV_PORT_STACKS = [
    ("dev_ui_m8", _DEV),
    ("dev_local_full_ui_m8", _DEV_LOCAL_FULL),
]


class TestDevStorageLoopbackOnly:
    """In every dev stack the storage backend must publish exactly one
    loopback-bound (127.0.0.1) host port — the S3 gateway — never 0.0.0.0, and
    never a second port for the admin/filer surfaces (those are loopback-bound
    *inside* the container by the boot command, same as hardened_ui_m8)."""

    def _storage_ports(self, compose_path: Path) -> list[str]:
        return _load(compose_path)["services"]["storage"].get("ports", [])

    @pytest.mark.parametrize("stack_name,compose_path", _DEV_PORT_STACKS)
    def test_storage_has_ports_block(self, stack_name: str, compose_path: Path):
        """Dev stacks must still expose the S3 gateway for local tooling."""
        assert self._storage_ports(compose_path), (
            f"{stack_name}: storage has no `ports:` block — the dev stack "
            "should expose the S3 gateway on loopback for local mc/aws-cli access."
        )

    @pytest.mark.parametrize("stack_name,compose_path", _DEV_PORT_STACKS)
    def test_storage_publishes_only_the_s3_gateway(
        self, stack_name: str, compose_path: Path
    ):
        ports = self._storage_ports(compose_path)
        assert ports == ["127.0.0.1:9005:8333"], (
            f"{stack_name}: storage must publish exactly the loopback S3 "
            f"gateway mapping '127.0.0.1:9005:8333' and nothing else — the "
            f"admin/filer surfaces must never be published, even in dev. "
            f"Got: {ports}"
        )

    @pytest.mark.parametrize("stack_name,compose_path", _DEV_PORT_STACKS)
    def test_no_storage_port_on_all_interfaces(
        self, stack_name: str, compose_path: Path
    ):
        for mapping in self._storage_ports(compose_path):
            _assert_loopback_bound(stack_name, mapping)


# ---------------------------------------------------------------------------
# dev_local_full_ui_m8 — same-origin storage catch-all router
# ---------------------------------------------------------------------------


class TestDevLocalFullStorageCatchAllRouter:
    """dev_local_full_ui_m8 has no dedicated storage FQDN: presigned S3 object
    paths resolve through a catch-all router at the site's own origin, behind
    the app-service path prefixes. The admin/filer surfaces are unreachable
    through this router (or any other) because the storage boot command binds
    them to the container's own loopback — the router only needs to exclude
    the S3 gateway's two non-S3 liveness paths."""

    def _traefik(self) -> dict:
        return _load(_DEV_LOCAL_FULL_TRAEFIK)

    def test_storage_public_router_exists(self):
        routers = self._traefik()["http"]["routers"]
        assert "storage-public-router" in routers, (
            "dev_local_full_ui_m8: traefik/dynamic_conf.yml must define a "
            "'storage-public-router' catch-all for browser-direct presigned ops."
        )

    def test_storage_public_router_excludes_non_s3_liveness_paths(self):
        router = self._traefik()["http"]["routers"]["storage-public-router"]
        rule = router.get("rule", "")
        assert "PathPrefix(`/healthz`)" in rule and "PathPrefix(`/status`)" in rule, (
            "dev_local_full_ui_m8: storage-public-router rule must exclude "
            "the two non-S3 liveness paths SeaweedFS serves unauthenticated "
            f"on the S3 gateway port. Got: {rule!r}"
        )

    def test_storage_service_exists_and_targets_gateway(self):
        services = self._traefik()["http"]["services"]
        assert "storage-service" in services, (
            "dev_local_full_ui_m8: traefik/dynamic_conf.yml must define a "
            "'storage-service' Traefik service."
        )
        lb = services["storage-service"]["loadBalancer"]
        urls = [s["url"] for s in lb.get("servers", [])]
        assert "http://storage:8333" in urls, (
            "dev_local_full_ui_m8: storage-service backend must point to the "
            f"S3 gateway 'http://storage:8333'. Got: {urls!r}"
        )

    def test_storage_public_router_service_is_storage_service(self):
        router = self._traefik()["http"]["routers"]["storage-public-router"]
        assert router.get("service") == "storage-service", (
            "dev_local_full_ui_m8: storage-public-router must route to the "
            f"'storage-service' service. Got: {router.get('service')!r}"
        )
