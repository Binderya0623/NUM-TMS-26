#!/usr/bin/env bash
# =============================================================
# setup-modules.sh
# =============================================================
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/Evalution_frontEnd-main/src"

copy_module() {
  local MODULE=$1
  local DEST="$ROOT/$MODULE/src"
  echo ""
  echo "▶ $MODULE — эх код хуулж байна..."

  # Хуваалцсан файлууд — бүх модульд шаардлагатай
  cp "$SRC/index.css" "$DEST/index.css"
  mkdir -p "$DEST/lib"
  cp "$SRC/lib/utils.ts" "$DEST/lib/utils.ts"
  mkdir -p "$DEST/app/data"
  cp "$SRC/app/data/mockData.ts" "$DEST/app/data/mockData.ts"

  # Хуваалцсан дэд компонентууд
  mkdir -p "$DEST/app/components/ui"
  cp -r "$SRC/app/components/ui/." "$DEST/app/components/ui/"
  cp "$SRC/app/components/StatusBadge.tsx"           "$DEST/app/components/" 2>/dev/null || true
  cp "$SRC/app/components/FileUpload.tsx"            "$DEST/app/components/" 2>/dev/null || true
  cp "$SRC/app/components/ThesisTimeline.tsx"        "$DEST/app/components/" 2>/dev/null || true
  cp "$SRC/app/components/FloatingMessageButton.tsx" "$DEST/app/components/" 2>/dev/null || true
  cp "$SRC/app/components/TopHeader.tsx"             "$DEST/app/components/" 2>/dev/null || true

  # ComingSoon хуудас — бүх модульд хэрэгтэй
  mkdir -p "$DEST/app/pages"
  cp "$SRC/app/pages/ComingSoon.tsx" "$DEST/app/pages/" 2>/dev/null || true
}

# ---------- Admin модуль ----------
copy_module "module-admin"
mkdir -p "$ROOT/module-admin/src/app/layouts"
mkdir -p "$ROOT/module-admin/src/app/pages/admin"
cp "$SRC/app/components/AdminSidebar.tsx" "$ROOT/module-admin/src/app/components/"
cp "$SRC/app/layouts/AdminLayout.tsx"     "$ROOT/module-admin/src/app/layouts/"
cp -r "$SRC/app/pages/admin/."            "$ROOT/module-admin/src/app/pages/admin/"
echo "✓ module-admin бэлэн"

# ---------- Teacher модуль ----------
copy_module "module-teacher"
mkdir -p "$ROOT/module-teacher/src/app/layouts"
mkdir -p "$ROOT/module-teacher/src/app/pages/teacher"
cp "$SRC/app/components/TeacherSidebar.tsx" "$ROOT/module-teacher/src/app/components/"
cp "$SRC/app/layouts/TeacherLayout.tsx"     "$ROOT/module-teacher/src/app/layouts/"
cp -r "$SRC/app/pages/teacher/."            "$ROOT/module-teacher/src/app/pages/teacher/"
echo "✓ module-teacher бэлэн"

# ---------- Student модуль ----------
copy_module "module-student"
mkdir -p "$ROOT/module-student/src/app/layouts"
mkdir -p "$ROOT/module-student/src/app/pages/student"
cp "$SRC/app/components/StudentSidebar.tsx" "$ROOT/module-student/src/app/components/"
cp "$SRC/app/layouts/StudentLayout.tsx"     "$ROOT/module-student/src/app/layouts/"
cp -r "$SRC/app/pages/student/."            "$ROOT/module-student/src/app/pages/student/"
echo "✓ module-student бэлэн"

echo ""
echo "=================================================="
echo " Эх код бүгдийг хуулж дууслаа ✓"
echo " Дараагийн алхам:"
echo "   ./build-modules.sh"
echo "=================================================="
