// Builds the sizing & pricing slide (plus an assumptions slide) with PptxGenJS.
// Adapted from vmware-cloud-pricing-compare/js/ppt.js so both decks look the same.
(function (root) {
  const C = {
    navy: "1F2A5C", gold: "E8B73A", brown: "8A5A00", ink: "222222", body: "333333", muted: "5A6378",
    line: "D5D9E3", secBg: "F1F2F7", baseBg: "EAF1FB", green: "2E7D32", red: "B3261E",
    calloutBg: "EEF6EE", calloutLine: "C8E0C9", calloutBgNeg: "FBEEEE", calloutLineNeg: "E8C4C1", white: "FFFFFF"
  };
  const W = 16.667, H = 9.375, M = 0.6;
  const HEAD = "Georgia", BODY = "Calibri";
  const D = 0.4; // vertical space taken by the disclaimer banner

  function banner(pptx, s) {
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.34, fill: { color: "FFF4D6" }, line: { color: "E8B73A", width: 1 } });
    s.addText("INDICATIVE PRICING ONLY — not a quote and not a guarantee. Prices may change; verify current pricing with the respective cloud vendors.",
      { x: M, y: 0, w: W - 2 * M, h: 0.34, fontFace: BODY, fontSize: 12, bold: true, color: C.brown, align: "center", valign: "middle", margin: 0, isTextBox: true });
  }

  function slideMain(pptx, rep) {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    banner(pptx, s);

    s.addText("OCVS Sizing & Pricing", { x: M, y: 0.45 + D, w: 11, h: 0.8, fontFace: HEAD, fontSize: 38, bold: true, color: C.navy, margin: 0, isTextBox: true });
    s.addText(rep.subtitle, { x: M, y: 1.22 + D, w: W - 2 * M, h: 0.35, fontFace: BODY, fontSize: 15, color: C.muted, margin: 0, isTextBox: true });
    s.addShape(pptx.ShapeType.roundRect, { x: W - M - 3.8, y: 0.55 + D, w: 3.8, h: 0.6, fill: { color: C.navy }, rectRadius: 0.3, line: { color: C.navy } });
    s.addText(rep.badge, { x: W - M - 3.8, y: 0.55 + D, w: 3.8, h: 0.6, fontFace: HEAD, fontSize: 17, bold: true, color: C.gold, align: "center", valign: "middle", margin: 0, isTextBox: true });

    // ---- table ----
    const n = rep.heads.length;
    const firstW = n >= 4 ? 3.55 : 4.2;
    const colW = (W - 2 * M - firstW) / n;
    const b = { type: "solid", pt: 0.75, color: C.line };
    const border = [b, b, b, b];
    // Section rows are thinner than data rows; size data rows to fill the space
    // left between the subtitle and the callouts.
    const tableTop = 1.75 + D;
    const tableMaxH = (rep.callouts.length ? 5.75 : 6.6) - D;
    const nSec = rep.rows.filter(x => x.section).length;
    const nData = rep.rows.length - nSec + 1;
    const secH = 0.24;
    const rowH = Math.min(0.38, (tableMaxH - nSec * secH) / nData);
    const fs = rowH >= 0.34 ? 13 : rowH >= 0.3 ? 12 : 11;
    const heights = [rowH, ...rep.rows.map(x => (x.section ? secH : rowH))];
    const tableH = heights.reduce((a, b) => a + b, 0);

    const rows = [];
    rows.push([
      { text: "Pricing / configuration", options: { fill: { color: C.navy }, color: C.white, bold: true, fontFace: HEAD, fontSize: fs + 1, border } },
      ...rep.heads.map((h, i) => ({ text: h, options: { fill: { color: C.navy }, color: i === 0 ? C.gold : C.white, bold: true, fontFace: HEAD, fontSize: fs + 1, align: "center", border } }))
    ]);
    for (const row of rep.rows) {
      if (row.section) {
        rows.push([{ text: row.section, options: { colspan: n + 1, fill: { color: C.secBg }, color: C.brown, bold: true, fontFace: HEAD, fontSize: fs - 2, charSpacing: 2, border } }]);
        continue;
      }
      rows.push([
        { text: row.label, options: { bold: true, color: C.ink, fontFace: HEAD, fontSize: fs, border } },
        ...row.cells.map((c, i) => {
          const neg = String(c).startsWith("−");
          return {
            text: String(c),
            options: {
              align: "center", fontFace: HEAD, fontSize: fs, border,
              bold: i === 0 || row.savings || row.strong,
              color: row.savings && c !== "—" && c !== "n/a" ? (neg ? C.red : C.green) : i === 0 ? C.navy : C.body,
              fill: { color: i === 0 ? C.baseBg : C.white }
            }
          };
        })
      ]);
    }
    s.addTable(rows, { x: M, y: tableTop, w: W - 2 * M, colW: [firstW, ...Array(n).fill(colW)], rowH: heights, valign: "middle", margin: [0.02, 0.08, 0.02, 0.08], autoPage: false }); // inches (pptxgenjs reads values < 1 as inches)

    // ---- callouts ----
    const cy = tableTop + tableH + 0.18;
    if (rep.callouts.length) {
      const gap = 0.35, cw = (W - 2 * M - gap * (rep.callouts.length - 1)) / rep.callouts.length;
      rep.callouts.forEach((co, i) => {
        const x = M + i * (cw + gap);
        s.addShape(pptx.ShapeType.roundRect, { x, y: cy, w: cw, h: 0.95, rectRadius: 0.08, fill: { color: co.positive ? C.calloutBg : C.calloutBgNeg }, line: { color: co.positive ? C.calloutLine : C.calloutLineNeg, width: 1 } });
        s.addText([
          { text: co.title, options: { fontFace: HEAD, fontSize: rep.callouts.length > 2 ? 22 : 24, bold: true, color: co.positive ? C.green : C.red, breakLine: true } },
          { text: co.sub, options: { fontFace: BODY, fontSize: 14, color: C.body } }
        ], { x: x + 0.25, y: cy + 0.05, w: cw - 0.4, h: 0.85, valign: "middle", margin: 0, isTextBox: true });
      });
    }

    // ---- footnotes ----
    const fy = rep.callouts.length ? cy + 1.08 : cy + 0.1;
    const foot = rep.notes.map((t, i) => (i < rep.notes.length - 1 ? `${sup(i + 1)} ${t}` : t)).join("   ");
    s.addText(foot, { x: M, y: fy, w: W - 2 * M, h: Math.max(0.3, H - fy - 0.15), fontFace: BODY, fontSize: 8.5, color: "666666", valign: "top", margin: 0, isTextBox: true, fit: "shrink" });
  }

  function slideSources(pptx, rep) {
    const s = pptx.addSlide();
    s.background = { color: C.white };
    banner(pptx, s);
    s.addText("Assumptions & sources", { x: M, y: 0.45 + D, w: 11, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: C.navy, margin: 0, isTextBox: true });
    const items = rep.sources;
    const rows = items.map(([k, v]) => [
      { text: k, options: { bold: true, fontFace: HEAD, fontSize: 14, color: C.navy, fill: { color: C.secBg } } },
      { text: v, options: { fontFace: BODY, fontSize: 13, color: C.body } }
    ]);
    const b = { type: "solid", pt: 0.75, color: C.line };
    s.addTable(rows, { x: M, y: 1.6 + D, w: W - 2 * M, colW: [3.6, W - 2 * M - 3.6], border: b, valign: "middle", margin: [0.08, 0.14, 0.08, 0.14], autoPage: false });
  }

  const sup = n => String(n).replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);

  function build(rep) {
    if (!window.PptxGenJS) throw new Error("PptxGenJS failed to load (check your internet connection).");
    const pptx = new window.PptxGenJS();
    pptx.defineLayout({ name: "DECK", width: W, height: H });
    pptx.layout = "DECK";
    pptx.title = "OCVS Sizing & Pricing";
    slideMain(pptx, rep);
    slideSources(pptx, rep);
    return pptx;
  }

  async function download(rep) {
    await build(rep).writeFile({ fileName: rep.fileName });
  }

  // ---------- View 1 (cards) layout ----------
  const K = { dark: "1D1F27", text: "15181D", muted: "667080", line: "E3E6EB", soft: "F3F4F7", good: "15803D", bad: "C2410C", warn: "B45309" };
  const F = "Segoe UI";

  function slideCards(pptx, m) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };
    banner(pptx, s);
    const T = (t, o) => s.addText(t, { fontFace: F, margin: 0, isTextBox: true, ...o });
    // header band
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.34, w: W, h: 1.25, fill: { color: K.dark }, line: { color: K.dark } });
    T("Which cloud runs this VMware estate for less?", { x: M, y: 0.46, w: W - 2 * M, h: 0.6, fontSize: 28, bold: true, color: "FFFFFF" });
    T(m.subtitle, { x: M, y: 1.08, w: W - 2 * M, h: 0.35, fontSize: 12.5, color: "C9CDD6" });

    // winner
    const wy = 1.78, wh = 1.05, w = m.winner;
    s.addShape(pptx.ShapeType.roundRect, { x: M, y: wy, w: W - 2 * M, h: wh, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: K.line, width: 1 } });
    s.addShape(pptx.ShapeType.rect, { x: M, y: wy, w: 0.1, h: wh, fill: { color: w.color }, line: { color: w.color } });
    T([{ text: "LOWEST COST", options: { fontSize: 11, bold: true, color: K.muted, charSpacing: 2, breakLine: true } },
       { text: w.name, options: { fontSize: 22, bold: true, color: K.text, breakLine: true } },
       { text: w.desc, options: { fontSize: 12.5, color: K.muted } }], { x: M + 0.35, y: wy + 0.08, w: 9.5, h: wh - 0.16, valign: "middle" });
    T([{ text: w.price, options: { fontSize: 30, bold: true, color: K.text, breakLine: true } },
       { text: w.sub, options: { fontSize: 11.5, color: K.muted } }], { x: W - M - 5.2, y: wy + 0.08, w: 4.95, h: wh - 0.16, align: "right", valign: "middle" });

    // bars
    const by = 3.0, max = Math.max(...m.bars.map(b => b.value));
    m.bars.forEach((b, i) => {
      const y = by + i * 0.26, x0 = M + 1.9, bw = W - 2 * M - 1.9 - 1.9;
      T(b.name, { x: M, y, w: 1.8, h: 0.24, fontSize: 11.5, color: K.text, valign: "middle" });
      s.addShape(pptx.ShapeType.roundRect, { x: x0, y: y + 0.05, w: bw, h: 0.15, rectRadius: 0.07, fill: { color: K.soft }, line: { color: K.soft } });
      s.addShape(pptx.ShapeType.roundRect, { x: x0, y: y + 0.05, w: Math.max(0.05, bw * b.value / max), h: 0.15, rectRadius: 0.07, fill: { color: b.color }, line: { color: b.color } });
      T(b.label, { x: W - M - 1.8, y, w: 1.8, h: 0.24, fontSize: 11.5, bold: true, color: K.text, align: "right", valign: "middle" });
    });

    // cards
    const cy = by + m.bars.length * 0.26 + 0.18, ch = H - cy - 0.35, gap = 0.22, n = m.cards.length;
    const cw = (W - 2 * M - gap * (n - 1)) / n;
    m.cards.forEach((c, i) => {
      const x = M + i * (cw + gap), px = x + 0.18, iw = cw - 0.36;
      s.addShape(pptx.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: K.line, width: 1 } });
      s.addShape(pptx.ShapeType.rect, { x: x + 0.05, y: cy, w: cw - 0.1, h: 0.07, fill: { color: c.color }, line: { color: c.color } });
      T(c.name, { x: px, y: cy + 0.15, w: iw - 0.55, h: 0.3, fontSize: 11.5, bold: true, color: K.text, fit: "shrink" });
      s.addShape(pptx.ShapeType.roundRect, { x: x + cw - 0.68, y: cy + 0.16, w: 0.5, h: 0.26, rectRadius: 0.13, fill: { color: c.rank === 1 ? K.good : K.soft }, line: { color: c.rank === 1 ? K.good : K.soft } });
      T("#" + c.rank, { x: x + cw - 0.68, y: cy + 0.16, w: 0.5, h: 0.26, fontSize: 10.5, bold: true, color: c.rank === 1 ? "FFFFFF" : K.muted, align: "center", valign: "middle" });
      T([{ text: c.price, options: { fontSize: 22, bold: true, color: K.text } }, { text: " /mo", options: { fontSize: 11, color: K.muted } }], { x: px, y: cy + 0.5, w: iw, h: 0.42 });
      T(c.delta, { x: px, y: cy + 0.92, w: iw, h: 0.24, fontSize: 10.5, bold: true, color: c.deltaColor });
      s.addShape(pptx.ShapeType.roundRect, { x: px, y: cy + 1.2, w: iw, h: 0.55, rectRadius: 0.06, fill: { color: K.soft }, line: { color: K.soft } });
      T([{ text: c.shape, options: { fontSize: 12, bold: true, color: K.text, breakLine: true } }, { text: c.sub, options: { fontSize: 9.5, color: K.muted } }], { x: px + 0.1, y: cy + 1.22, w: iw - 0.2, h: 0.51, valign: "middle", fit: "shrink" });
      T("NODES NEEDED PER RESOURCE", { x: px, y: cy + 1.85, w: iw, h: 0.2, fontSize: 8.5, bold: true, color: K.muted, charSpacing: 1 });
      const top = Math.max(1, ...c.need.map(r => r.v || 0));
      c.need.forEach((r, j) => {
        const y = cy + 2.1 + j * 0.27, bx = px + 0.75, bw = iw - 0.75 - 0.75;
        T(r.l, { x: px, y, w: 0.7, h: 0.22, fontSize: 10, bold: r.d, color: K.text, valign: "middle" });
        s.addShape(pptx.ShapeType.roundRect, { x: bx, y: y + 0.07, w: bw, h: 0.09, rectRadius: 0.04, fill: { color: K.soft }, line: { color: K.soft } });
        if (r.v) s.addShape(pptx.ShapeType.roundRect, { x: bx, y: y + 0.07, w: Math.max(0.04, bw * r.v / top), h: 0.09, rectRadius: 0.04, fill: { color: r.d ? c.color : "C4C9D2" }, line: { color: r.d ? c.color : "C4C9D2" } });
        T(r.v == null ? "–" : `${r.v} node${r.v === 1 ? "" : "s"}`, { x: px + iw - 0.72, y, w: 0.72, h: 0.22, fontSize: 10, bold: r.d, color: K.text, align: "right", valign: "middle" });
      });
      T(c.calc, { x: px, y: cy + 2.95, w: iw, h: 0.26, fontSize: 9, color: K.muted, fit: "shrink" });
      if (c.storage) T(c.storage, { x: px, y: cy + 3.2, w: iw, h: 0.62, fontSize: 9, color: c.minWarn ? K.warn : K.text, fit: "shrink", valign: "top" });
      // specs and costs
      const sy = cy + ch - 0.95, third = iw / 3;
      s.addShape(pptx.ShapeType.line, { x: px, y: sy - 0.06, w: iw, h: 0, line: { color: K.line, width: 0.75 } });
      [c.specs, c.costs].forEach((row, k) => row.forEach(([l, v], j) =>
        T([{ text: l, options: { fontSize: 8.5, color: K.muted, breakLine: true } }, { text: v, options: { fontSize: 11, bold: true, color: K.text } }],
          { x: px + j * third, y: sy + k * 0.46, w: third, h: 0.42, fit: "shrink" })));
    });
  }

  function buildCards(m) {
    if (!window.PptxGenJS) throw new Error("PptxGenJS failed to load (check your internet connection).");
    const pptx = new window.PptxGenJS();
    pptx.defineLayout({ name: "DECK", width: W, height: H });
    pptx.layout = "DECK";
    pptx.title = "OCVS Sizing & Pricing";
    slideCards(pptx, m);
    slideSources(pptx, m);
    return pptx;
  }

  async function downloadCards(m) {
    await buildCards(m).writeFile({ fileName: m.fileName });
  }

  root.Deck = { build, download, buildCards, downloadCards };
})(this);
