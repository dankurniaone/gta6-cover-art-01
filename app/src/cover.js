// Cover renderer — turns the editor state into a GTA-style multi-panel
// cover on any canvas. A cover is a grid of heavy-bordered panels above a
// bold caption band: the user's photo in the hero panel, original Vice City
// vignettes (see panels.js) around it, and one sunset or neon grade over all.

import { VIGNETTES } from './panels.js';

/** Colour themes. Sunset is the warm Vice City golden hour; Neon Night is
 *  the after-dark pink-and-teal glow; Vice City leans teal and orange. */
export const THEMES = {
  sunset: {
    label: 'Sunset',
    skyTop: '#ff7a1a', skyMid: '#ff2e88', skyBot: '#2b0f4d',
    sun: '#ffd23e', accent: '#ff2e88', accent2: '#19e3d6',
    outline: '#12081f', tower: '#241239', window: '#ffd23e',
    heli: '#160a24', seaTop: '#19a7b8', seaBot: '#0b3a5c',
    night: '#160a2e', car: '#ffd23e', gator: '#2f7a4d',
    band: '#160a24', bandRule: '#ff2e88', gradeTop: 'rgba(255, 46, 136, 0.10)',
    gradeBot: 'rgba(255, 122, 26, 0.14)',
  },
  neon: {
    label: 'Neon Night',
    skyTop: '#0b1e3f', skyMid: '#3b1160', skyBot: '#12081f',
    sun: '#ff2e88', accent: '#19e3d6', accent2: '#ff2e88',
    outline: '#05030c', tower: '#1a1030', window: '#19e3d6',
    heli: '#05030c', seaTop: '#0f7d8c', seaBot: '#06283f',
    night: '#070312', car: '#19e3d6', gator: '#1f5c3d',
    band: '#070312', bandRule: '#19e3d6', gradeTop: 'rgba(25, 227, 214, 0.10)',
    gradeBot: 'rgba(255, 46, 136, 0.12)',
  },
  vice: {
    label: 'Vice City',
    skyTop: '#19e3d6', skyMid: '#ff7a1a', skyBot: '#7a1e5c',
    sun: '#fff3b0', accent: '#ff7a1a', accent2: '#ff2e88',
    outline: '#12081f', tower: '#2b1445', window: '#fff3b0',
    heli: '#160a24', seaTop: '#19c3d6', seaBot: '#0b4a6b',
    night: '#1c0f33', car: '#ff7a1a', gator: '#2f7a4d',
    band: '#1c0f33', bandRule: '#ff7a1a', gradeTop: 'rgba(25, 227, 214, 0.10)',
    gradeBot: 'rgba(255, 46, 136, 0.12)',
  },
};

/** Layouts: each panel is [vignette id, grid x, grid y, grid w, grid h].
 *  `hero` is the panel that holds the main photo; `second` is the panel a
 *  second photo can replace. Grid units are cols x rows over the grid area. */
export const LAYOUTS = {
  hero: {
    label: 'Hero centre — 3×3 with a big middle',
    cols: 4, rows: 4, hero: 'photo', second: 'boat',
    panels: [
      ['heli', 0, 0, 1, 1], ['skyline', 1, 0, 2, 1], ['boat', 3, 0, 1, 1],
      ['palms', 0, 1, 1, 2], ['photo', 1, 1, 2, 2], ['supercar', 3, 1, 1, 2],
      ['gator', 0, 3, 1, 1], ['neon', 1, 3, 2, 1], ['chase', 3, 3, 1, 1],
    ],
  },
  nine: {
    label: 'Nine panels — the classic grid',
    cols: 3, rows: 3, hero: 'photo', second: 'boat',
    panels: [
      ['heli', 0, 0, 1, 1], ['skyline', 1, 0, 1, 1], ['boat', 2, 0, 1, 1],
      ['palms', 0, 1, 1, 1], ['photo', 1, 1, 1, 1], ['supercar', 2, 1, 1, 1],
      ['gator', 0, 2, 1, 1], ['neon', 1, 2, 1, 1], ['chase', 2, 2, 1, 1],
    ],
  },
  duo: {
    label: 'Duo — photo left, city right',
    cols: 4, rows: 3, hero: 'photo', second: 'neon',
    panels: [
      ['photo', 0, 0, 2, 3],
      ['heli', 2, 0, 1, 1], ['skyline', 3, 0, 1, 1],
      ['boat', 2, 1, 1, 1], ['supercar', 3, 1, 1, 1],
      ['neon', 2, 2, 1, 1], ['chase', 3, 2, 1, 1],
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
 *  { img, zoom, ox, oy, fit } or null; ox/oy pan the photo in -1..1. */
export function defaultState() {
  return {
    layout: 'hero',
    theme: 'sunset',
    caption: 'SUNSET HEIST',
    subtitle: 'LEONIDA · VICE CITY',
    photo: null,
    photo2: null,
    secondPanel: 'boat',
    size: '1920x1080',
  };
}

/** Panel rectangles in canvas pixels, for one layout at one cover size.
 *  Returns [{ id, x, y, w, h }] plus the caption band rect. */
export function layoutPanels(state, width, height) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  const bandH = Math.round(height * 0.19);
  const gridH = height - bandH;
  const gutter = Math.max(6, Math.round(width * 0.011));
  const cellW = (width - gutter * (layout.cols + 1)) / layout.cols;
  const cellH = (gridH - gutter * (layout.rows + 1)) / layout.rows;
  const panels = layout.panels.map(([id, gx, gy, gw, gh]) => ({
    id,
    x: Math.round(gutter + gx * (cellW + gutter)),
    y: Math.round(gutter + gy * (cellH + gutter)),
    w: Math.round(gw * cellW + (gw - 1) * gutter),
    h: Math.round(gh * cellH + (gh - 1) * gutter),
  }));
  return { panels, band: { x: 0, y: gridH, w: width, h: bandH }, gutter };
}

/** Draws one photo into a panel with cover/contain fit, zoom and pan. */
export function drawPhotoPanel(g, photo, rect) {
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

/** The caption band: a dark strip with a neon rule, the caption in heavy
 *  Anton capitals with a hard black outline, the subtitle letterspaced. */
export function drawCaptionBand(g, state, band, theme) {
  const { x, y, w, h } = band;
  g.fillStyle = theme.band;
  g.fillRect(x, y, w, h);
  g.fillStyle = theme.bandRule;
  g.fillRect(x, y, w, Math.max(4, h * 0.045));
  const caption = (state.caption || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const cx = x + w / 2;
  // Subtitle sits above the caption when there is room for both.
  let captionSize = h * (subtitle ? 0.52 : 0.62);
  const family = '"Anton", "Arial Narrow", "Helvetica Neue", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (caption) {
    g.font = `${captionSize}px ${family}`;
    while (g.measureText(caption).width > w * 0.92 && captionSize > 16) {
      captionSize -= 2;
      g.font = `${captionSize}px ${family}`;
    }
    const cy = subtitle ? y + h * 0.58 : y + h * 0.54;
    g.lineWidth = Math.max(2, captionSize * 0.09);
    g.strokeStyle = '#000000';
    g.lineJoin = 'round';
    g.strokeText(caption, cx, cy);
    g.fillStyle = '#ffffff';
    g.fillText(caption, cx, cy);
  }
  if (subtitle) {
    const subSize = Math.max(12, h * 0.13);
    g.font = `600 ${subSize}px system-ui, sans-serif`;
    // Letterspace by hand: canvas has no letter-spacing everywhere.
    const spaced = subtitle.split('').join('  ');
    g.fillStyle = theme.accent2;
    g.fillText(spaced, cx, y + h * 0.2);
  }
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

/** Renders the whole cover onto `canvas` at its own pixel size. */
export function renderCover(canvas, state) {
  const g = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const theme = THEMES[state.theme] ?? THEMES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  g.clearRect(0, 0, width, height);
  g.fillStyle = theme.band;
  g.fillRect(0, 0, width, height);
  const { panels, band, gutter } = layoutPanels(state, width, height);
  for (const panel of panels) {
    if (panel.id === layout.hero) {
      if (state.photo && drawPhotoPanel(g, state.photo, panel)) {
        // Photo drawn.
      } else {
        drawEmptyPhotoPanel(g, panel, 'YOUR PHOTO HERE');
      }
    } else if (panel.id === state.secondPanel && state.photo2) {
      drawPhotoPanel(g, state.photo2, panel);
    } else {
      const painter = VIGNETTES[panel.id];
      if (painter) painter(g, panel.x, panel.y, panel.w, panel.h, theme);
    }
    // Heavy dark divider around every panel — the GTA grid anchor.
    g.lineWidth = Math.max(3, gutter * 0.9);
    g.strokeStyle = '#0a0514';
    g.strokeRect(panel.x, panel.y, panel.w, panel.h);
  }
  drawCaptionBand(g, state, band, theme);
  applySunsetGrade(g, width, height, theme);
  return { panels, band };
}

/** Finds the panel id under a point on the preview canvas (for dragging). */
export function panelAt(state, width, height, px, py) {
  const { panels } = layoutPanels(state, width, height);
  return panels.find((p) => px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) ?? null;
}
