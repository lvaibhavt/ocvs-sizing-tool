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

    const title = rep.title || "OCVS Sizing & Pricing";
    s.addText(title, { x: M, y: 0.45 + D, w: 11.4, h: 0.8, fontFace: HEAD, fontSize: title.length > 44 ? 22 : title.length > 30 ? 28 : 38, bold: true, color: C.navy, margin: 0, isTextBox: true, valign: "middle" });
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
    const secH = 0.24;
    // A row whose text wraps is taller, so allow for it; otherwise the table runs into the callouts.
    // the first data column (OCVS) is bold, so fewer characters fit on a line there
    const perLine = Math.floor(colW * 72 / (12 * 0.47)), perLineBold = Math.floor(colW * 72 / (12 * 0.58)), perLineLabel = Math.floor(firstW * 72 / (12 * 0.52));
    const lines = x => Math.max(Math.ceil(String(x.label).length / perLineLabel), ...x.cells.map((c, i) => Math.ceil(String(c).length / (i === 0 ? perLineBold : perLine))), 1);
    const weight = x => 1 + 0.8 * (lines(x) - 1);
    const weights = rep.rows.map(x => (x.section ? 0 : weight(x)));
    const rowH = Math.min(0.38, (tableMaxH - nSec * secH) / (1 + weights.reduce((a, b) => a + b, 0)));
    const fs = rowH >= 0.34 ? 13 : rowH >= 0.3 ? 12 : 11;
    const heights = [rowH, ...rep.rows.map((x, i) => (x.section ? secH : rowH * weights[i]))];
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
          { text: co.title, options: { fontFace: HEAD, fontSize: rep.callouts.length > 2 ? (co.title.length > 20 ? 18 : 22) : 24, bold: true, color: co.positive ? C.green : C.red, breakLine: true } },
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

  // Slide 1: executive summary
  function slideSummary(pptx, m) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };
    banner(pptx, s);
    const T = (t, o) => s.addText(t, { fontFace: F, margin: 0, isTextBox: true, ...o });
    T(m.sumEyebrow || "EXECUTIVE SUMMARY", { x: M, y: 0.6, w: W - 2 * M, h: 0.3, fontSize: 12, bold: true, color: m.winner.color, charSpacing: 3 });
    T(m.headline, { x: M, y: 0.92, w: W - 2 * M, h: 0.7, fontSize: 26, bold: true, color: K.text, fit: "shrink" });
    T(m.subhead, { x: M, y: 1.62, w: W - 2 * M, h: 0.35, fontSize: 14, color: K.muted });

    // requirement panel (left)
    const py = 2.25, ph = 4.7, lw = 4.3;
    s.addShape(pptx.ShapeType.roundRect, { x: M, y: py, w: lw, h: ph, rectRadius: 0.1, fill: { color: K.soft }, line: { color: K.soft } });
    T(m.reqLabel || "YOUR REQUIREMENT", { x: M + 0.3, y: py + 0.25, w: lw - 0.6, h: 0.3, fontSize: 11, bold: true, color: K.muted, charSpacing: 2, fit: "shrink" });
    m.req.forEach(([v, l], i) => T([{ text: v, options: { fontSize: 30, bold: true, color: K.text, breakLine: true } }, { text: l, options: { fontSize: 12, color: K.muted } }],
      { x: M + 0.3, y: py + 0.65 + i * 0.95, w: lw - 0.6, h: 0.85 }));
    s.addShape(pptx.ShapeType.line, { x: M + 0.3, y: py + 3.5, w: lw - 0.6, h: 0, line: { color: "D5D9E1", width: 1 } });
    T([{ text: "Recommended on " + m.winner.short, options: { fontSize: 11, bold: true, color: m.winner.color, breakLine: true } },
       { text: m.winner.config, options: { fontSize: 12.5, bold: true, color: K.text } }], { x: M + 0.3, y: py + 3.58, w: lw - 0.6, h: 0.7, fit: "shrink" });

    // monthly cost comparison (right)
    const rx = M + lw + 0.5, rw = W - M - rx;
    T("MONTHLY COST", { x: rx, y: py + 0.05, w: rw, h: 0.3, fontSize: 11, bold: true, color: K.muted, charSpacing: 2 });
    const max = Math.max(...m.bars.map(b => b.value)), rowH = 1.02, nameW = 2.6, valW = 2.4, bw = rw - nameW - valW - 0.2;
    m.bars.forEach((b, i) => {
      const y = py + 0.5 + i * rowH;
      T([{ text: b.long, options: { fontSize: 13, bold: true, color: K.text, breakLine: true } }, { text: b.config, options: { fontSize: 10, color: K.muted } }],
        { x: rx, y, w: nameW, h: 0.7, valign: "middle", fit: "shrink" });
      s.addShape(pptx.ShapeType.rect, { x: rx + nameW, y: y + 0.2, w: Math.max(0.08, bw * b.value / max), h: 0.3, fill: { color: b.color }, line: { color: b.color } });
      T([{ text: b.label, options: { fontSize: 16, bold: true, color: K.text, breakLine: true } }, { text: b.delta, options: { fontSize: 10, bold: true, color: b.deltaColor } }],
        { x: W - M - valW, y, w: valW, h: 0.7, align: "right", valign: "middle" });
    });

    // savings tiles
    const ty = py + ph + 0.3, th = Math.min(1.25, H - ty - 0.45), n = m.tiles.length, gap = 0.3;
    const tw = (W - 2 * M - gap * (n - 1)) / Math.max(n, 1);
    m.tiles.forEach((t, i) => {
      const x = M + i * (tw + gap);
      s.addShape(pptx.ShapeType.roundRect, { x, y: ty, w: tw, h: th, rectRadius: 0.08, fill: { color: t.positive ? "EEF6EE" : "FBEEEE" }, line: { color: t.positive ? "C8E0C9" : "E8C4C1", width: 1 } });
      T([{ text: t.title, options: { fontSize: 20, bold: true, color: t.positive ? K.good : K.bad, breakLine: true } }, { text: t.sub, options: { fontSize: 12, color: K.text } }],
        { x: x + 0.25, y: ty + 0.05, w: tw - 0.5, h: th - 0.1, valign: "middle", fit: "shrink" });
    });
    T(m.footer, { x: M, y: H - 0.38, w: W - 2 * M, h: 0.28, fontSize: 9, color: K.muted });
  }

  // Slide 2: recommended configuration on each cloud
  function slideSolutions(pptx, m) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };
    banner(pptx, s);
    const T = (t, o) => s.addText(t, { fontFace: F, margin: 0, isTextBox: true, ...o });
    T(m.eyebrow || "RECOMMENDED CONFIGURATION", { x: M, y: 0.6, w: W - 2 * M, h: 0.3, fontSize: 12, bold: true, color: m.winner.color, charSpacing: 3 });
    T(m.title2 || "The lowest-cost configuration on each cloud that meets the requirement", { x: M, y: 0.92, w: W - 2 * M, h: 0.6, fontSize: 26, bold: true, color: K.text, fit: "shrink" });
    T(m.subhead, { x: M, y: 1.52, w: W - 2 * M, h: 0.35, fontSize: 13, color: K.muted });

    const cy = 2.1, ch = H - cy - 0.75, n = m.cards.length, gap = 0.25;
    const cw = n === 1 ? 7.5 : (W - 2 * M - gap * (n - 1)) / n, x0 = n === 1 ? (W - cw) / 2 : M;
    m.cards.forEach((c, i) => {
      const x = x0 + i * (cw + gap), best = c.rank === 1;
      s.addShape(pptx.ShapeType.rect, { x, y: cy, w: cw, h: ch, fill: { color: "FFFFFF" }, line: { color: best ? c.color : K.line, width: best ? 2 : 1 } });
      s.addShape(pptx.ShapeType.rect, { x, y: cy, w: cw, h: 0.75, fill: { color: c.color }, line: { color: c.color } });
      T(c.name, { x: x + 0.2, y: cy + 0.05, w: cw - 0.4, h: 0.65, fontSize: 14, bold: true, color: "FFFFFF", valign: "middle", fit: "shrink" });
      if (best) {
        s.addShape(pptx.ShapeType.rect, { x: x + cw - 1.55, y: cy - 0.18, w: 1.4, h: 0.34, fill: { color: K.good }, line: { color: K.good } });
        T(m.bestLabel || "LOWEST COST", { x: x + cw - 1.55, y: cy - 0.18, w: 1.4, h: 0.34, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle", charSpacing: 1 });
      }
      c.rows.forEach(([l, v], k) => {
        const rowH = m.rowH || 0.78, y = cy + 0.95 + k * rowH;
        T([{ text: l.toUpperCase(), options: { fontSize: 9, bold: true, color: K.muted, charSpacing: 1, breakLine: true } }, { text: v, options: { fontSize: m.rowFont || 13, bold: k === 0 && !m.rowH, color: K.text } }],
          { x: x + 0.2, y, w: cw - 0.4, h: rowH - 0.06, valign: "top", fit: "shrink" });
      });
      const fy = cy + ch - 1.35;
      s.addShape(pptx.ShapeType.rect, { x: x + 0.01, y: fy, w: cw - 0.02, h: 1.34, fill: { color: best ? "FBEAE7" : K.soft }, line: { color: best ? "FBEAE7" : K.soft } });
      T([{ text: c.price, options: { fontSize: 26, bold: true, color: K.text } }, { text: " per month", options: { fontSize: 11, color: K.muted, breakLine: true } },
         { text: c.term, options: { fontSize: 12, color: K.text, breakLine: true } },
         { text: c.delta, options: { fontSize: 11, bold: true, color: c.deltaColor } }], { x: x + 0.2, y: fy + 0.08, w: cw - 0.4, h: 1.2, valign: "middle" });
    });
    T(m.notes2.join("   "), { x: M, y: H - 0.55, w: W - 2 * M, h: 0.45, fontSize: 9, color: K.muted, valign: "top", fit: "shrink" });
  }

  // One cloud only (no comparison): the requirement on the left, the recommended configuration and price on the right
  function slideSingle(pptx, m) {
    const s = pptx.addSlide(), c = m.cards[0];
    s.background = { color: "FFFFFF" };
    banner(pptx, s);
    const T = (t, o) => s.addText(t, { fontFace: F, margin: 0, isTextBox: true, ...o });
    T(m.eyebrow || "SIZING & PRICING", { x: M, y: 0.6, w: 10, h: 0.3, fontSize: 12, bold: true, color: c.color, charSpacing: 3 });
    T(m.headline, { x: M, y: 0.92, w: W - 2 * M, h: 0.7, fontSize: 26, bold: true, color: K.text, fit: "shrink" });
    T(m.subhead, { x: M, y: 1.62, w: W - 2 * M, h: 0.35, fontSize: 14, color: K.muted });

    const py = 2.25, ph = H - py - 0.75, lw = 4.3;
    s.addShape(pptx.ShapeType.roundRect, { x: M, y: py, w: lw, h: ph, rectRadius: 0.1, fill: { color: K.soft }, line: { color: K.soft } });
    T(m.reqLabel || "YOUR REQUIREMENT", { x: M + 0.3, y: py + 0.25, w: lw - 0.6, h: 0.3, fontSize: 11, bold: true, color: K.muted, charSpacing: 2, fit: "shrink" });
    m.req.forEach(([v, l], i) => T([{ text: v, options: { fontSize: 34, bold: true, color: K.text, breakLine: true } }, { text: l, options: { fontSize: 13, color: K.muted } }],
      { x: M + 0.3, y: py + 0.8 + i * 1.25, w: lw - 0.6, h: 1.05 }));

    const rx = M + lw + 0.5, rw = W - M - rx, half = (rw - 0.6) / 2;
    s.addShape(pptx.ShapeType.rect, { x: rx, y: py, w: rw, h: ph, fill: { color: "FFFFFF" }, line: { color: c.color, width: 2 } });
    s.addShape(pptx.ShapeType.rect, { x: rx, y: py, w: rw, h: 0.75, fill: { color: c.color }, line: { color: c.color } });
    T(c.name, { x: rx + 0.3, y: py + 0.05, w: rw - 2.4, h: 0.65, fontSize: 17, bold: true, color: "FFFFFF", valign: "middle" });
    T(m.bestLabel || "RECOMMENDED", { x: rx + rw - 2.0, y: py + 0.2, w: 1.7, h: 0.36, fontSize: 10.5, bold: true, color: c.color, fill: { color: "FFFFFF" }, align: "center", valign: "middle", charSpacing: 1 });
    // first row (the configuration) spans the card; the rest sit two to a line
    const [first, ...rest] = c.rows;
    T([{ text: first[0].toUpperCase(), options: { fontSize: 10, bold: true, color: K.muted, charSpacing: 1, breakLine: true } }, { text: first[1], options: { fontSize: 20, bold: true, color: K.text } }],
      { x: rx + 0.3, y: py + 1.0, w: rw - 0.6, h: 0.95, valign: "top", fit: "shrink" });
    rest.forEach(([l, v], k) => T([{ text: l.toUpperCase(), options: { fontSize: 10, bold: true, color: K.muted, charSpacing: 1, breakLine: true } }, { text: v, options: { fontSize: 14, color: K.text } }],
      { x: rx + 0.3 + (k % 2) * (half + 0.0), y: py + 2.15 + Math.floor(k / 2) * 1.0, w: half - 0.2, h: 0.9, valign: "top", fit: "shrink" }));
    const fh = 1.45, fy = py + ph - fh;
    s.addShape(pptx.ShapeType.rect, { x: rx + 0.02, y: fy, w: rw - 0.04, h: fh - 0.02, fill: { color: "FBEAE7" }, line: { color: "FBEAE7" } });
    T([{ text: c.price, options: { fontSize: 36, bold: true, color: K.text } }, { text: "  per month", options: { fontSize: 13, color: K.muted, breakLine: true } },
       { text: c.term, options: { fontSize: 14, color: K.text } }], { x: rx + 0.3, y: fy + 0.1, w: rw - 0.6, h: fh - 0.2, valign: "middle" });
    T(m.notes2.join("   "), { x: M, y: H - 0.55, w: W - 2 * M, h: 0.45, fontSize: 9, color: K.muted, valign: "top", fit: "shrink" });
  }

  function buildCards(m) {
    if (!window.PptxGenJS) throw new Error("PptxGenJS failed to load (check your internet connection).");
    const pptx = new window.PptxGenJS();
    pptx.defineLayout({ name: "DECK", width: W, height: H });
    pptx.layout = "DECK";
    pptx.title = "OCVS Sizing & Pricing";
    if (m.cards.length === 1) slideSingle(pptx, m);
    else { slideSummary(pptx, m); if (!m.basic) slideSolutions(pptx, m); }   // Basic: the one-slide summary
    slideSources(pptx, m);
    return pptx;
  }

  async function downloadCards(m) {
    await buildCards(m).writeFile({ fileName: m.fileName });
  }

  // Consolidated deck for several clusters: one slide per cluster, then the slide(s) for all clusters together,
  // then assumptions. m.slides = [{ kind: "main" | "cards" | "single", model }] in order.
  function buildConsolidated(m) {
    if (!window.PptxGenJS) throw new Error("PptxGenJS failed to load (check your internet connection).");
    const pptx = new window.PptxGenJS();
    pptx.defineLayout({ name: "DECK", width: W, height: H });
    pptx.layout = "DECK";
    pptx.title = "OCVS Sizing & Pricing: consolidated";
    const kinds = { main: slideMain, cards: slideSolutions, single: slideSingle, summary: slideSummary };
    m.slides.forEach(x => kinds[x.kind](pptx, x.model));
    slideSources(pptx, m);
    return pptx;
  }

  async function downloadConsolidated(m) {
    await buildConsolidated(m).writeFile({ fileName: m.fileName });
  }

  root.Deck = { build, download, buildCards, downloadCards, buildConsolidated, downloadConsolidated };
})(this);
