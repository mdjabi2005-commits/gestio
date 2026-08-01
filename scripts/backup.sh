#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GESTIO_DB_KEY:-}" ] && [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${GESTIO_DB_KEY:?GESTIO_DB_KEY is required}"
GESTIO_DB_PATH="${GESTIO_DB_PATH:-data/gestio.db}"
GESTIO_BACKUP_DIR="${GESTIO_BACKUP_DIR:-backups}"

node scripts/backup.mjs
