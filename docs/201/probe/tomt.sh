#!/bin/bash
# 201: finn et punkt uten bygning — kaller /roof/locate og sjekker om punktet ligger i et omriss.
K=4793530c986eade76b152a1ad276ca83f5986349e052d126
for p in "$@"; do
  set -- $p
  curl -s -m 60 -X POST https://varmeplan-roof.fly.dev/roof/locate -H 'Content-Type: application/json' -H "X-Varmeplan-Key: $K" \
    -d "{\"east\":$1,\"north\":$2}" -o /tmp/l201.json -w "$1 $2 → %{http_code} %{time_total}s  "
  python3 - "$1" "$2" <<'PY'
import json,sys
e,n=float(sys.argv[1]),float(sys.argv[2]); d=json.load(open('/tmp/l201.json'))
def inside(poly):
  c=False;j=len(poly)-1
  for i in range(len(poly)):
    xi,yi=poly[i];xj,yj=poly[j]
    if (yi>n)!=(yj>n) and e<(xj-xi)*(n-yi)/(yj-yi)+xi: c=not c
    j=i
  return c
cs=d.get('candidates',[])
print(len(cs),'kandidater,',sum(1 for c in cs if c['footprint']),'med omriss, inne i:',[c['bygningsnr'] for c in cs if c['footprint'] and inside(c['footprint']['polygon'])])
PY
done
