// Cover renderer — turns the editor state into a GTA-style multi-panel
// cover on any canvas. The cover is a grid of slightly off-axis panels on
// a deep violet field, with the game's wordmark in the centre panel — the
// grammar of the official GTA VI cover (18 June 2026: nine illustrated
// panels on deep violet, logo in the middle in a pink-and-blue gradient,
// helicopter top-left, duo top-centre, speedboat top-right, supercar
// bottom-left, alligator bottom-centre, motorcycle bottom-right) and the
// GTA V cover (nine panels, one hexagonal wordmark tile, every panel
// pulled up to eight degrees off axis, gutters that are gaps, not
// strokes, no outer border). There is no caption strip below the grid:
// GTA covers carry the title in the middle, so the centre panel is the
// wordmark alone — a big VI in the Vice City gradient (cobalt blue at
// the top, through magenta, into burnt orange at the foot) with palm
// silhouettes inside it, and "grand theft auto" stacked in white over
// it, exactly as Rockstar draws it. No tagline sits under the logo; the
// user's title names the exported PNG instead (see main.js). The user's
// photo sits in a portrait panel among the photo vignettes (see
// panels.js), graded warm so it reads as one picture with them.

import { VIGNETTES } from './panels.js';

/** Colour themes. Sunset is the warm Vice City golden hour; Neon Night is
 *  the after-dark pink-and-teal glow; Vice City leans teal and orange.
 *  `field` is the deep violet the gutters and the cover edge are drawn
 *  in — the real covers sit on violet, not black. */
export const THEMES = {
  sunset: {
    label: 'Sunset',
    field: '#2b0a4d',
    skyTop: '#ff7a1a', skyMid: '#ff2e88', skyBot: '#2b0f4d',
    sun: '#ffd23e', accent: '#ff2e88', accent2: '#19e3d6',
    outline: '#12081f', tower: '#241239', window: '#ffd23e',
    heli: '#160a24', seaTop: '#19a7b8', seaBot: '#0b3a5c',
    night: '#160a2e', car: '#ffd23e', gator: '#2f7a4d',
    gradeTop: 'rgba(255, 46, 136, 0.10)',
    gradeBot: 'rgba(255, 122, 26, 0.14)',
  },
  neon: {
    label: 'Neon Night',
    field: '#1c0636',
    skyTop: '#0b1e3f', skyMid: '#3b1160', skyBot: '#12081f',
    sun: '#ff2e88', accent: '#19e3d6', accent2: '#ff2e88',
    outline: '#05030c', tower: '#1a1030', window: '#19e3d6',
    heli: '#05030c', seaTop: '#0f7d8c', seaBot: '#06283f',
    night: '#070312', car: '#19e3d6', gator: '#1f5c3d',
    gradeTop: 'rgba(25, 227, 214, 0.10)',
    gradeBot: 'rgba(255, 46, 136, 0.12)',
  },
  vice: {
    label: 'Vice City',
    field: '#2b0a4d',
    skyTop: '#19e3d6', skyMid: '#ff7a1a', skyBot: '#7a1e5c',
    sun: '#fff3b0', accent: '#ff7a1a', accent2: '#ff2e88',
    outline: '#12081f', tower: '#2b1445', window: '#fff3b0',
    heli: '#160a24', seaTop: '#19c3d6', seaBot: '#0b4a6b',
    night: '#1c0f33', car: '#ff7a1a', gator: '#2f7a4d',
    gradeTop: 'rgba(25, 227, 214, 0.10)',
    gradeBot: 'rgba(255, 46, 136, 0.12)',
  },
};

/** Layouts: each panel is [vignette id, grid x, grid y, grid w, grid h].
 *  `hero` is the panel that holds the main photo; `second` is the panel a
 *  second photo can replace; `logo` is the centre wordmark panel, drawn by
 *  drawLogoPanel rather than a vignette. Grid units are cols x rows over
 *  the whole cover — there is no caption band, the grid is the cover. */
export const LAYOUTS = {
  hero: {
    label: 'GTA VI grid — logo in the middle',
    cols: 4, rows: 4, hero: 'photo', second: 'boat',
    panels: [
      ['heli', 0, 0, 1, 1], ['skyline', 1, 0, 1, 1], ['boat', 2, 0, 1, 1], ['photo', 3, 0, 1, 2],
      ['producer', 0, 1, 1, 1], ['logo', 1, 1, 2, 2],
      ['robber', 0, 2, 1, 1], ['bike', 3, 2, 1, 1],
      ['supercar', 0, 3, 1, 1], ['gator', 1, 3, 2, 1], ['chase', 3, 3, 1, 1],
    ],
  },
  nine: {
    label: 'Nine panels — the classic grid',
    cols: 3, rows: 3, hero: 'photo', second: 'boat',
    panels: [
      ['heli', 0, 0, 1, 1], ['photo', 1, 0, 1, 1], ['boat', 2, 0, 1, 1],
      ['duo', 0, 1, 1, 1], ['logo', 1, 1, 1, 1], ['neon', 2, 1, 1, 1],
      ['supercar', 0, 2, 1, 1], ['gator', 1, 2, 1, 1], ['chase', 2, 2, 1, 1],
    ],
  },
  duo: {
    label: 'Duo — photo left, logo right',
    cols: 4, rows: 3, hero: 'photo', second: 'neon',
    panels: [
      ['photo', 0, 0, 2, 3],
      ['heli', 2, 0, 1, 1], ['skyline', 3, 0, 1, 1],
      ['logo', 2, 1, 2, 1],
      ['supercar', 2, 2, 1, 1], ['gator', 3, 2, 1, 1],
    ],
  },
};

/** Export sizes: the three common post sizes. */
export const EXPORT_SIZES = [
  { id: '1920x1080', label: 'Landscape 1920 × 1080', w: 1920, h: 1080 },
  { id: '1080x1080', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
];

/** The editor state the renderer reads. `photo` / `photo2` are
 *  { img, zoom, ox, oy, fit } or null; ox/oy pan the photo in -1..1.
 *  `caption` is the cover title: it names the exported PNG, it is
 *  never drawn on the cover — the centre panel is the wordmark alone. */
export function defaultState() {
  return {
    layout: 'hero',
    theme: 'sunset',
    caption: 'SUNSET HEIST',
    photo: null,
    photo2: null,
    secondPanel: 'boat',
    size: '1920x1080',
  };
}

/** Panel rectangles in canvas pixels, for one layout at one cover size.
 *  Returns [{ id, x, y, w, h, tilt }] — `tilt` is the panel's off-axis
 *  angle in radians, deterministic per panel so the grid is stable. The
 *  grid fills the whole canvas; the gutters are the violet field showing
 *  through between panels. */
export function layoutPanels(state, width, height) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  const margin = Math.max(10, Math.round(width * 0.012));
  const gutter = Math.max(6, Math.round(width * 0.011));
  const gridW = width - margin * 2;
  const gridH = height - margin * 2;
  const cellW = (gridW - gutter * (layout.cols - 1)) / layout.cols;
  const cellH = (gridH - gutter * (layout.rows - 1)) / layout.rows;
  const panels = layout.panels.map(([id, gx, gy, gw, gh], i) => ({
    id,
    x: Math.round(margin + gx * (cellW + gutter)),
    y: Math.round(margin + gy * (cellH + gutter)),
    w: Math.round(gw * cellW + (gw - 1) * gutter),
    h: Math.round(gh * cellH + (gh - 1) * gutter),
    // Up to about two degrees either way — enough to stop the collage
    // reading as a spreadsheet, never enough to announce itself.
    tilt: (((i * 7) % 5) - 2) * (Math.PI / 180) * 0.9,
  }));
  return { panels, gutter, margin };
}

/** Draws one photo into a panel with cover/contain fit, zoom and pan,
 *  then grades it warm (a pink wash from the top, orange from the foot)
 *  so a daylight photo sits in the same light as the photo vignettes
 *  instead of reading as a pasted snapshot. */
export function drawPhotoPanel(g, photo, rect, theme) {
  const { img } = photo;
  if (!img) return false;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = photo.zoom ?? 1;
  let scale;
  if (photo.fit === 'fit') {
    scale = Math.min(rect.w / iw, rect.h / ih) * zoom;
  } else {
    scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  }
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (photo.ox ?? 0) * rect.w * 0.25;
  const dy = rect.y + (rect.h - dh) / 2 + (photo.oy ?? 0) * rect.h * 0.25;
  g.save();
  g.beginPath();
  g.rect(rect.x, rect.y, rect.w, rect.h);
  g.clip();
  if (photo.fit === 'fit') {
    g.fillStyle = '#12081f';
    g.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  g.drawImage(img, dx, dy, dw, dh);
  // Warm comic grade: pink from the top, orange from the foot, so the
  // photo shares the illustrated panels' sunset light.
  const wash = g.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, 'rgba(255, 46, 136, 0.16)');
  wash.addColorStop(0.5, 'rgba(255, 46, 136, 0.0)');
  wash.addColorStop(1, 'rgba(255, 122, 26, 0.18)');
  g.fillStyle = wash;
  g.fillRect(rect.x, rect.y, rect.w, rect.h);
  // A touch of contrast: darken the edges so the photo holds its frame.
  const edge = g.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.4,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(10,4,20,0.22)');
  g.fillStyle = edge;
  g.fillRect(rect.x, rect.y, rect.w, rect.h);
  g.restore();
  return true;
}

/** A panel with no photo yet: dark field, dashed frame, a short label. */
export function drawEmptyPhotoPanel(g, rect, label) {
  g.fillStyle = '#1d1030';
  g.fillRect(rect.x, rect.y, rect.w, rect.h);
  g.strokeStyle = 'rgba(255,255,255,0.45)';
  g.lineWidth = Math.max(2, rect.w * 0.01);
  g.setLineDash([Math.max(8, rect.w * 0.04), Math.max(6, rect.w * 0.03)]);
  g.strokeRect(rect.x + rect.w * 0.06, rect.y + rect.h * 0.06, rect.w * 0.88, rect.h * 0.88);
  g.setLineDash([]);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.font = `600 ${Math.max(13, Math.round(rect.h * 0.09))}px system-ui, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

/** The centre wordmark, faithful to the official GTA VI logo (18 June
 *  2026). The real mark is a huge white wordmark — "grand theft auto"
 *  in three stacked lines of broad Pricedown capitals with a hard black
 *  outline — superimposed over a big VI in the Vice City gradient
 *  (cobalt blue at the top, through magenta and hot pink, into burnt
 *  orange at the foot), the VI carrying a thin white inner border and
 *  palm silhouettes in its upper corners. The wordmark dominates; the
 *  VI is its backdrop, mostly covered by the words, its gradient
 *  peeking out around the edges. There is no tagline under the logo.
 *  Anton is a condensed stand-in for Pricedown, so both the VI and the
 *  words are drawn horizontally stretched to the broad proportions of
 *  the real mark. The whole logo is fitted to the panel, so it fills a
 *  square centre tile and a wide duo tile alike. */
export function drawLogoPanel(g, rect, theme) {
  const { x, y, w, h } = rect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const family = '"Anton", "Arial Narrow", "Helvetica Neue", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';

  // The wordmark first, sized: it is the dominant element, so it sets
  // the logo's scale. Anton's "grand" is 2.33 em wide; the 1.7 stretch
  // brings it to Pricedown's breadth (the real "grand" is ~4.2 em wide
  // for its height). The three lines fill most of the panel height.
  const wordStretch = 1.7;
  const wordSize = Math.min(h * 0.28, w * 0.193);
  const lineH = wordSize * 0.92;
  // The three lines, visually centred on the panel: "grand" carries a
  // tall ascent and "auto" almost no descent, so the middle line sits
  // a touch above centre to balance the block.
  const firstY = cy - lineH + wordSize * 0.425;
  const wordW = 2.33 * wordSize * wordStretch;

  // The VI, a backdrop slightly larger than the wordmark: it fills the
  // panel height and runs a little wider than the words, so its gradient
  // frames the wordmark on every side.
  const viH = h * 0.94;
  const viW = wordW * 1.18;
  const viSize = viH / 0.86;
  const viStretch = viW / (0.70 * viSize);

  // The VI, drawn in a horizontally stretched space so it reads as the
  // real mark's broad numeral (a font's VI is far narrower than the
  // drawn one). Double outline — thick dark, then a thinner white line
  // inside it — then the Vice City gradient. The earlier version ran
  // pink-to-amber and ended yellow; the real logo starts cobalt blue
  // and ends burnt orange.
  g.save();
  g.translate(cx, cy);
  g.scale(viStretch, 1);
  g.font = `${viSize}px ${family}`;
  const grad = g.createLinearGradient(0, -viH / 2, 0, viH / 2);
  grad.addColorStop(0, '#2b3fd4');
  grad.addColorStop(0.38, '#c81d7a');
  grad.addColorStop(0.62, '#ff2e88');
  grad.addColorStop(1, '#ff7a1a');
  g.lineWidth = Math.max(4, viSize * 0.06);
  g.strokeStyle = '#12081f';
  g.strokeText('VI', 0, 0);
  g.lineWidth = Math.max(2, viSize * 0.028);
  g.strokeStyle = '#ffffff';
  g.strokeText('VI', 0, 0);
  g.fillStyle = grad;
  g.fillText('VI', 0, 0);
  g.restore();

  // Palm silhouettes in the upper corners of the VI — the real logo's
  // signature detail, dark against the blue-purple band above the
  // wordmark. They sit inside the VI's bounds, so they never spill
  // onto the violet field; a stray hair outside it would be dark on
  // dark and invisible anyway.
  const bandTop = cy - viH / 2;
  const wordTop = firstY - wordSize * 0.86;
  const bandH = Math.max(8, wordTop - bandTop);
  g.save();
  g.strokeStyle = 'rgba(26, 11, 46, 0.6)';
  g.lineWidth = Math.max(2, viSize * 0.014);
  g.lineCap = 'round';
  const fan = (ox, oy, dir, len) => {
    for (let i = 0; i <= 3; i++) {
      const a = -Math.PI / 2 + dir * (0.25 + i * 0.28);
      const ex = ox + Math.cos(a) * len;
      const ey = oy + Math.sin(a) * len * 0.8;
      const mx = ox + Math.cos(a) * len * 0.5;
      const my = oy + Math.sin(a) * len * 0.5 - len * 0.15;
      g.beginPath();
      g.moveTo(ox, oy);
      g.quadraticCurveTo(mx, my, ex, ey);
      g.stroke();
    }
  };
  const fanY = bandTop + bandH * 0.75;
  fan(cx - viW * 0.30, fanY, -1, bandH * 1.1);
  fan(cx + viW * 0.30, fanY, 1, bandH * 1.1);
  g.restore();

  // The wordmark, superimposed over the VI: three stacked lines, white
  // with a hard black outline, drawn in the same stretched space as the
  // VI so the letters read as broad Pricedown capitals, not condensed
  // Anton. The words are the same visual weight as the VI — the earlier
  // version shrank them into a separate band below it, which is what
  // made the centre read as stacked fragments.
  const words = ['grand', 'theft', 'auto'];
  g.save();
  g.translate(cx, 0);
  g.scale(wordStretch, 1);
  g.font = `${wordSize}px ${family}`;
  g.lineWidth = Math.max(2, wordSize * 0.11);
  g.strokeStyle = '#12081f';
  words.forEach((word, i) => {
    const ly = firstY + i * lineH;
    g.strokeText(word, 0, ly);
    g.fillStyle = '#ffffff';
    g.fillText(word, 0, ly);
  });
  g.restore();
}

/** The Vice City grade: warm pink light from the top, orange from the
 *  foot, and a darkened edge so the panels hold together as one poster. */
export function applySunsetGrade(g, width, height, theme) {
  const top = g.createLinearGradient(0, 0, 0, height);
  top.addColorStop(0, theme.gradeTop);
  top.addColorStop(0.5, 'rgba(0,0,0,0)');
  top.addColorStop(1, theme.gradeBot);
  g.fillStyle = top;
  g.fillRect(0, 0, width, height);
  const edge = g.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.72,
  );
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(10,4,20,0.28)');
  g.fillStyle = edge;
  g.fillRect(0, 0, width, height);
}

/** Renders the whole cover onto `canvas` at its own pixel size. Each
 *  panel is drawn tilted a couple of degrees around its own centre, so
 *  the grid reads as a hand-laid collage rather than a spreadsheet; the
 *  deep violet field shows through as the gutters. */
export function renderCover(canvas, state) {
  const g = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const theme = THEMES[state.theme] ?? THEMES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  g.clearRect(0, 0, width, height);
  g.fillStyle = theme.field;
  g.fillRect(0, 0, width, height);
  const { panels, gutter } = layoutPanels(state, width, height);
  for (const panel of panels) {
    const cx = panel.x + panel.w / 2;
    const cy = panel.y + panel.h / 2;
    g.save();
    g.translate(cx, cy);
    g.rotate(panel.tilt);
    g.translate(-cx, -cy);
    g.beginPath();
    g.rect(panel.x, panel.y, panel.w, panel.h);
    g.clip();
    if (panel.id === 'logo') {
      drawLogoPanel(g, panel, theme);
    } else if (panel.id === layout.hero) {
      if (state.photo && drawPhotoPanel(g, state.photo, panel, theme)) {
        // Photo drawn.
      } else {
        drawEmptyPhotoPanel(g, panel, 'YOUR PHOTO HERE');
      }
    } else if (panel.id === state.secondPanel && state.photo2) {
      drawPhotoPanel(g, state.photo2, panel, theme);
    } else {
      const painter = VIGNETTES[panel.id];
      if (painter) painter(g, panel.x, panel.y, panel.w, panel.h, theme);
    }
    g.restore();
    // A thin ink line around the tilted panel — the comic outline, not a
    // heavy divider; the violet gutter does the separating.
    g.save();
    g.translate(cx, cy);
    g.rotate(panel.tilt);
    g.translate(-cx, -cy);
    g.lineWidth = Math.max(2, gutter * 0.45);
    g.strokeStyle = '#0a0514';
    g.strokeRect(panel.x, panel.y, panel.w, panel.h);
    g.restore();
  }
  applySunsetGrade(g, width, height, theme);
  return { panels };
}

/** Finds the panel id under a point on the preview canvas (for dragging). */
export function panelAt(state, width, height, px, py) {
  const { panels } = layoutPanels(state, width, height);
  return panels.find((p) => px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) ?? null;
}
