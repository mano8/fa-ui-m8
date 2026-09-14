"""`T30-close-deferred-flags` acceptance, `fa-ui-m8` mirror: nothing tracked
in this repository names MinIO where it means *the* storage backend.

Mirror of `media-service-m8/tests/test_no_retired_backend_references.py`. The
three `fa-ui-m8` compose stacks run the same SeaweedFS backend (Garage as the
validated fallback) and the same `S3_*` vocabulary; this repository has no
deprecation shim and no production `secrets:` block, so the only things that
may still say `minio` here are historical references (the old backend named
as what was replaced), the `minio/data/*` runtime-directory lines kept in
each stack's `.gitignore` for pre-migration worktrees, and the retired health
key name a live test still asserts *absent*. Every other mention — a README
describing the running stack, an env-file header, a placeholder credential —
is a leftover this test exists to catch.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

_REPO = Path(__file__).resolve().parents[2]

_EXEMPT_FILES = {
    "docker_compose/compose_policy_tests/test_no_retired_backend_references.py",
}
_EXEMPT_DIR_PARTS = ("grafana/data/plugins", "node_modules/", "/dist/")
_TEXT_SUFFIXES = {
    ".py", ".yml", ".yaml", ".toml", ".md", ".mdx", ".txt", ".sh", ".json",
    ".cfg", ".ini", ".example", ".env", ".template", ".ts", ".tsx", ".astro",
    ".mjs", ".js", ".gitignore", ".dockerignore", "",
}

# `\bminio` (not `\bminio\b`): `minio_access_key` must still be caught, while
# Spanish "dominio" in the translated docs must not.
_MENTION = re.compile(r"\bminio", re.IGNORECASE)

# A line may mention `minio` only if it also carries one of these markers.
_ALLOWED_CONTEXT = re.compile(
    "|".join(
        (
            r"\bold\b",
            r"\bretired\b",
            r"\bformer\b",
            r"\blegacy\b",
            r"\bdeprecated\b",
            r"MinIO-era",
            r"did for MinIO",
            r"MinIO's",
            r"MinIO ?→",
            r"->",
            r"→",
            r"MinIO/`minio`",
            r"MINIO_API_CORS_ALLOW_ORIGIN",  # the retired env var, only ever named as gone
            r"PathPrefix\(`?/minio`?\)",
            r"minio/data",
        )
    ),
    re.IGNORECASE,
)


def _tracked_files(repo: Path) -> list[Path]:
    out = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=repo,
        check=True,
        capture_output=True,
    ).stdout
    return [repo / rel for rel in out.decode("utf-8").split(chr(0)) if rel]


def _scannable(path: Path, repo: Path) -> bool:
    rel = path.relative_to(repo).as_posix()
    if rel in _EXEMPT_FILES or any(part in rel for part in _EXEMPT_DIR_PARTS):
        return False
    return path.suffix in _TEXT_SUFFIXES or path.name.startswith(".")


def _offending_lines(files: list[Path], repo: Path) -> list[str]:
    offenders: list[str] = []
    for path in files:
        if not path.is_file() or not _scannable(path, repo):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        rel = path.relative_to(repo).as_posix()
        for lineno, line in enumerate(text.splitlines(), 1):
            if _MENTION.search(line) and not _ALLOWED_CONTEXT.search(line):
                offenders.append(f"{rel}:{lineno}: {line.strip()}")
    return offenders


def test_no_tracked_file_names_minio_as_the_current_backend() -> None:
    offenders = _offending_lines(_tracked_files(_REPO), _REPO)
    joined = "\n  ".join(offenders)
    assert not offenders, (
        "These lines name MinIO as if it were the storage backend this fleet "
        "runs. Either it is a leftover to fix, or a genuinely historical "
        f"reference that needs one of the markers this test recognises:\n  {joined}"
    )


def test_env_examples_carry_no_minio_named_placeholder() -> None:
    """T30: `changethis_minio_user` / `changethis_minio_password` were the
    placeholder admin credentials in every stack's `.env.example` — a copied
    stack then boots with a credential that names a backend it does not run."""
    for env_example in (_REPO / "docker_compose").glob("*/.env*.example"):
        text = env_example.read_text(encoding="utf-8")
        assert "changethis_minio" not in text, env_example


def test_scanner_flags_a_live_mention_and_skips_history_binaries_and_exempt_paths(
    tmp_path: Path,
) -> None:
    """The scanner itself: one offending line is reported with its location,
    a marked (historical) line is not, Spanish "dominio" is not, a non-UTF-8
    file is skipped, and an exempt path is never opened."""
    lines = [
        "The stack runs MinIO on data_net",
        "Unlike the old MinIO block, SeaweedFS has one port",
        "El dominio de la app",
    ]
    (tmp_path / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (tmp_path / "blob.json").write_bytes(bytes([0xFF, 0xFE]) + b"minio")
    exempt = tmp_path / "docker_compose" / "compose_policy_tests"
    exempt.mkdir(parents=True)
    (exempt / "test_no_retired_backend_references.py").write_text(
        "minio everywhere\n", encoding="utf-8"
    )
    files = [
        tmp_path / "README.md",
        tmp_path / "blob.json",
        exempt / "test_no_retired_backend_references.py",
        tmp_path / "missing.md",
    ]
    assert _offending_lines(files, tmp_path) == [
        "README.md:1: The stack runs MinIO on data_net"
    ]
