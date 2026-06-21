"""Static tests locking in the Node.js dependency-audit posture (item 4.3).

Policy:
  - The CI workflow must run `npm audit --audit-level=high` (or stricter) so
    HIGH/CRITICAL advisories gate the build.
  - `app/package-lock.json` must exist (the lock file is the Node equivalent of
    a constraints file — `npm ci` enforces it for reproducible installs).
"""

from __future__ import annotations

from pathlib import Path

import yaml

_REPO_ROOT = Path(__file__).parent.parent.parent
_CI_WORKFLOW = _REPO_ROOT / ".github" / "workflows" / "CI.yaml"
_PACKAGE_LOCK = _REPO_ROOT / "app" / "package-lock.json"

_AUDIT_LEVELS = {"high", "critical"}  # either is an acceptable gate


def _load_ci() -> dict:
    return yaml.safe_load(_CI_WORKFLOW.read_text())


# ---------------------------------------------------------------------------
# package-lock.json — reproducible installs
# ---------------------------------------------------------------------------


class TestPackageLock:
    def test_package_lock_exists(self):
        assert _PACKAGE_LOCK.exists(), (
            f"{_PACKAGE_LOCK} is missing — commit package-lock.json so `npm ci` "
            "enforces reproducible, pinned dependency installs."
        )

    def test_package_lock_is_nonempty(self):
        assert _PACKAGE_LOCK.stat().st_size > 0, (
            f"{_PACKAGE_LOCK} is empty — it should contain the full lock graph."
        )


# ---------------------------------------------------------------------------
# CI gate — npm audit must run at HIGH or CRITICAL level
# ---------------------------------------------------------------------------


def _find_npm_audit_step(ci: dict) -> list[str]:
    """Return all `run:` values that contain an npm audit command."""
    found: list[str] = []
    for job in ci.get("jobs", {}).values():
        for step in job.get("steps", []):
            run = step.get("run", "")
            if "npm audit" in run:
                found.append(run)
    return found


class TestNpmAuditCI:
    def test_ci_runs_npm_audit(self):
        ci = _load_ci()
        steps = _find_npm_audit_step(ci)
        assert steps, (
            f"No `npm audit` step found in {_CI_WORKFLOW} — "
            "add `npm audit --audit-level=high` to the security job."
        )

    def test_npm_audit_gates_on_high_or_critical(self):
        ci = _load_ci()
        steps = _find_npm_audit_step(ci)
        assert steps, "No `npm audit` step — see previous test."
        for run in steps:
            # Accept --audit-level=high or --audit-level=critical (both are sufficient).
            has_level = any(f"--audit-level={lvl}" in run for lvl in _AUDIT_LEVELS)
            assert has_level, (
                f"npm audit step does not specify --audit-level={{high|critical}}:\n{run}\n"
                "HIGH/CRITICAL advisories must gate the build."
            )

    def test_security_job_installs_deps_before_audit(self):
        ci = _load_ci()
        for job_name, job in ci.get("jobs", {}).items():
            steps = job.get("steps", [])
            runs = [s.get("run", "") for s in steps]
            if any("npm audit" in r for r in runs):
                ci_idx = next((i for i, r in enumerate(runs) if "npm ci" in r or "npm install" in r), None)
                audit_idx = next((i for i, r in enumerate(runs) if "npm audit" in r), None)
                assert ci_idx is not None, (
                    f"Job '{job_name}' runs npm audit but never installs dependencies."
                )
                assert ci_idx < audit_idx, (
                    f"Job '{job_name}': dependency install (step {ci_idx}) must precede "
                    f"npm audit (step {audit_idx})."
                )
