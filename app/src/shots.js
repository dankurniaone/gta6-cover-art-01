// Fixed scenes for screenshots: ?shot=editor shows the app with a sample
// photo loaded; ?shot=cover hides the controls and shows the cover alone
// at the requested export size. window.__shotReady is set once the cover
// has painted with its fonts and its vignette photos, so a screenshot
// never catches a half-drawn frame. Query params: photo, photo2, caption,
// layout, theme, size (e.g. 1920x1080), secondPanel, ox, oy.

import { loadVignetteImages } from './panels.js';

export async function runShot(shot, query, state, helpers) {
  const { loadImage, redraw } = helpers;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  // Vignette photos first: the cover must paint with the real photos,
  // not the fallback gradient, before __shotReady fires. The preload is
  // shared with the editor boot, so this is a no-op if it already ran.
  try { await loadVignetteImages(loadImage); } catch { /* fallback gradient */ }
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('theme')) state.theme = query.get('theme');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('caption') !== null) state.caption = query.get('caption');
  if (query.get('secondPanel')) state.secondPanel = query.get('secondPanel');
  const captionField = document.getElementById('caption');
  if (captionField) captionField.value = state.caption;
  const layoutField = document.getElementById('layout');
  const themeField = document.getElementById('theme');
  if (layoutField) layoutField.value = state.layout;
  if (themeField) themeField.value = state.theme;

  const photoName = query.get('photo') ?? 'pier';
  const panY = Number(query.get('oy') ?? 0) || 0;
  const panX = Number(query.get('ox') ?? 0) || 0;
  try {
    const img = await loadImage(`samples/${photoName}.jpg`);
    state.photo = { img, zoom: 1, ox: panX, oy: panY, fit: 'cover' };
  } catch {
    // A missing sample still leaves a cover to screenshot.
  }
  const photo2Name = query.get('photo2');
  if (photo2Name) {
    try {
      const img2 = await loadImage(`samples/${photo2Name}.jpg`);
      const panX2 = Number(query.get('ox2') ?? 0) || 0;
      const panY2 = Number(query.get('oy2') ?? 0) || 0;
      state.photo2 = { img: img2, zoom: 1, ox: panX2, oy: panY2, fit: 'cover' };
    } catch {
      // Second photo is optional.
    }
  }
  redraw();
  // Wait for the display font, then two frames, then signal readiness.
  try { await document.fonts.ready; } catch { /* system font fallback */ }
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
