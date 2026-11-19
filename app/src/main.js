// Editor wiring — Vice City Cover Maker. Loads photos, keeps the live
// preview in step with every control, drags the photo inside its portrait
// panel, and exports the cover as a PNG at the exact post size chosen,
// named after the cover title. The cover itself is a GTA-style grid with
// the wordmark in the centre (see cover.js); the main photo lives in the
// top-centre portrait panel, among the photo vignettes.

import { THEMES, LAYOUTS, EXPORT_SIZES, defaultState, renderCover, panelAt } from './cover.js';
import { loadVignetteImages } from './panels.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusLine = document.getElementById('status');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
const themeSelect = document.getElementById('theme');
const zoomSlider = document.getElementById('zoom');
const fitToggle = document.getElementById('fit');
const secondPanelSelect = document.getElementById('second-panel');
const sizeButtons = [...document.querySelectorAll('[data-size]')];
const exportButton = document.getElementById('export');

const state = defaultState();
let fontsReady = false;

document.fonts?.ready.then(() => { fontsReady = true; repaint(); });

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Reads a File into an image the renderer can draw. */
export function loadFile(file) {
  return loadImage(URL.createObjectURL(file));
}

function say(text) {
  statusLine.textContent = text;
}

function activeSize() {
  return EXPORT_SIZES.find((s) => s.id === state.size) ?? EXPORT_SIZES[0];
}

function repaint() {
  const size = activeSize();
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  renderCover(canvas, state);
  canvas.setAttribute('aria-label', `Cover preview: ${state.caption || 'untitled'}`);
}

function wirePhotoInput(inputId, slot) {
  document.getElementById(inputId).addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const img = await loadFile(file);
      state[slot] = { img, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
      repaint();
      say(slot === 'photo'
        ? `Main photo loaded — drag it in the portrait panel to reposition.`
        : `Second photo loaded — it fills the ${state.secondPanel} panel.`);
    } catch {
      say('That file could not be read as a photo. Try a JPG or PNG.');
    }
  });
}

wirePhotoInput('photo', 'photo');
wirePhotoInput('photo2', 'photo2');

// Drag-and-drop anywhere on the preview: dropping a file loads it as the
// main photo; dropping while holding Shift loads it as the second photo.
canvas.addEventListener('dragover', (event) => event.preventDefault());
canvas.addEventListener('drop', async (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  try {
    const img = await loadFile(file);
    const slot = event.shiftKey ? 'photo2' : 'photo';
    state[slot] = { img, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
    repaint();
    say(slot === 'photo' ? 'Main photo loaded.' : 'Second photo loaded.');
  } catch {
    say('That file could not be read as a photo.');
  }
});

// Drag inside the portrait panel (or the second-photo panel) to move it.
let dragSlot = null;
let dragOrigin = null;
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const panel = panelAt(state, canvas.width, canvas.height, px, py);
  const layout = LAYOUTS[state.layout];
  if (panel && panel.id === layout.hero && state.photo) {
    dragSlot = 'photo';
  } else if (panel && panel.id === state.secondPanel && state.photo2) {
    dragSlot = 'photo2';
  } else {
    return;
  }
  dragOrigin = { x: event.clientX, y: event.clientY, ox: state[dragSlot].ox, oy: state[dragSlot].oy };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragSlot || !dragOrigin) return;
  const rect = canvas.getBoundingClientRect();
  const photo = state[dragSlot];
  photo.ox = dragOrigin.ox + ((event.clientX - dragOrigin.x) / rect.width) * 4;
  photo.oy = dragOrigin.oy + ((event.clientY - dragOrigin.y) / rect.height) * 4;
  photo.ox = Math.max(-2, Math.min(2, photo.ox));
  photo.oy = Math.max(-2, Math.min(2, photo.oy));
  repaint();
});
canvas.addEventListener('pointerup', () => { dragSlot = null; dragOrigin = null; });

captionInput.addEventListener('input', () => { state.caption = captionInput.value; repaint(); });

layoutSelect.addEventListener('change', () => { state.layout = layoutSelect.value; repaint(); });
themeSelect.addEventListener('change', () => { state.theme = themeSelect.value; repaint(); });
secondPanelSelect.addEventListener('change', () => { state.secondPanel = secondPanelSelect.value; repaint(); });

zoomSlider.addEventListener('input', () => {
  document.getElementById('zoom-value').textContent = `${zoomSlider.value}%`;
  if (!state.photo) return;
  state.photo.zoom = Number(zoomSlider.value) / 100;
  repaint();
});
fitToggle.addEventListener('change', () => {
  if (!state.photo) return;
  state.photo.fit = fitToggle.checked ? 'fit' : 'cover';
  repaint();
});

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.size = button.dataset.size;
    sizeButtons.forEach((b) => b.classList.toggle('active', b === button));
    repaint();
    say(`Preview size: ${activeSize().label}.`);
  });
});

/** Turns the cover title into a safe file-name slug: lowercase,
 *  spaces to dashes, anything else dropped. An empty title falls back
 *  to no slug, so the file is just vice-city-cover-<size>.png. */
function slugify(text) {
  const slug = (text || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.slice(0, 40);
}

exportButton.addEventListener('click', () => {
  const size = activeSize();
  // Render at the exact export size on an offscreen canvas — never upscale.
  const out = document.createElement('canvas');
  out.width = size.w;
  out.height = size.h;
  renderCover(out, state);
  out.toBlob((blob) => {
    if (!blob) {
      say('Export failed — try again.');
      return;
    }
    const slug = slugify(state.caption);
    const fileName = slug
      ? `vice-city-cover-${slug}-${size.id}.png`
      : `vice-city-cover-${size.id}.png`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    say(`Saved ${fileName} — ${size.w} × ${size.h}.`);
  }, 'image/png');
});

// Fill the selects from the same tables the renderer uses.
for (const [id, layout] of Object.entries(LAYOUTS)) {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = layout.label;
  layoutSelect.appendChild(option);
}
for (const [id, theme] of Object.entries(THEMES)) {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = theme.label;
  themeSelect.appendChild(option);
}
for (const panelId of ['boat', 'supercar', 'neon', 'chase', 'skyline']) {
  const option = document.createElement('option');
  option.value = panelId;
  option.textContent = `${panelId} panel`;
  secondPanelSelect.appendChild(option);
}
layoutSelect.value = state.layout;
themeSelect.value = state.theme;
secondPanelSelect.value = state.secondPanel;
captionInput.value = state.caption;

const shot = new URLSearchParams(location.search).get('shot');
// Preload the vignette photos before the first paint, so the cover
// never flashes the fallback gradient. A photo that fails to load just
// falls back — the preload never rejects (see panels.js).
loadVignetteImages(loadImage).then(() => {
  if (shot) {
    runShot(shot, new URLSearchParams(location.search), state, { loadImage, loadFile, redraw: repaint, setStatus: say });
  } else {
    repaint();
    say('Load a photo to start — or try a sample below.');
  }
});

// Sample photos, free to use (made with an image model for make.fun).
document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      const img = await loadImage(`samples/${button.dataset.sample}.jpg`);
      state.photo = { img, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
      repaint();
      say(`Sample photo ${button.dataset.sample} loaded.`);
    } catch {
      say('The sample photo could not be loaded.');
    }
  });
});
