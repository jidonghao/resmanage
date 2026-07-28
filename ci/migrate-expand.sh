#!/bin/sh
set -eu

# The fixture has no database objects. Keeping this hook explicit proves that
# the release pipeline executes an expand-only compatibility gate before Helm.
test "${RELEASE_KIND:-DEPLOY}" = DEPLOY
printf 'M6 fixture schema compatibility: no-op expand gate PASS\n'
if [ "${VERSION:-}" = "2026.07.28-rel014" ]; then
  printf 'REL-004 controlled fault-injection window: 45 seconds\n'
  sleep 45
fi
