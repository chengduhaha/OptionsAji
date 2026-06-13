#!/usr/bin/env bash
# Smoke-test cross-market + IBKR on the FastAPI backend (direct curl).
# Usage: OPTIONS_AJI_BACKEND_URL=http://127.0.0.1:8787 ./scripts/smoke-cross-market-backend.sh
set -euo pipefail

BASE="${OPTIONS_AJI_BACKEND_URL:-http://127.0.0.1:8787}"
BASE="${BASE%/}"

echo "Backend: $BASE"

code_hot=$(curl -sS -o /tmp/cm_hot.json -w "%{http_code}" "$BASE/api/cross-market/polymarket/hot?limit=10")
echo "GET /api/cross-market/polymarket/hot -> $code_hot"

code_xpoz=$(curl -sS -o /tmp/cm_xpoz.json -w "%{http_code}" "$BASE/api/cross-market/xpoz/hot?limit=10")
echo "GET /api/cross-market/xpoz/hot -> $code_xpoz"

code_ibkr=$(curl -sS -o /tmp/cm_ibkr.json -w "%{http_code}" "$BASE/api/ibkr/health")
echo "GET /api/ibkr/health -> $code_ibkr"
if [[ "$code_ibkr" == "200" ]]; then
  python3 -c "import json;d=json.load(open('/tmp/cm_ibkr.json'));print('  ibkr_enabled=%s connected=%s'%(d.get('ibkr_enabled'),d.get('connected')))" 2>/dev/null || true
fi

# Soft expectations: Polymarket and Xpoz endpoints should return 200; Xpoz may return configured=false when no API key is set.
