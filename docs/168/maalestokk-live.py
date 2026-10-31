#!/usr/bin/env python3
"""168 — sjekker mot EKTE karttjeneste at BILDET dekker det geo påstår, for alle tre utsnitt.

Det den klientsidige testen (_geoScaleRegressionTest) ikke kan se. To uavhengige sjekker:
  1. Samme sted hentes som 80, 120 og 200 m. Det største utsnittet beskjæres sentrert til det minste sin
     andel (80/200 osv.) og søkes over skalaer — beste skala må bli nøyaktig forventet andel (forhold 1,000).
     Er bildet for et utsnitt tegnet i feil målestokk, forskyves forholdet.
  2. Matrikkelens bygningsomriss (/roof/locate, EPSG:25833) tegnes inn i bildet med geo-feltene og skal
     ligge på bygningene (se bildet ov*.png som skrives ut). Det er den ABSOLUTTE sjekken.

Bruk:  python3 -m venv v && v/bin/pip install pillow numpy
       ROOF_KEY=<ROOF_APP_KEY> v/bin/python maalestokk-live.py [lat lon]
"""
import base64, io, json, os, sys, urllib.request
import numpy as np
from PIL import Image, ImageDraw

BASE = os.environ.get("ROOF_URL", "https://varmeplan-roof.fly.dev")
KEY = os.environ["ROOF_KEY"]
lat, lon = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (60.19105688591398, 10.193283088835917)

def call(path, body=None):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body else None,
                                 headers={"X-Varmeplan-Key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=150) as r:
        return json.load(r)

loc = call("/roof/locate", {"lat": lat, "lon": lon})
E, N = loc["query"]["point"]["east"], loc["query"]["point"]["north"]
imgs = {}
for z in (80, 120, 200):
    d = call(f"/roof/background.json?east={E}&north={N}&size_m={z}&px=1600&layers=topo")
    g = d["geo"]
    assert abs(g["m_per_px"] * g["px"] - z) < 1e-6 and g["width_m"] == z, g
    imgs[z] = (g, Image.open(io.BytesIO(base64.b64decode(d["png_base64"]))).convert("RGB"))

def ncc(a, b):
    a = np.asarray(a, float); b = np.asarray(b, float); a -= a.mean(); b -= b.mean()
    return (a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum())

bad = False
for small, big in ((80, 200), (120, 200), (80, 120)):
    ref = imgs[small][1].convert("L").resize((400, 400), Image.LANCZOS); base = imgs[big][1].convert("L")
    exp = small / big; best = (-1, 0)
    for f in np.arange(exp * 0.5, exp * 1.6, exp * 0.01):
        s = base.width * f; o = (base.width - s) / 2
        c = base.crop((round(o), round(o), round(o + s), round(o + s))).resize((400, 400), Image.LANCZOS)
        n = ncc(c, ref)
        if n > best[0]: best = (n, f)
    ratio = best[1] / exp; ok = abs(ratio - 1) < 0.02 and best[0] > 0.9; bad |= not ok
    print(f"{small:>3} m i {big:>3} m: forventet andel {exp:.4f}, beste {best[1]:.4f}, forhold {ratio:.3f}, ncc {best[0]:.3f}  {'OK' if ok else 'FEIL'}")

for z, (g, im) in imgs.items():
    im = im.copy(); dr = ImageDraw.Draw(im)
    for c in loc["candidates"]:
        fp = c.get("footprint")
        if fp:
            dr.polygon([((e - g["east0"]) / g["m_per_px"], (g["north0"] + g["height_m"] - n) / g["m_per_px"]) for e, n in fp["polygon"]], outline=(255, 0, 0))
    im.crop((500, 500, 1100, 1100)).save(f"ov{z}.png")
print("omriss-overlegg skrevet til ov80.png/ov120.png/ov200.png — rødt omriss skal ligge på bygningene")
sys.exit(1 if bad else 0)
