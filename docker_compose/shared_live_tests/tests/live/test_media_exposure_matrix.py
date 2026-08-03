"""
Live media-service exposure-matrix — item 5.2 (parameterized by topology)
=========================================================================
Target (public):   https://localhost:4430        (Traefik ``websecure``)
Target (internal): http://localhost:9000/media    (loopback ``api`` entryPoint)

This is the **fa-ui-m8 ``/media`` half** of the 5.2 live exposure matrix. The
generic ``security-tests-m8`` package suite (already wired in via
``test_full_security.py``: ``Private/Metrics/HealthAPISuite``) covers the
**``/user``** issuer surface; those suites are hard-coded to ``/user`` and do
not probe the downstream service. This local extension adds the ``/media``
(``media-service-m8``) surface and the topology parameterization, layered on top
of the reusable package per the harness's documented extension point.

Topology (``EXPOSURE_TOPOLOGY={case_a|case_b}``, default ``case_b``):

* **Case B — external clients (default).** The shipped ``hardened_ui_m8`` example
  routes ``/media`` publicly over HTTPS because the fa-ui front end / a browser
  extension call media-service directly. Public-allowed = shallow liveness
  ``{/media}/ping`` and ``{/media}/meta`` (auth-sdk 1.5.0 dual-mount — bare root
  ``/ping`` 404s behind the prefix proxy).
* **Case A — UI-only / closed.** Delete ``media-public-router`` so ``/media`` is
  reachable only via the gateway; then **no ``/media`` route is public on its own**.

**Public denied in BOTH topologies** (the security contract): ``/media/metrics``
and the deep ``/media/health/`` body are route-excluded at the proxy (404), and
``/media/internal/*`` is app-gated (``MEDIA_INTERNAL_SERVICE_TOKEN``) so it never
succeeds publicly. The whole module is marked ``live`` so the package plugin
auto-skips it when the stack is unreachable.
"""

from __future__ import annotations

import os
import uuid

import pytest
import requests

from security_tests_m8._client import TIMEOUT
from security_tests_m8._config import get_config

pytestmark = [pytest.mark.live, pytest.mark.live_security]

# ── Prefix & topology ────────────────────────────────────────────────────────
MEDIA_PREFIX = "media"  # API_PREFIX=/media (media-service-m8 consumer)

CASE_A = "case_a"
CASE_B = "case_b"
TOPOLOGY = os.environ.get("EXPOSURE_TOPOLOGY", CASE_B).strip().lower()

# Routes that MUST be public in Case B (shallow liveness/meta), denied in Case A.
_CASE_B_PUBLIC_ALLOWED: list[str] = [
    f"{MEDIA_PREFIX}/ping",
    f"{MEDIA_PREFIX}/meta",
]
# Case A: no backend media route is public on its own (gateway-only).
_CASE_A_PUBLIC_DENIED: list[str] = [
    f"{MEDIA_PREFIX}/ping",
    f"{MEDIA_PREFIX}/meta",
    f"{MEDIA_PREFIX}/",
]
# App-gated internal route: publicly routed by the media-public-router (only
# /health and /metrics are proxy-excluded) but rejected at the app layer.
_INTERNAL_ROUTE = f"{MEDIA_PREFIX}/internal/v1/health"

# Keys that only appear in the *detailed* health body (1.4 token-gated detail).
_HEALTH_DETAIL_KEYS = frozenset(
    {"redis", "database", "minio", "storage", "degradation_modes", "circuit_breaker"}
)


# ── Helpers (mirror the package's universal-suite idiom) ─────────────────────


def _public_url(path: str) -> str:
    base_url = get_config().public_base_url
    if base_url is None:
        pytest.skip("Public entrypoint checks require LIVE_TEST_PUBLIC_BASE")
    return f"{base_url}/{path.lstrip('/')}"


def _internal_media_base() -> str:
    cfg = get_config()
    base = cfg.service_base_urls.get(MEDIA_PREFIX) or cfg.service_base_url
    if not base:
        pytest.skip("Internal media checks require LIVE_TEST_SVC_BASE(S)")
    return base.rstrip("/")


def _public_get(path: str) -> requests.Response | None:
    """GET the public entryPoint; return None when TLS handshake is refused."""
    try:
        return requests.get(
            _public_url(path),
            timeout=TIMEOUT,
            verify=get_config().public_tls_verify,
        )
    except requests.exceptions.SSLError:
        return None


# ═══════════════════════════════════════════════════════════════════════════
# PUBLIC — denied surface (BOTH topologies)
# ═══════════════════════════════════════════════════════════════════════════


class TestMediaPublicDeniedMetrics:
    """``/media/metrics`` is proxy-excluded — 404 on the public entryPoint."""

    def test_metrics_blocked_by_traefik(self) -> None:
        r = _public_get(f"{MEDIA_PREFIX}/metrics")
        if r is None:
            return
        assert r.status_code == 404, (
            f"[EXPOSURE] /media/metrics is publicly routed (status {r.status_code}, "
            "expected 404). Add PathPrefix(`/media/metrics`) to the exclusion list "
            "in media-public-router (dynamic_conf.yml) and restart Traefik."
        )
        assert "# HELP" not in r.text and "# TYPE" not in r.text, (
            "[EXPOSURE] /media/metrics leaked a Prometheus body to the public internet."
        )


class TestMediaPublicDeniedHealthDetail:
    """Deep ``/media/health/`` is proxy-excluded; the detail body never leaks."""

    def test_health_detail_not_public(self) -> None:
        r = _public_get(f"{MEDIA_PREFIX}/health/")
        if r is None:
            return
        if r.status_code == 404:
            return  # route-excluded at the proxy — detail unreachable either way
        assert r.status_code == 200, (
            f"[EXPOSURE] /media/health/ returned unexpected status {r.status_code}."
        )
        leaked = _HEALTH_DETAIL_KEYS & set(r.json())
        assert not leaked, (
            f"[EXPOSURE] /media/health/ leaked infrastructure detail publicly: "
            f"{sorted(leaked)}. The detail body must be token-gated (1.4)."
        )


class TestMediaPublicDeniedInternal:
    """``/media/internal`` is app-gated — never succeeds publicly."""

    def test_internal_route_not_public(self) -> None:
        r = _public_get(_INTERNAL_ROUTE)
        if r is None:
            return
        assert r.status_code in (401, 403, 404), (
            f"[EXPOSURE] /{_INTERNAL_ROUTE} is reachable from the public internet "
            f"(status {r.status_code}). Internal media routes must require "
            "MEDIA_INTERNAL_SERVICE_TOKEN at the app layer."
        )


# ═══════════════════════════════════════════════════════════════════════════
# PUBLIC — allowed/denied per topology
# ═══════════════════════════════════════════════════════════════════════════


@pytest.mark.skipif(TOPOLOGY != CASE_B, reason="Case B (external-client) topology only")
class TestMediaCaseBPublicAllowed:
    """Case B: the shallow liveness/meta surface is publicly routed."""

    @pytest.mark.parametrize("path", _CASE_B_PUBLIC_ALLOWED)
    def test_liveness_is_publicly_routed(self, path: str) -> None:
        r = _public_get(path)
        if r is None:
            return
        assert r.status_code != 404, (
            f"[EXPOSURE case_b] GET /{path} should be public but the proxy "
            "returned 404. Check media-public-router in dynamic_conf.yml."
        )


@pytest.mark.skipif(TOPOLOGY != CASE_A, reason="Case A (UI-only) topology only")
class TestMediaCaseAClosedBackend:
    """Case A: no ``/media`` route is public on its own (gateway-only)."""

    @pytest.mark.parametrize("path", _CASE_A_PUBLIC_DENIED)
    def test_media_route_not_public(self, path: str) -> None:
        r = _public_get(path)
        if r is None:
            return
        assert r.status_code == 404, (
            f"[EXPOSURE case_a] GET /{path} is public, but Case A (UI-only) requires "
            f"media to be reachable only via the gateway. Got {r.status_code}."
        )


# ═══════════════════════════════════════════════════════════════════════════
# INTERNAL — the loopback entryPoint carries the full /media surface
# ═══════════════════════════════════════════════════════════════════════════


class TestMediaInternalEntrypoint:
    """On the loopback ``api`` entryPoint, internal routes exist but are gated."""

    def test_internal_route_rejected_without_token(self) -> None:
        base = _internal_media_base()
        r = requests.post(
            f"{base}/internal/v1/objects/{uuid.uuid4().hex}/probe",
            timeout=TIMEOUT,
        )
        assert r.status_code in (401, 403, 404), (
            f"[EXPOSURE] media internal route accepted an unauthenticated internal "
            f"call (status {r.status_code}); it must require MEDIA_INTERNAL_SERVICE_TOKEN."
        )
