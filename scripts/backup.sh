#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GESTIO_DB_KEY:-}" ] && [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

GESTIO_DB_PATH="${GESTIO_DB_PATH:-data/gestio.db}"
GESTIO_BACKUP_DIR="${GESTIO_BACKUP_DIR:-backups}"
SQLITE3_BIN="${SQLITE3_BIN:-sqlcipher}"

if [ -z "${GESTIO_DB_KEY:-}" ]; then
  echo "GESTIO_DB_KEY is not set; backup skipped."
  exit 0
fi

if ! command -v "$SQLITE3_BIN" >/dev/null; then
  echo "$SQLITE3_BIN is required for encrypted sqlite3 .backup. Install SQLCipher CLI or set SQLITE3_BIN." >&2
  exit 127
fi

mkdir -p "$GESTIO_BACKUP_DIR"
backup="$GESTIO_BACKUP_DIR/gestio-$(date -u +%Y-%m-%dT%H-%M-%SZ).db"
key_sql=${GESTIO_DB_KEY//\'/\'\'}
backup_sql=${backup//\'/\'\'}

"$SQLITE3_BIN" "$GESTIO_DB_PATH" <<SQL
PRAGMA cipher='sqlcipher';
PRAGMA legacy=4;
PRAGMA key='$key_sql';
ATTACH DATABASE '$backup_sql' AS backup KEY '$key_sql';
SELECT sqlcipher_export('backup');
DETACH DATABASE backup;
SQL

find "$GESTIO_BACKUP_DIR" -name 'gestio-*.db' -type f -mtime +30 -delete
