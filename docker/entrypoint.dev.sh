#!/usr/bin/env bash

set -Eeuo pipefail

cd /app

echo "=================================="
echo "Astro Development Container"
echo "=================================="

AUTH_PLUGIN_DIR="${FA_AUTH_PLUGIN_DIR:-/astro-auth-m8}"
MEDIA_PLUGIN_DIR="${FA_MEDIA_PLUGIN_DIR:-/astro-media-m8}"

# Base flags are harmless everywhere. Published @mano8 plugin packages resolve
# from npm by default; mounted local checkouts are linked after install as a dev
# override when FA_*_PLUGIN_DIR points at a package.
NPM_BASE_FLAGS=(--no-audit --no-fund)

# Install a mounted local @mano8 plugin's own deps (once) and compile it to dist/.
prepare_plugin() {
    local name="$1" dir="$2"
    shift 2
    local flags=("$@")
    if [ ! -f "$dir/package.json" ]; then
        echo "Local $name plugin not mounted at $dir; npm will use package-lock resolution."
        return
    fi
    echo "Preparing local $name plugin at $dir..."
    (
        cd "$dir"
        if [ ! -f node_modules/.package-lock.json ]; then
            if [ -f package-lock.json ]; then
                npm ci "${flags[@]}"
            else
                npm install "${flags[@]}"
            fi
        fi
        npm run build
    )
}

# Symlink a built local plugin into the app's node_modules under @mano8/.
link_plugin() {
    local name="$1" dir="$2"
    [ -f "$dir/package.json" ] || return
    mkdir -p node_modules/@mano8
    rm -rf "node_modules/@mano8/$name"
    ln -s "$dir" "node_modules/@mano8/$name"
}

prepare_plugin "astro-auth-m8" "$AUTH_PLUGIN_DIR" "${NPM_BASE_FLAGS[@]}"
prepare_plugin "astro-media-m8" "$MEDIA_PLUGIN_DIR" "${NPM_BASE_FLAGS[@]}"

NEEDS_APP_INSTALL=0
APP_DEPS_STAMP="node_modules/.fa-ui-m8-deps.stamp"
APP_DEPS_FINGERPRINT="$(sha256sum package.json package-lock.json .npmrc 2>/dev/null | sha256sum | awk '{print $1}')"

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
        npm ci "${NPM_BASE_FLAGS[@]}"
    else
        npm install "${NPM_BASE_FLAGS[@]}"
    fi

    printf '%s' "$APP_DEPS_FINGERPRINT" > "$APP_DEPS_STAMP"
fi

# Relink local plugins last so mounted checkouts can override published packages
# during live plugin development.
link_plugin "astro-auth-m8" "$AUTH_PLUGIN_DIR"
link_plugin "astro-media-m8" "$MEDIA_PLUGIN_DIR"

echo "Starting Astro..."

exec npm run dev -- --host 0.0.0.0
