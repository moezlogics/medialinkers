#!/usr/bin/env bash
# One-command deploy for the live server.
#   First time:  bash deploy.sh --first   (also creates missing content: admin user, pages, case study screenshots…)
#   Updates:     git pull && bash deploy.sh
# Run it from the project folder, as root or as the site user.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# As root: hand the files to the site user and continue as that user (PM2 must run as them)
if [ "$(id -u)" = "0" ]; then
  OWNER="$(stat -c %U "$DIR/..")"
  if [ "$OWNER" = "root" ]; then
    echo "✗ Could not find the site user (parent folder belongs to root). Run: su - SITE_USER, then: bash deploy.sh $*"
    exit 1
  fi
  echo "→ Giving the files to '$OWNER' and continuing as '$OWNER'"
  chown -R "$OWNER:$OWNER" "$DIR"
  exec su - "$OWNER" -c "cd '$DIR' && bash deploy.sh $*"
fi

# Checks
if [ ! -f .env ] && [ ! -f .env.local ]; then echo "✗ .env is missing (see DEPLOY.md)"; exit 1; fi
# Looks in whichever of .env / .env.local exist (allows "export NAME=" and spaces)
has_env() { grep -qsE "^[[:space:]]*(export[[:space:]]+)?$1" .env .env.local; }
if ! has_env 'MONGODB_URI[[:space:]]*='; then echo "✗ MONGODB_URI is not set in .env"; exit 1; fi
if ! has_env 'NEXT_PUBLIC_SITE_URL[[:space:]]*=[[:space:]]*"?https://'; then echo "! NEXT_PUBLIC_SITE_URL should be https://www.medialinkers.pk"; fi
if ! command -v node >/dev/null; then echo "✗ Node.js not found for user $(whoami). In CloudPanel pick a Node.js version for the site."; exit 1; fi
if [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then echo "✗ Node $(node -v) is too old (need 20.9 or newer)"; exit 1; fi
PM2="pm2"
command -v pm2 >/dev/null || PM2="npx --yes pm2"
echo "✓ Node $(node -v) · user $(whoami)"

echo "→ Installing packages"
npm ci --no-audit --no-fund

if [ "${1:-}" = "--first" ]; then
  echo "→ Creating missing content (existing content is never changed)"
  npm run seed
fi

echo "→ Adding new case studies and screenshots (existing content is never changed)"
npx tsx scripts/sync-case-studies.ts

echo "→ Building the site"
npm run build

echo "→ Starting on port 3113"
if $PM2 describe medialinkers >/dev/null 2>&1; then
  $PM2 reload ecosystem.config.cjs --update-env
else
  $PM2 start ecosystem.config.cjs
fi
$PM2 save

sleep 4
CODE="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3113/ || true)"
if [ "$CODE" = "200" ]; then
  echo "✓ Done — the site answers on 127.0.0.1:3113 (HTTP 200)"
else
  echo "! Started, but 127.0.0.1:3113 answered '$CODE'. Check: $PM2 logs medialinkers --lines 50"
fi
