"""Static policy tests for API_BIND_IP / port-9000 binding (plan item 5.4).

Asserts the security contract for the internal :9000 services entryPoint:

- Every compose base that publishes :9000 uses `${API_BIND_IP:-127.0.0.1}` as
  the bind address — never a literal 0.0.0.0 hardcoded in the file.
- The production overlay drops :9000 from published ports entirely (traefik
  `ports: !override` only has :80, :443/tcp, and :443/udp).
- No *.env.example file sets API_BIND_IP=0.0.0.0 (the safe default is
  127.0.0.1, commented or absent; operators must opt in explicitly by editing
  a real env file).
"""

from __future__ import annotations

import re
from ipaddress import ip_address
from pathlib import Path

import pytest
import yaml

_COMPOSE_DIR = Path(__file__).parent.parent

_DEV_UI_M8 = _COMPOSE_DIR / "dev_ui_m8"
_HARDENED_UI_M8 = _COMPOSE_DIR / "hardened_ui_m8"

# Both base compose files publish :9000 via the services entryPoint.
_DEV_STACKS_WITH_9000 = [
    pytest.param(_DEV_UI_M8 / "docker-compose.yml", id="dev_ui_m8"),
    pytest.param(_HARDENED_UI_M8 / "docker-compose.yml", id="hardened_ui_m8"),
]

_PRODUCTION_OVERLAY = _HARDENED_UI_M8 / "docker-compose.production.yml"

# All *.env.example files across both stacks (including hidden .env.example).
_ENV_EXAMPLES = sorted(
    {p for p in _COMPOSE_DIR.rglob("*.env.example")}
    | {p for p in _COMPOSE_DIR.rglob(".env.example")}
)


# ── yaml loader that tolerates Compose !reset / !override tags ────────────────


class _ComposeLoader(yaml.SafeLoader):
    pass


def _identity(loader: _ComposeLoader, node: yaml.Node) -> object:
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    if isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    return loader.construct_scalar(node)


_ComposeLoader.add_constructor("!reset", _identity)
_ComposeLoader.add_constructor("!override", _identity)


def _load_compose(path: Path) -> dict:
    # _ComposeLoader subclasses SafeLoader — only adds !reset/!override, so this
    # is safe despite passing a custom Loader to yaml.load.
    return yaml.load(path.read_text(), Loader=_ComposeLoader)  # nosec B506


# ── dev base: :9000 must use ${API_BIND_IP:-127.0.0.1}, never 0.0.0.0 ────────


@pytest.mark.parametrize("compose_path", _DEV_STACKS_WITH_9000)
def test_dev_port_9000_not_hardcoded_to_0000(compose_path: Path) -> None:
    """Port 9000 must not be hardcoded to 0.0.0.0 in the dev base compose."""
    text = compose_path.read_text(encoding="utf-8")
    assert "0.0.0.0:9000" not in text, (
        f"{compose_path.name}: port 9000 must not be hardcoded to 0.0.0.0 — "
        "use '${API_BIND_IP:-127.0.0.1}:9000:9000' so the default is loopback"
    )


@pytest.mark.parametrize("compose_path", _DEV_STACKS_WITH_9000)
def test_dev_port_9000_uses_api_bind_ip_variable(compose_path: Path) -> None:
    """Port 9000 must reference ${API_BIND_IP:-...} so operators can override it."""
    text = compose_path.read_text(encoding="utf-8")
    assert "${API_BIND_IP:-" in text, (
        f"{compose_path.name}: port 9000 binding must use "
        "'${API_BIND_IP:-127.0.0.1}:9000:9000' "  # noqa: ISC003
        "so operators can override the bind address via API_BIND_IP in .env"
    )


# ── production overlay: :9000 must NOT be host-published ─────────────────────


def test_production_overlay_does_not_publish_port_9000() -> None:
    """The production overlay must not expose :9000 on any host interface.

    The overlay uses `ports: !override` on the traefik service with only :80
    and :443; port 9000 stays on the Docker network only.
    """
    compose = _load_compose(_PRODUCTION_OVERLAY)
    traefik_ports = compose.get("services", {}).get("traefik", {}).get("ports") or []
    published_9000 = [p for p in traefik_ports if "9000" in str(p)]
    assert not published_9000, (
        "production overlay must not publish :9000 — "
        f"found: {published_9000}. Port 9000 must stay Docker-network-only in production."
    )


def test_production_overlay_traefik_only_publishes_80_and_443() -> None:
    """Production overlay traefik ports must be limited to :80 and :443."""
    compose = _load_compose(_PRODUCTION_OVERLAY)
    traefik_ports = compose.get("services", {}).get("traefik", {}).get("ports") or []
    allowed = re.compile(r"^(:?80:80|443:443(?:/tcp|/udp)?)$")
    unexpected = [p for p in traefik_ports if not allowed.match(str(p).strip('"'))]
    assert not unexpected, (
        "production overlay traefik must only publish :80 and :443, "
        f"found unexpected ports: {unexpected}"
    )


# ── env examples: API_BIND_IP must not be set to 0.0.0.0 ────────────────────


def _active_api_bind_ip(path: Path) -> str | None:
    """Return the active (uncommented) API_BIND_IP value, or None if absent/commented."""
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            continue
        if stripped.startswith("API_BIND_IP="):
            return stripped.split("=", 1)[1].strip()
    return None


def _is_unspecified_address(value: str | None) -> bool:
    """Return whether a configured IP would listen on every interface."""
    if value is None:
        return False
    try:
        return ip_address(value).is_unspecified
    except ValueError:
        return False


@pytest.mark.parametrize(
    "env_path",
    [pytest.param(p, id=str(p.relative_to(_COMPOSE_DIR))) for p in _ENV_EXAMPLES],
)
def test_env_example_does_not_set_api_bind_ip_to_0000(env_path: Path) -> None:
    """*.env.example files must never set API_BIND_IP=0.0.0.0.

    The safe default is 127.0.0.1 (commented or absent); operators who need
    LAN/public exposure must edit their real env file explicitly.
    """
    value = _active_api_bind_ip(env_path)
    assert not _is_unspecified_address(value), (
        f"{env_path.relative_to(_COMPOSE_DIR)}: must not set API_BIND_IP=0.0.0.0 — "
        "example files must document the safe default (127.0.0.1, commented) only"
    )


# ── unit coverage for the merge-tag-tolerant loader ──────────────────────────


class TestComposeLoaderToleratesMergeTags:
    """Exercise every branch of the !reset / !override constructor."""

    def test_sequence_tag(self) -> None:
        doc = yaml.load(  # nosec B506 -- _ComposeLoader derives from SafeLoader.
            "ports: !override [80, 443]", Loader=_ComposeLoader
        )
        assert doc == {"ports": [80, 443]}

    def test_mapping_tag(self) -> None:
        doc = yaml.load(  # nosec B506 -- _ComposeLoader derives from SafeLoader.
            "env: !override {A: 1}", Loader=_ComposeLoader
        )
        assert doc == {"env": {"A": 1}}

    def test_scalar_tag(self) -> None:
        doc = yaml.load(  # nosec B506 -- _ComposeLoader derives from SafeLoader.
            "name: !reset value", Loader=_ComposeLoader
        )
        assert doc == {"name": "value"}


class TestActiveApiBindIp:
    """Unit tests for _active_api_bind_ip covering all branches."""

    def test_returns_none_when_absent(self, tmp_path: Path) -> None:
        f = tmp_path / "test.env.example"
        f.write_text("DB_HOST=localhost\nREDIS_PASSWORD=changethis\n")
        assert _active_api_bind_ip(f) is None

    def test_returns_none_when_commented(self, tmp_path: Path) -> None:
        f = tmp_path / "test.env.example"
        f.write_text("# API_BIND_IP=0.0.0.0\n#API_BIND_IP=127.0.0.1\n")
        assert _active_api_bind_ip(f) is None

    def test_returns_value_when_active(self, tmp_path: Path) -> None:
        f = tmp_path / "test.env.example"
        f.write_text("API_BIND_IP=127.0.0.1\n")
        assert _active_api_bind_ip(f) == "127.0.0.1"

    def test_returns_value_trims_whitespace(self, tmp_path: Path) -> None:
        f = tmp_path / "test.env.example"
        f.write_text("API_BIND_IP=  127.0.0.1  \n")
        assert _active_api_bind_ip(f) == "127.0.0.1"
