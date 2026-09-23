#!/usr/bin/env bash
#
# backup.sh — dumps the anime_toy_universe MongoDB database with mongodump,
# storing dated archives outside the live database directory and outside
# the Next.js app's public directory, then prunes old backups.
#
# Set up as a daily cron job (see README "Backups" for the crontab line).
#
set -euo pipefail

DB_NAME="anime_toy_universe"
DB_USER="anime_app"
# Read the same password you put in .env — do not hardcode it here.
# This script expects MONGODB_URI to be exported, or reads it from the
# app's .env file directly:
ENV_FILE="/var/www/anime-toy-universe/app/.env"

BACKUP_ROOT="/var/backups/anime-toy-universe"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
DEST="${BACKUP_ROOT}/${TIMESTAMP}"

mkdir -p "$BACKUP_ROOT"

if [[ -z "${MONGODB_URI:-}" ]]; then
  if [[ -f "$ENV_FILE" ]]; then
    MONGODB_URI=$(grep -E "^MONGODB_URI=" "$ENV_FILE" | head -n1 | cut -d= -f2-)
  fi
fi

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI not found. Set it in the environment or in $ENV_FILE." >&2
  exit 1
fi

echo "Backing up ${DB_NAME} to ${DEST} ..."
mongodump --uri="$MONGODB_URI" --out="$DEST"

echo "Compressing..."
tar -czf "${DEST}.tar.gz" -C "$BACKUP_ROOT" "$(basename "$DEST")"
rm -rf "$DEST"

echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_ROOT" -name "*.tar.gz" -type f -mtime "+${RETENTION_DAYS}" -print -delete

echo "Backup complete: ${DEST}.tar.gz"
ls -lh "$BACKUP_ROOT" | tail -n +2
