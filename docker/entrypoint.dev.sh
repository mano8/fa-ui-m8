#!/usr/bin/env bash

set -Eeuo pipefail

cd /app

echo "=================================="
echo "Astro Development Container"
echo "=================================="

AUTH_PLUGIN_DIR="${FA_AUTH_PLUGIN_DIR:-/astro-auth-m8}"
MEDIA_PLUGIN_DIR="${FA_MEDIA_PLUGIN_DIR:-/astro-media-m8}"
LOCAL_PLUGIN_AVAILABLE=0

# Base flags are harmless everywhere. --legacy-peer-deps is scoped to ONLY the
# installs that must resolve the cross-plugin peer: astro-media-m8 peers on the
# unpublished, prerelease-pinned astro-auth-m8 (^0.1.0 vs the real 0.1.0-alpha.0
# — a prerelease that does NOT satisfy a plain caret range). Strict resolution
# would try, and fail, to fetch that peer from the public registry (E404). The
# link_plugin symlinks below provide the real local package. astro-auth-m8 itself
# peers only on public packages (astro/react/zod), so it installs strictly.
NPM_BASE_FLAGS="--no-audit --no-fund"
NPM_LEGACY_PEER="--legacy-peer-deps"

# Install a mounted local @fa-m8 plugin's own deps (once) and compile it to dist/.
prepare_plugin() {
    local name="$1" dir="$2" flags="$3"
    if [ ! -f "$dir/package.json" ]; then
        echo "Local $name plugin not mounted at $dir; npm will use package-lock resolution."
        return
    fi
    LOCAL_PLUGIN_AVAILABLE=1
    echo "Preparing local $name plugin at $dir..."
    (
        cd "$dir"
        if [ ! -f node_modules/.package-lock.json ]; then
            if [ -f package-lock.json ]; then
                npm ci $flags
            else
                npm install $flags
            fi
        fi
        npm run build
    )
}

# Symlink a built local plugin into the app's node_modules under @fa-m8/.
link_plugin() {
    local name="$1" dir="$2"
    [ -f "$dir/package.json" ] || return
    mkdir -p node_modules/@fa-m8
    rm -rf "node_modules/@fa-m8/$name"
    ln -s "$dir" "node_modules/@fa-m8/$name"
}

# auth resolves strictly; media needs --legacy-peer-deps for its peer on auth.
prepare_plugin "astro-auth-m8" "$AUTH_PLUGIN_DIR" "$NPM_BASE_FLAGS"
prepare_plugin "astro-media-m8" "$MEDIA_PLUGIN_DIR" "$NPM_BASE_FLAGS $NPM_LEGACY_PEER"

NEEDS_APP_INSTALL=0
APP_DEPS_STAMP="node_modules/.fa-ui-m8-deps.stamp"
APP_DEPS_FINGERPRINT="$(sha256sum package.json package-lock.json 2>/dev/null | sha256sum | awk '{print $1}')"

# Handle first startup or dependency changes. The named node_modules volume
# exists even when empty, so check for npm's installed package marker.
if [ ! -f node_modules/.package-lock.json ]; then
    NEEDS_APP_INSTALL=1
fi
if [ ! -f "$APP_DEPS_STAMP" ] || [ "$(cat "$APP_DEPS_STAMP")" != "$APP_DEPS_FINGERPRINT" ]; then
    NEEDS_APP_INSTALL=1
fi

if [ "$NEEDS_APP_INSTALL" -eq 1 ]; then
    echo "Installing Astro app dependencies..."
    rm -rf node_modules/.vite

    if [ -f package-lock.json ]; then
        if [ "$LOCAL_PLUGIN_AVAILABLE" -eq 1 ]; then
            # Local plugins present: the tree includes media's peer on auth, so
            # relax peer resolution (and skip the lock, which pins registry deps).
            npm install --package-lock=false $NPM_BASE_FLAGS $NPM_LEGACY_PEER
        else
            npm ci $NPM_BASE_FLAGS
        fi
    else
        npm install $NPM_BASE_FLAGS $NPM_LEGACY_PEER
    fi

    printf '%s' "$APP_DEPS_FINGERPRINT" > "$APP_DEPS_STAMP"
fi

# Relink local plugins last: the app install above may have replaced the @fa-m8
# entries with broken file: symlinks that point outside the container's mounts.
link_plugin "astro-auth-m8" "$AUTH_PLUGIN_DIR"
link_plugin "astro-media-m8" "$MEDIA_PLUGIN_DIR"

echo "Starting Astro..."

exec npm run dev -- --host 0.0.0.0
