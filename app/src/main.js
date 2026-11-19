// Editor wiring — Vice City Cover Maker. Loads photos, keeps the live
// preview in step with every control, drags the photo inside its panel,
// and exports the cover as a PNG at the exact post size chosen.

import { THEMES, LAYOUTS, EXPORT_SIZES, defaultState, renderCover, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusLine = document.getElementById('status');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const layoutSelect = document.getElementById('layout');
const themeSelect = document.getElementById('theme');
const zoomSlider = document.getElementById('zoom');
const fitToggle = document.getElementById('fit');
const secondPanelSelect = document.getElementById('second-panel');
const sizeButtons = [...document.querySelectorAll('[data-size]')];
const exportButton = document.getElementById('export');

const state = defaultState();
let fontsReady = false;

document.fonts?.ready.then(() => { fontsReady = true; redraw(); });

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

function setStatus(text) {
  statusLine.textContent = text;
}

function currentSize() {
  return EXPORT_SIZES.find((s) => s.id === state.size) ?? EXPORT_SIZES[0];
}

function redraw() {
  const size = currentSize();
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  renderCover(canvas, state);
  canvas.setAttribute('aria-label', `Cover preview: ${state.caption || 'untitled'}`);
}

function bindPhotoInput(inputId, slot) {
  document.getElementById(inputId).addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const img = await loadFile(file);
      state[slot] = { img, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
      redraw();
      setStatus(slot === 'photo'
        ? `Main photo loaded — drag it in the hero panel to reposition.`
        : `Second photo loaded — it fills the ${state.secondPanel} panel.`);
    } catch {
      setStatus('That file could not be read as a photo. Try a JPG or PNG.');
    }
  });
}

bindPhotoInput('photo', 'photo');
bindPhotoInput('photo2', 'photo2');

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
    redraw();
    setStatus(slot === 'photo' ? 'Main photo loaded.' : 'Second photo loaded.');
  } catch {
    setStatus('That file could not be read as a photo.');
  }
});

// Drag inside the hero panel (or the second-photo panel) to reposition it.
let dragTarget = null;
let dragStart = null;
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const panel = panelAt(state, canvas.width, canvas.height, px, py);
  const layout = LAYOUTS[state.layout];
  if (panel && panel.id === layout.hero && state.photo) {
    dragTarget = 'photo';
  } else if (panel && panel.id === state.secondPanel && state.photo2) {
    dragTarget = 'photo2';
  } else {
    return;
  }
  dragStart = { x: event.clientX, y: event.clientY, ox: state[dragTarget].ox, oy: state[dragTarget].oy };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragTarget || !dragStart) return;
  const rect = canvas.getBoundingClientRect();
  const photo = state[dragTarget];
  photo.ox = dragStart.ox + ((event.clientX - dragStart.x) / rect.width) * 4;
  photo.oy = dragStart.oy + ((event.clientY - dragStart.y) / rect.height) * 4;
  photo.ox = Math.max(-1, Math.min(1, photo.ox));
  photo.oy = Math.max(-1, Math.min(1, photo.oy));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragTarget = null; dragStart = null; });

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

layoutSelect.addEventListener('change', () => { state.layout = layoutSelect.value; redraw(); });
themeSelect.addEventListener('change', () => { state.theme = themeSelect.value; redraw(); });
secondPanelSelect.addEventListener('change', () => { state.secondPanel = secondPanelSelect.value; redraw(); });

zoomSlider.addEventListener('input', () => {
  document.getElementById('zoom-value').textContent = `${zoomSlider.value}%`;
  if (!state.photo) return;
  state.photo.zoom = Number(zoomSlider.value) / 100;
  redraw();
});
fitToggle.addEventListener('change', () => {
  if (!state.photo) return;
  state.photo.fit = fitToggle.checked ? 'fit' : 'cover';
  redraw();
});

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.size = button.dataset.size;
    sizeButtons.forEach((b) => b.classList.toggle('active', b === button));
    redraw();
    setStatus(`Preview size: ${currentSize().label}.`);
  });
});

exportButton.addEventListener('click', () => {
  const size = currentSize();
  // Render at the exact export size on an offscreen canvas — never upscale.
  const out = document.createElement('canvas');
  out.width = size.w;
  out.height = size.h;
  renderCover(out, state);
  out.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed — try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${size.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Saved vice-city-cover-${size.id}.png — ${size.w} × ${size.h}.`);
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
subtitleInput.value = state.subtitle;

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, { loadImage, loadFile, redraw, setStatus });
} else {
  redraw();
  setStatus('Load a photo to start — or try a sample below.');
}

// Sample photos, free to use (made with an image model for make.fun).
document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      const img = await loadImage(`samples/${button.dataset.sample}.jpg`);
      state.photo = { img, zoom: 1, ox: 0, oy: 0, fit: 'cover' };
      redraw();
      setStatus(`Sample photo ${button.dataset.sample} loaded.`);
    } catch {
      setStatus('The sample photo could not be loaded.');
    }
  });
});
