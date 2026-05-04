#!/usr/bin/env bash
# =============================================================
# build-modules.sh — Бүх React модулиудыг build хийж,
# JSF webapp руу хуулах скрипт
#
# Build order (IMPORTANT — dependencies must be built first):
#   1. shared-ui-module  ← design system, no deps
#   2. module-thesis     ← consumes shared-ui-module
#   3. module-auth       ← no federation deps
#   4. module-admin      ← no federation deps
#   5. module-teacher    ← consumes shared-ui-module + module-thesis
#   6. module-student    ← consumes shared-ui-module + module-thesis
# =============================================================
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

ROOT="$(cd "$(dirname "$0")" && pwd)"
JSF_WEB="$ROOT/jsf-host/src/main/webapp/microfrontends"

echo "========================================"
echo " React Микрофронтэнд Build Script"
echo "========================================"

# ------------------------------------------------------------------
# build_module: install → build → copy to JSF webapp
# ------------------------------------------------------------------
build_module() {
  local MODULE=$1
  local DEST="$JSF_WEB/$MODULE/dist"

  echo ""
  echo "▶ $MODULE: npm install..."
  cd "$ROOT/$MODULE"
  npm install --silent

  echo "▶ $MODULE: vite build..."
  npm run build

  # @originjs/vite-plugin-federation outputs remoteEntry.js to dist/assets/
  # Copy it to dist/ root so consumers can find it at .../dist/remoteEntry.js
  if [ -f "dist/assets/remoteEntry.js" ] && [ ! -f "dist/remoteEntry.js" ]; then
    cp dist/assets/remoteEntry.js dist/remoteEntry.js
    echo "▶ $MODULE: remoteEntry.js хуулсан (assets/ → dist/)"
  fi

  echo "▶ $MODULE: JSF webapp руу хуулж байна..."
  mkdir -p "$DEST"
  cp -r dist/. "$DEST/"
  echo "✓ $MODULE: $(ls dist/ | wc -l | tr -d ' ') файл хуулагдлаа"

  # Return to repo root after each module
  cd "$ROOT"
}

# ------------------------------------------------------------------
# Step 1: Design system — must be built FIRST because all other
#         federation consumers reference its remoteEntry.js URL.
# ------------------------------------------------------------------
build_module "shared-ui-module"

# ------------------------------------------------------------------
# Step 2: Shared business feature — depends on shared-ui-module
# ------------------------------------------------------------------
build_module "module-thesis"

# ------------------------------------------------------------------
# Step 3: Role modules — depend on shared-ui-module + module-thesis
# ------------------------------------------------------------------
build_module "module-auth"
build_module "module-admin"
build_module "module-teacher"
build_module "module-student"

echo ""
echo "========================================"
echo " Build амжилттай дууслаа! ✓"
echo "========================================"
echo ""
echo " Дараагийн алхам — JSF хостыг эхлүүлнэ үү:"
echo "   cd jsf-host && mvn clean package && mvn tomcat7:run"
echo ""
echo " Нэвтрэх URL-ууд (Tomcat дээр):"
echo "   Нэвтрэх       : http://localhost:8080/login.xhtml"
echo "   Admin         : http://localhost:8080/admin.xhtml"
echo "   Teacher       : http://localhost:8080/teacher.xhtml"
echo "   Student       : http://localhost:8080/student.xhtml"
echo ""
echo " Дистант модулиуд (Tomcat-ээс статикаар дуудагдана):"
echo "   shared-ui-module : http://localhost:8080/microfrontends/shared-ui-module/dist/remoteEntry.js"
echo "   module-thesis    : http://localhost:8080/microfrontends/module-thesis/dist/remoteEntry.js"
echo ""
echo " Demo нэвтрэх нэрүүд:"
echo "   admin   / admin123   → Admin хуудас"
echo "   teacher / teacher123 → Teacher хуудас"
echo "   student / student123 → Student хуудас"
echo "========================================"
