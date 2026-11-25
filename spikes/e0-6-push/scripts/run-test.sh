#!/usr/bin/env bash
# Test obciążeniowy: ./scripts/run-test.sh <batch> [n]
# Uruchamia kampanię do fikcyjnych subskrypcji, zbiera `wrangler tail` (CPU/wynik) i raport dostarczeń.
set -euo pipefail
cd "$(dirname "$0")/.."
B=${1:-10}; N=${2:-1700}
BASE=https://pl-push-spike.parafialubiana.workers.dev
KEY=$(cat .secrets/spike-key)
export CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=' ../../.env | cut -d= -f2- | tr -d '\r')
mkdir -p .secrets/runs
TAIL=.secrets/runs/tail-b$B-$(date +%H%M%S).jsonl

curl -s -X POST -H "x-spike-key: $KEY" "$BASE/api/reset-mock" >/dev/null
npx wrangler tail pl-push-spike --format json > "$TAIL" 2>/dev/null &
TP=$!
sleep 12
START=$(date +%s)
RUN=$(curl -s -X POST -H "x-spike-key: $KEY" "$BASE/api/run?batch=$B&n=$N")
C=$(echo "$RUN" | node -p "JSON.parse(require('fs').readFileSync(0)).campaign")
echo "start: $RUN" | tr -d '\n '; echo

# Czekaj, aż wszystkie subskrypcje mają status końcowy (sent/gone/failed), maks. 8 min.
for i in $(seq 1 48); do
  sleep 10
  DONE=$(curl -s -H "x-spike-key: $KEY" "$BASE/api/report?campaign=$C" | node -p "JSON.parse(require('fs').readFileSync(0)).rows.filter(r=>r.status!=='retry').reduce((n,r)=>n+r.n,0)")
  [ "$DONE" -ge "$N" ] && break
done
END=$(date +%s)
sleep 15
kill $TP 2>/dev/null || true
echo "czas do zakończenia: $((END-START)) s"
curl -s -H "x-spike-key: $KEY" "$BASE/api/report?campaign=$C" | node -e "
const r=JSON.parse(require('fs').readFileSync(0));const s={};for(const x of r.rows){s[x.status+(x.attempt>1?'(próba '+x.attempt+')':'')]=x.n}
console.log('dostarczenia:',JSON.stringify(s))"
node scripts/tail-stats.mjs "$TAIL"
