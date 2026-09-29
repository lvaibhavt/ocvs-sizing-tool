#!/usr/bin/env python3
"""Fetch host and storage list prices straight from each cloud vendor and write data/prices.js.

Sources (all public, no credentials needed):
  OCVS  Oracle OCVS pricing reference (hosts, table below); Oracle Cloud price list API for storage
        https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/
  AVS   Azure Retail Prices API       https://prices.azure.com/api/retail/prices
  GCVE  Google Cloud pricing pages    https://cloud.google.com/vmware-engine/pricing
                                      https://cloud.google.com/netapp/volumes/pricing
                                      https://cloud.google.com/filestore/pricing
  EVS   AWS Price List (bulk offers)  https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/{AmazonEVS,AmazonFSx}/
        AWS pricing-page data         https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/ (EC2 on-demand,
                                      EC2 Instance Savings Plans, Dedicated Host reservations)

Rates are USD per node-hour as [on-demand, 1-year, 3-year] (commitments = monthly payments / no upfront).
Storage prices are per GB(GiB)-month, or per GiB-hour where the vendor bills hourly.

OCVS host prices come from Oracle's OCVS pricing reference table (OCVS_REFERENCE below).

Usage:  python tools/fetch_prices.py        (writes data/prices.js; takes a few minutes)
"""
import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "prices.js")
UA = {"User-Agent": "Mozilla/5.0 (ocvs-sizing-tool price refresh)", "Accept-Encoding": "identity"}


def get(url, timeout=120):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
    if data[:2] == b"\x1f\x8b":
        import gzip
        data = gzip.decompress(data)
    return data.decode("utf-8", "ignore")


def get_json(url, timeout=120):
    return json.loads(get(url, timeout))


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# ---------------------------------------------------------------- OCVS (Oracle)
# OCVS host prices are NOT taken from the public price-list API: its per-OCPU "Commit" SKUs don't match
# Oracle's OCVS pricing reference. Use the reference table below (USD per node per month at 744 hours,
# [on-demand, 1-year, 3-year]). Update it when Oracle publishes new OCVS pricing.
OCVS_REFERENCE = {
    "BM.DenseIO2.52":      [4932.72, 3206.64, 2715.60],  # 35% / 45% discount
    "BM.DenseIO.E4.128":   [7142.40, 4642.56, 3571.20],  # 35% / 50%
    "BM.Standard3.64":     [3050.40, 2135.28, 1830.24],  # 30% / 40%
    "BM.Standard2.52":     [2470.08, 1607.04, 1354.08],  # 35% / 45%
    "BM.Standard.E4.128":  [4664.88, 3035.52, 2566.80],  # 35% / 45%
    "BM.GPU.A10.4":        [5952.00, 3868.80, 3273.60],  # 35% / 45%
    "BM.Standard.E5.192":  [7715.28, 5014.56, 3853.92],  # 35% / 50%
    "BM.DenseIO.E5.128":   [8861.04, 5758.56, 4426.80],  # 35% / 50%
    "BM.Optimized3.36":    [2016.24, 1814.62, 1713.80],  # 10% / 15%
}


def fetch_ocvs():
    items = get_json("https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD")["items"]
    price = {}
    for i in items:
        n = re.sub(r"\s+", " ", i["displayName"].replace("–", "-"))
        v = i["currencyCodeLocalizations"][0]["prices"][0]["value"]
        price[n.lower()] = (v, i["partNumber"])

    # Host prices: Oracle's OCVS pricing reference (monthly per node at 744 hours), converted to hourly.
    rates = {sid: [round(m / 744, 6) for m in months] for sid, months in OCVS_REFERENCE.items()}
    # storage (global)
    blk = price["storage - block volume - storage"][0]
    vpu = price["storage - block volume - performance units"][0]
    fss = price["file storage - storage"][0]
    storage = {
        "oci-block": {str(v): round(blk + v * vpu, 6) for v in (0, 10, 20, 30, 40, 50)},
        "oci-fss": {"std": fss, "hpmt20": fss, "hpmt40": fss, "hpmt80": fss},
    }
    log("OCVS:", len(rates), "shapes; Block Volume", storage["oci-block"])
    return {"global": True, "rates": rates}, storage


# ---------------------------------------------------------------- AVS (Azure)
def az_query(flt):
    url = "https://prices.azure.com/api/retail/prices?" + urllib.parse.urlencode({"$filter": flt})
    out = []
    while url:
        d = get_json(url)
        out += d["Items"]
        url = d.get("NextPageLink")
    return out


def fetch_avs():
    items = az_query("contains(productName,'Azure VMware Solution') and contains(skuName,'VCF BYOL')")
    names, rates = {}, {}
    for i in items:
        if "Trial" in i["skuName"] or i["unitOfMeasure"] != "1 Hour":
            continue
        reg, shape = i["armRegionName"], i["skuName"].replace(" VCF BYOL", "")
        names[reg] = i["location"]
        r = rates.setdefault(reg, {}).setdefault(shape, [None, None, None])
        if i["type"] == "Consumption":
            r[0] = i["retailPrice"]
        elif i["type"] == "Reservation":
            # reservation prices are the total for the term
            if i["reservationTerm"] == "1 Year":
                r[1] = round(i["retailPrice"] / 8760, 6)
            elif i["reservationTerm"] == "3 Years":
                r[2] = round(i["retailPrice"] / 26280, 6)
    regions = sorted(({"id": k, "name": f"{v} ({k})"} for k, v in names.items()), key=lambda r: r["name"])
    log("AVS:", len(regions), "regions")

    storage = {}
    for i in az_query("serviceName eq 'Azure NetApp Files' and type eq 'Consumption'"):
        tier = {"Standard Capacity": "standard", "Premium Capacity": "premium", "Ultra Capacity": "ultra",
                "Flexible Service Level Capacity": "flexible"}.get(i["meterName"])
        if tier and i["armRegionName"] in names:
            storage.setdefault(i["armRegionName"], {}).setdefault("anf", {})[tier] = i["retailPrice"]  # per GiB-hour
    for i in az_query("contains(productName,'Elastic SAN') and type eq 'Consumption'"):
        tier = {"Premium LRS Provisioned Base Unit": "lrs", "Premium LRS Provisioned Capacity Unit": "lrs-add",
                "Premium ZRS Provisioned Base Unit": "zrs", "Premium ZRS Provisioned Capacity Unit": "zrs-add"}.get(i["meterName"])
        if tier and i["armRegionName"] in names:
            storage.setdefault(i["armRegionName"], {}).setdefault("elastic-san", {})[tier] = i["retailPrice"]  # per GiB-month
    return {"regions": regions, "rates": rates}, storage


# ---------------------------------------------------------------- GCVE (Google)
# Google pricing pages embed every region's table as data. Each table is followed by its region label,
# e.g.  ...]]]],"Frankfurt (europe-west3)",[3]  where [3] = hourly prices and [2] = monthly.
BS = "\\"
P_OPEN, P_CLOSE = BS + "u003cp" + BS + "u003e", BS + "u003c/p" + BS + "u003e"
G_END = re.compile(r'\]\]\]\],"([^"]{2,60}) \(([a-z]+-[a-z]+[0-9]+)\)",\[(\d)\]')


def google_tables(html):
    """[(region id, region label, unit flag, table body)] for every embedded table."""
    out, prev = [], 0
    for m in G_END.finditer(html):
        out.append((m.group(2), f"{m.group(1)} ({m.group(2)})", m.group(3), html[prev:m.start()]))
        prev = m.end()
    return out


def google_rows(body):
    """Row label -> list of rows, each a list of (price, unit)."""
    res = {}
    for r in re.split(r"\]\]\],\[\[\[", body):
        i = r.find(P_OPEN)
        vals = re.findall(r'"\$([0-9.,]+) / 1 ([a-z ]+)"', r)
        if i < 0 or not vals:
            continue
        lab = r[i + len(P_OPEN):r.find(P_CLOSE, i)].replace(BS + "t", "").strip()
        if "$" in lab or len(lab) > 80:
            continue
        res.setdefault(lab, []).append([(float(v.replace(",", "")), u) for v, u in vals])
    return res


def fetch_gcve():
    rates, so, names = {}, {}, {}
    for reg, label, unit, body in google_tables(get("https://cloud.google.com/vmware-engine/pricing")):
        if unit != "3":
            continue
        for node, rows in google_rows(body).items():
            if not re.fullmatch(r"ve[12]-[a-z]+-(?:[0-9]+|so)", node):
                continue
            v = [p for p, u in rows[0] if u == "hour"]
            if len(v) < 5:
                continue
            names[reg] = label
            triple = [v[0], v[1], v[3]]  # on-demand, 1-yr monthly, 3-yr monthly (skip the upfront columns)
            (so if node.endswith("-so") else rates).setdefault(reg, {})[node] = triple
    regions = sorted(({"id": r, "name": names[r]} for r in rates), key=lambda r: r["name"])
    log("GCVE:", len(regions), "regions")
    storage = {r: {"gcve-so": v} for r, v in so.items()}

    # NetApp Volumes: Standard / Premium / Extreme list price per GiB-hour
    for reg, label, unit, body in google_tables(get("https://cloud.google.com/netapp/volumes/pricing")):
        rows = google_rows(body)
        if unit != "3" or not all(k in rows for k in ("Standard", "Premium", "Extreme")):
            continue
        tiers = {k.lower(): rows[k][0][0][0] for k in ("Standard", "Premium", "Extreme") if rows[k][0][0][1] == "gibibyte hour"}
        if len(tiers) == 3:
            storage.setdefault(reg, {})["gcnv"] = tiers
    # Filestore: Zonal / Regional, custom performance off (a single per-GiB-hour price)
    for reg, label, unit, body in google_tables(get("https://cloud.google.com/filestore/pricing")):
        rows = google_rows(body)
        if unit != "3":
            continue
        tiers = {}
        for k in ("Zonal", "Regional"):
            for row in rows.get(k, []):
                if len(row) == 1 and row[0][1] == "gibibyte hour":
                    tiers[k.lower()] = row[0][0]
                    break
        if len(tiers) == 2:
            storage.setdefault(reg, {})["filestore"] = tiers
    log("GCVE storage:", {r: sorted(v) for r, v in storage.items() if r == "europe-west3"})
    return {"regions": regions, "rates": rates}, storage


# ---------------------------------------------------------------- EVS (AWS)
AWS_SHAPES = {"i4i.metal": "i4i", "i7i.metal-24xl": "i7i"}
MUM = "https://b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps"


def q(s):
    return urllib.parse.quote(s)


def fetch_evs():
    idx = get_json("https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEVS/current/region_index.json")["regions"]
    regions, fee, rates, storage = [], {}, {}, {}
    for code, info in sorted(idx.items()):
        offer = get_json("https://pricing.us-east-1.amazonaws.com" + info["currentVersionUrl"])
        # the EVS offer says "Europe (Zurich)"; the EC2 pricing-page data uses "EU (Zurich)"
        loc = next(iter(offer["products"].values()))["attributes"]["location"].replace("Europe (", "EU (")
        f = None
        for sku, terms in offer["terms"]["OnDemand"].items():
            for o in terms.values():
                for pd in o["priceDimensions"].values():
                    f = max(f or 0, float(pd["pricePerUnit"]["USD"]))
        regions.append({"id": code, "name": f"{loc} {code}"})
        fee[code] = f
        r = rates.setdefault(code, {})
        try:
            od = get_json(f"{MUM}/ec2/USD/current/ec2-ondemand-without-sec-sel/{q(loc)}/Linux/index.json")["regions"][loc]
        except Exception:
            od = {}
        for shape, fam in AWS_SHAPES.items():
            inst = [None, None, None]
            for v in od.values():
                if v.get("Instance Type") == shape:
                    inst[0] = float(v["price"])
            for i, term in ((1, "1 year"), (2, "3 year")):
                try:
                    sp = get_json(f"{MUM}/computesavingsplan/USD/current/instance-savings-plan-ec2/{q(term)}/No%20Upfront/{fam}/{q(loc)}/Linux/Shared/index.json")
                    for v in next(iter(sp["regions"].values())).values():
                        if v.get("ec2:InstanceType") == shape:
                            inst[i] = float(v["price"])
                except Exception:
                    pass
            host = [None, None, None]
            if shape == "i4i.metal":  # i7i.metal-24xl has no per-instance Dedicated Host price
                for i, term in ((1, "1 year"), (2, "3 year")):
                    try:
                        dh = get_json(f"{MUM}/ec2/USD/current/dedicatedhost-reservedinstance-virtual/{q(loc)}/{q(term)}/No%20Upfront/index.json")
                        for k, v in next(iter(dh["regions"].values())).items():
                            if k.startswith(fam + " "):
                                host[i] = float(v["price"])
                                host[0] = float(v["OnDemand:PricePerUnit"])
                    except Exception:
                        pass
            if any(inst):
                r[shape] = {"instance": inst, **({"host": host} if any(host) else {})}
        # FSx for ONTAP
        try:
            fsx = get_json(f"https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonFSx/current/{code}/index.json")
            tiers = {}
            for sku, p in fsx["products"].items():
                a = p["attributes"]
                if a.get("fileSystemType") != "ONTAP":
                    continue
                key = {("Single-AZ_2N", "SSD"): "single", ("Multi-AZ", "SSD"): "multi",
                       ("Single-AZ_2N", "Capacity pool - Standard"): "pool"}.get((a.get("deploymentOption"), a.get("storageType")))
                if not key:
                    continue
                for o in fsx["terms"]["OnDemand"].get(sku, {}).values():
                    for pd in o["priceDimensions"].values():
                        tiers[key] = float(pd["pricePerUnit"]["USD"])
            if tiers:
                storage[code] = {"fsx-block": tiers, "fsx-file": dict(tiers)}
        except Exception as e:
            log("FSx", code, e)
        log("EVS", code, fee[code], r)
    return {"regions": regions, "fee": fee, "rates": rates}, storage


def main():
    today = datetime.date.today().strftime("%d %b %Y").lstrip("0")
    hosts, storage = {}, {}
    hosts["ocvs"], s = fetch_ocvs(); storage["ocvs"] = s
    hosts["avs"], storage["avs"] = fetch_avs()
    hosts["gcve"], storage["gcve"] = fetch_gcve()
    hosts["evs"], storage["evs"] = fetch_evs()
    data = {"asOf": today, "hosts": hosts, "storage": storage}
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// Generated by tools/fetch_prices.py from each vendor's own price sources. Do not edit by hand.\n")
        f.write("window.PRICES = " + json.dumps(data, separators=(",", ":")) + ";\n")
    log("wrote", OUT)


if __name__ == "__main__":
    main()
