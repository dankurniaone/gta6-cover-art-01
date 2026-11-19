// Fixed scenes for screenshots: ?shot=editor shows the app with a sample
// photo loaded; ?shot=cover hides the controls and shows the cover alone
// at the requested export size. window.__shotReady is set once the cover
// has painted with its fonts, so a screenshot never catches a half-drawn
// frame. Query params: photo, photo2, caption, subtitle, layout, theme,
// size (e.g. 1920x1080).

export async function runShot(shot, query, state, helpers) {
  const { loadImage, redraw } = helpers;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('theme')) state.theme = query.get('theme');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('caption') !== null) state.caption = query.get('caption');
  if (query.get('subtitle') !== null) state.subtitle = query.get('subtitle');
  if (query.get('secondPanel')) state.secondPanel = query.get('secondPanel');
  const captionInput = document.getElementById('caption');
  const subtitleInput = document.getElementById('subtitle');
  if (captionInput) captionInput.value = state.caption;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  const layoutSelect = document.getElementById('layout');
  const themeSelect = document.getElementById('theme');
  if (layoutSelect) layoutSelect.value = state.layout;
  if (themeSelect) themeSelect.value = state.theme;

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
      state.photo2 = { img: img2, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
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
