#!/usr/bin/env bash
set -euo pipefail

repo_dir=$(pwd)
line="17 3 * * * cd '$repo_dir' && scripts/backup.sh # gestio daily backup"
(crontab -l 2>/dev/null | grep -v 'gestio daily backup'; printf '%s\n' "$line") | crontab -
