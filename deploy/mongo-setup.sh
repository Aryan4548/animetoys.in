#!/usr/bin/env bash
#
# mongo-setup.sh — installs MongoDB Community Server directly on this VPS,
# configures it as a systemd service (auto-start on reboot), locks it to
# localhost only, and creates a dedicated, least-privilege application user
# and database. No MongoDB Atlas, no external database service.
#
# Targets Ubuntu 20.04 / 22.04 / 24.04 natively; newer Ubuntu releases (e.g.
# 26.04) are handled automatically via a repo-codename fallback below, since
# MongoDB's apt repo doesn't publish a build for every new Ubuntu release.
# Run as root or with sudo:
#   sudo bash deploy/mongo-setup.sh
#
set -euo pipefail

MONGO_VERSION="8.0"
DB_NAME="anime_toy_universe"
DB_USER="anime_app"

if [[ $EUID -ne 0 ]]; then
  echo "Please run this script as root (sudo bash deploy/mongo-setup.sh)." >&2
  exit 1
fi

. /etc/os-release
echo "Detected OS: $PRETTY_NAME"
if [[ "$ID" != "ubuntu" ]]; then
  echo "This script targets Ubuntu. Adapt the package repo steps below for other distros."
fi

echo ""
echo "=== 1. Installing MongoDB ${MONGO_VERSION} Community Server ==="
if ! command -v mongod >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y gnupg curl

  # MongoDB's official apt repo only ships packages for specific Ubuntu
  # codenames (currently focal/20.04, jammy/22.04, noble/24.04) — it does
  # NOT publish a separate entry for every new Ubuntu release. A VPS
  # running a newer Ubuntu release than MongoDB has explicitly built for
  # (e.g. 26.04 "resolute") would otherwise get a 404 on `apt-get update`
  # if we blindly used its own codename. Fall back to the newest codename
  # MongoDB actually supports in that case — this is the same approach
  # MongoDB's own community guidance uses, since Ubuntu LTS releases stay
  # binary-compatible enough for this apt repo's purposes.
  DETECTED_CODENAME="$(lsb_release -cs)"
  case "$DETECTED_CODENAME" in
    focal|jammy|noble)
      MONGO_REPO_CODENAME="$DETECTED_CODENAME"
      ;;
    *)
      MONGO_REPO_CODENAME="noble"
      echo "Ubuntu codename '${DETECTED_CODENAME}' has no dedicated MongoDB apt repo yet — using the 'noble' (24.04) repo instead, which is compatible."
      ;;
  esac

  curl -fsSL "https://pgp.mongodb.com/server-${MONGO_VERSION}.asc" | \
    gpg -o /usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg --dearmor

  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu ${MONGO_REPO_CODENAME}/mongodb-org/${MONGO_VERSION} multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list

  apt-get update -y
  apt-get install -y mongodb-org
else
  echo "mongod already installed, skipping package install."
fi

echo ""
echo "=== 2. Enabling MongoDB as a systemd service ==="
systemctl daemon-reload
systemctl enable mongod
systemctl start mongod
sleep 2
systemctl status mongod --no-pager || true

echo ""
echo "=== 3. Locking MongoDB to localhost only ==="
CONF=/etc/mongod.conf
if grep -q "^  bindIp: 127.0.0.1" "$CONF" 2>/dev/null; then
  echo "Already bound to 127.0.0.1."
else
  sed -i "s/^  bindIp:.*/  bindIp: 127.0.0.1/" "$CONF" || true
  echo "Set bindIp to 127.0.0.1 in $CONF"
fi

echo ""
echo "=== 4. Creating database + application user ==="
GENERATED_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
read -rp "Password for MongoDB user '${DB_USER}' [press Enter to auto-generate]: " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-$GENERATED_PASSWORD}

mongosh --quiet <<EOF
use ${DB_NAME}
db.createUser({
  user: "${DB_USER}",
  pwd: "${DB_PASSWORD}",
  roles: [ { role: "readWrite", db: "${DB_NAME}" } ]
})
EOF

echo ""
echo "=== 5. Enabling authentication ==="
if grep -q "^security:" "$CONF" 2>/dev/null; then
  echo "security section already present in $CONF — verify authorization: enabled manually if this is a re-run."
else
  cat >> "$CONF" <<EOF

security:
  authorization: enabled
EOF
  echo "Added security.authorization: enabled to $CONF"
fi

echo ""
echo "=== 6. Restarting MongoDB with auth enabled ==="
systemctl restart mongod
sleep 2
systemctl status mongod --no-pager || true

echo ""
echo "=================================================================="
echo " MongoDB is installed, running as a systemd service, bound to"
echo " 127.0.0.1 only, and authentication is enabled."
echo ""
echo " Add this to your .env file:"
echo ""
echo " MONGODB_URI=mongodb://${DB_USER}:${DB_PASSWORD}@127.0.0.1:27017/${DB_NAME}?authSource=${DB_NAME}"
echo ""
echo " Verify anytime with: systemctl status mongod"
echo "=================================================================="
