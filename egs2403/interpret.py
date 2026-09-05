#!/usr/bin/env python3
"""
EGS 2403 — reference interpretation.

This stands in for the part of accuracy assessment nobody can do for you:
going and looking. You give it sample locations; it returns what is actually on
the ground at each one. It is the only source of reference data for this
assessment, and the map cannot be its own reference.

First time, save your server and token so you need not retype them:

    python interpret.py --server https://SERVER/interpret --token XXXX-XXXX-XXXX --save

Then, for each sample:

    python interpret.py --points my_sample.csv --out my_sample_interpreted.csv
    python interpret.py --budget                       # what you have left

Your input CSV needs a location column pair, in any ONE of these forms:

    col,row     pixel indices into landcover_map_2025.tif
    x,y         easting/northing in EPSG:32737 (metres)
    lon,lat     degrees, EPSG:4326  (needs pyproj, which you already have)

Every other column you have — map_class, stratum, id — is passed through
untouched, which is what you need for building the confusion matrix.

The rules are the rules of real reference data
----------------------------------------------
  * Your token identifies you. Do not share it: every request is recorded
    against it, on the server, where neither you nor anyone else can edit it.
  * 800 points per request, 2000 in total. Interpretation is expensive. If you
    are near the ceiling your sample is too big — go back to the sample-size
    formula in week 6 and justify a number before collecting it.
  * Design your sample first, then interpret it once. Drawing sample after
    sample until the accuracy looks better is fabrication, and the pattern is
    plainly visible in the log.
  * Interpret without looking at what the map said for that point. Nothing here
    stops you. Agreement bias is real, it is large, and it cannot be undone
    afterwards.

For the inter-interpreter agreement exercise, have your classmate interpret
your points with THEIR token. Two people really interpreting the same points is
the actual measurement; it costs each of you those points from your budget.
"""
import argparse, csv, json, pathlib, sys, urllib.error, urllib.parse
import urllib.request

CONFIG = pathlib.Path.home() / ".egs2403.json"
TIMEOUT = 60


def load_config():
    if CONFIG.exists():
        try:
            return json.loads(CONFIG.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def call(url, payload=None, timeout=TIMEOUT):
    req = urllib.request.Request(
        url, headers={"Content-Type": "application/json"},
        data=json.dumps(payload).encode() if payload is not None else None,
        method="POST" if payload is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read()).get("error", str(e))
        except Exception:
            msg = str(e)
        sys.exit(f"server said: {msg}")
    except urllib.error.URLError as e:
        sys.exit(f"could not reach the interpretation server at {url}\n"
                 f"  {e.reason}\n"
                 f"Check your connection, and check the address with your "
                 f"lecturer if it persists.")


def locate(rows):
    """Turn whatever columns they used into what the server accepts."""
    k = {c.strip().lower(): c for c in rows[0]}
    if "col" in k and "row" in k:
        return [{"col": int(float(r[k["col"]])), "row": int(float(r[k["row"]]))}
                for r in rows]
    if "x" in k and "y" in k:
        return [{"x": float(r[k["x"]]), "y": float(r[k["y"]])} for r in rows]
    if "lon" in k and "lat" in k:
        try:
            from pyproj import Transformer
        except ImportError:
            sys.exit("your file uses lon/lat, which needs pyproj to convert.\n"
                     "Either activate the environment that has it, or supply "
                     "x/y in EPSG:32737 instead.")
        t = Transformer.from_crs("EPSG:4326", "EPSG:32737", always_xy=True)
        out = []
        for r in rows:
            x, y = t.transform(float(r[k["lon"]]), float(r[k["lat"]]))
            out.append({"x": x, "y": y})
        return out
    sys.exit("your CSV needs col/row, x/y or lon/lat columns — found: "
             + ", ".join(rows[0]))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--points", help="CSV of sample locations")
    ap.add_argument("--out", help="where to write the interpreted result")
    ap.add_argument("--server", help="interpretation server URL")
    ap.add_argument("--token", help="the token issued to you")
    ap.add_argument("--save", action="store_true",
                    help="remember --server and --token in ~/.egs2403.json")
    ap.add_argument("--budget", action="store_true",
                    help="report what you have used and have left")
    a = ap.parse_args()

    cfg = load_config()
    server = (a.server or cfg.get("server") or "").rstrip("/")
    token = a.token or cfg.get("token")
    if not server or not token:
        sys.exit("no server or token configured. Ask your lecturer for the "
                 "address and your token, then run:\n"
                 "  python interpret.py --server URL --token TOKEN --save")
    base = server[:-len("/interpret")] if server.endswith("/interpret") \
        else server

    if a.save:
        CONFIG.write_text(json.dumps({"server": base, "token": token},
                                     indent=2) + "\n")
        try:
            CONFIG.chmod(0o600)
        except OSError:
            pass
        print(f"saved to {CONFIG}")

    if a.budget or not a.points:
        b = call(f"{base}/budget?token={urllib.parse.quote(token)}")
        print(f"{b['student_id']}: {b['used']} of {b['limit']} points used, "
              f"{b['remaining']} remaining")
        if not a.points:
            if not a.save:
                print("\ngive --points and --out to interpret a sample")
            return

    if not a.out:
        sys.exit("--out is required with --points")

    rows = list(csv.DictReader(open(a.points)))
    if not rows:
        sys.exit("no rows in that file")
    points = locate(rows)

    resp = call(f"{base}/interpret", {"token": token, "points": points})
    results = resp["results"]

    with open(a.out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]) + ["col", "row",
                                                          "reference_class"])
        w.writeheader()
        for src, res in zip(rows, results):
            w.writerow({**src, "col": res["col"], "row": res["row"],
                        "reference_class": res["reference_class"]})

    print(f"interpreted {len(results)} points -> {a.out}")
    if resp.get("outside_study_area"):
        print(f"  {resp['outside_study_area']} fell outside the study area and "
              f"were not interpreted — check your sampling frame")
    print(f"  {resp['used']} of {resp['limit']} used, {resp['remaining']} "
          f"remaining")


if __name__ == "__main__":
    main()
