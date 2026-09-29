// Joins the static catalog (data/catalog.js: host specs, regions, storage documentation) with the
// vendor prices fetched by tools/fetch_prices.py (data/prices.js) into the objects the page uses:
//   PRICING          providers, shapes and regions
//   Calc             listShapes() -> per-region hourly rates by term
//   STORAGE          storage options and tiers
//   STORAGE_REGIONS  per region: which storage options exist there and their prices
(function (root) {
  const C = root.CATALOG, X = root.PRICES;
  const KEYS = ["od", "1yr", "3yr"];
  const TERMS = {
    "3yr": { label: "3-year commitment, monthly payments", short: "3-YEAR COMMITMENT", months: 36 },
    "1yr": { label: "1-year commitment, monthly payments", short: "1-YEAR COMMITMENT", months: 12 },
    od: { label: "On-demand (pay as you go)", short: "ON-DEMAND", months: 36 }
  };

  const providers = {};
  for (const [p, c] of Object.entries(C.providers)) {
    providers[p] = { ...c, regions: X.hosts[p].global ? C.ocvsRegions : X.hosts[p].regions };
  }

  function listShapes(data, p, region, opts = {}) {
    const h = X.hosts[p];
    return providers[p].shapes.map(s => {
      let arr = null;
      if (h.global) arr = h.rates[s.id];
      else if (p === "evs") {
        const e = (h.rates[region] || {})[s.id], fee = (h.fee || {})[region];
        if (e) { const b = opts.evsBasis === "host" && e.host ? "host" : "instance"; arr = e[b].map(v => v == null ? null : v + fee); }
      } else arr = (h.rates[region] || {})[s.id];
      const rates = {};
      (arr || []).forEach((v, i) => { if (typeof v === "number") rates[KEYS[i]] = v; });
      return { ...s, label: s.label || s.id, rates };
    });
  }

  const platforms = {};
  for (const p of Object.keys(C.providers)) {
    const st = X.storage[p] || {};
    platforms[p] = providers[p].regions.map(r => ({ id: r.id, name: r.name, avail: (X.hosts[p].global ? st : st[r.id]) || {} }));
  }

  root.PRICING = { asOf: X.asOf, providers };
  root.Calc = { TERMS, listShapes };
  root.STORAGE = { asOf: X.asOf, options: C.storageOptions };
  root.STORAGE_REGIONS = { platforms };
})(window);
