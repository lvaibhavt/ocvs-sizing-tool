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

  root.Deck = { build, download };
})(this);
