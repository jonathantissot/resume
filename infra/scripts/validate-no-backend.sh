#!/usr/bin/env bash
# infra/scripts/validate-no-backend.sh
# Run terraform validate on every module without requiring AWS credentials
# or an existing S3 backend. Used in CI for PR validation gating.
#
# Usage: bash infra/scripts/validate-no-backend.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODULES_DIR="$REPO_ROOT/terraform-modules"

PASS=0
FAIL=0
ERRORS=()

for mod_dir in "$MODULES_DIR"/*/; do
  mod=$(basename "$mod_dir")
  echo -n "Validating terraform-modules/$mod ... "

  # Init with no backend (download providers, skip S3)
  if ! terraform -chdir="$mod_dir" init -backend=false -input=false -no-color >/dev/null 2>&1; then
    echo "FAIL (init)"
    ERRORS+=("$mod: init failed")
    FAIL=$((FAIL+1))
    continue
  fi

  out=$(terraform -chdir="$mod_dir" validate -no-color 2>&1)
  if echo "$out" | grep -q "Success"; then
    echo "PASS"
    PASS=$((PASS+1))
  else
    echo "FAIL (validate)"
    echo "$out"
    ERRORS+=("$mod: validate failed")
    FAIL=$((FAIL+1))
  fi
done

echo ""
echo "===== Results: $PASS passed, $FAIL failed ====="

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Failures:"
  for e in "${ERRORS[@]}"; do
    echo "  - $e"
  done
  exit 1
fi

echo "All modules valid."
