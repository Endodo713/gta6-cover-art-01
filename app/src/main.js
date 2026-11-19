// Neon Vice — wires the editor: photo slots, layout, caption, crop, export.
// Photos are read with FileReader into object URLs and drawn on a local
// canvas only; nothing is uploaded anywhere. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js).
import { drawCover, LAYOUTS, CAPTION_FONTS, CAPTION_POSITIONS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const captionInput = document.getElementById('caption');
const kickerInput = document.getElementById('kicker');
const sizeInput = document.getElementById('caption-size');
const sizeValue = document.getElementById('caption-size-value');
const fontSelect = document.getElementById('caption-font');
const colorInput = document.getElementById('caption-color');
const posSelect = document.getElementById('caption-position');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');
const exportSize = document.getElementById('export-size');
const tray = document.getElementById('tray');
const layoutRow = document.getElementById('layout-row');

export const EXPORT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

// state.photos[i] is the image for slot i (null = empty slot).
// state.crops[i] is that slot's pan/zoom; the selected panel edits it.
const state = {
  photos: [null, null, null],
  crops: [{ dx: 0, dy: 0, zoom: 1 }, { dx: 0, dy: 0, zoom: 1 }, { dx: 0, dy: 0, zoom: 1 }],
  layout: 'stack',
  caption: 'Sunset Heist',
  captionSize: 62,
  captionFont: 'shoulders',
  captionColor: '#ffffff',
  captionPosition: 'bottom',
  kicker: 'Neon Sunset 2026',
  selectedPhoto: 0,
};

let panelRects = [];
let drag = null;

function redraw() {
  panelRects = drawCover(canvas, state);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Set a photo slot from a File (upload) or a URL (sample / shot). */
export async function setPhoto(slot, source) {
  const img = typeof source === 'string' ? await loadImage(source) : source;
  state.photos[slot] = img;
  state.crops[slot] = { dx: 0, dy: 0, zoom: 1 };
  state.selectedPhoto = slot;
  renderTray();
  syncZoom();
  redraw();
}

function renderTray() {
  tray.querySelectorAll('.slot').forEach((el, i) => {
    el.classList.toggle('has-photo', !!state.photos[i]);
    el.classList.toggle('selected', state.selectedPhoto === i);
    el.querySelector('.slot-label').textContent = state.photos[i] ? `Photo ${i + 1}` : `Empty ${i + 1}`;
  });
}

function syncZoom() {
  const z = state.crops[state.selectedPhoto].zoom;
  zoomInput.value = Math.round(z * 100);
  zoomValue.textContent = `${Math.round(z * 100)}%`;
}

// --- Photo slots -------------------------------------------------------
tray.querySelectorAll('.slot').forEach((el, i) => {
  el.addEventListener('click', () => {
    state.selectedPhoto = i;
    renderTray();
    syncZoom();
    redraw();
  });
});
document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    await setPhoto(state.selectedPhoto, url);
    statusEl.textContent = `Photo ${state.selectedPhoto + 1} loaded — it never leaves this device.`;
  } catch {
    statusEl.textContent = 'That file could not be read as an image.';
  }
  e.target.value = '';
});
document.getElementById('load-samples').addEventListener('click', async () => {
  await setPhoto(0, 'samples/pier.jpg');
  await setPhoto(1, 'samples/boulevard.jpg');
  statusEl.textContent = 'Sample photos loaded (free to use).';
});

// --- Layout ------------------------------------------------------------
for (const [key, layout] of Object.entries(LAYOUTS)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'layout-btn';
  b.dataset.layout = key;
  b.textContent = layout.name;
  b.setAttribute('aria-pressed', key === state.layout ? 'true' : 'false');
  b.addEventListener('click', () => {
    state.layout = key;
    layoutRow.querySelectorAll('.layout-btn').forEach((x) =>
      x.setAttribute('aria-pressed', x.dataset.layout === key ? 'true' : 'false'));
    redraw();
  });
  layoutRow.appendChild(b);
}

// --- Caption -----------------------------------------------------------
captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
kickerInput.addEventListener('input', () => { state.kicker = kickerInput.value; redraw(); });
sizeInput.addEventListener('input', () => {
  state.captionSize = Number(sizeInput.value);
  sizeValue.textContent = `${state.captionSize}%`;
  redraw();
});
for (const [key, f] of Object.entries(CAPTION_FONTS)) {
  const o = document.createElement('option');
  o.value = key;
  o.textContent = f.label;
  fontSelect.appendChild(o);
}
fontSelect.addEventListener('change', () => { state.captionFont = fontSelect.value; redraw(); });
colorInput.addEventListener('input', () => { state.captionColor = colorInput.value; redraw(); });
for (const [key, label] of Object.entries(CAPTION_POSITIONS)) {
  const o = document.createElement('option');
  o.value = key;
  o.textContent = label;
  posSelect.appendChild(o);
}
posSelect.addEventListener('change', () => { state.captionPosition = posSelect.value; redraw(); });

// --- Crop: drag a panel to pan its photo, slider/wheel to zoom ---------
function panelAt(cx, cy) {
  const r = canvas.getBoundingClientRect();
  const x = (cx - r.left) * (canvas.width / r.width);
  const y = (cy - r.top) * (canvas.height / r.height);
  return panelRects.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) || null;
}
canvas.addEventListener('pointerdown', (e) => {
  const p = panelAt(e.clientX, e.clientY);
  if (!p) return;
  const slot = state.photos[p.photo] ? p.photo : 0;
  state.selectedPhoto = slot;
  renderTray();
  syncZoom();
  canvas.setPointerCapture(e.pointerId);
  drag = { slot, x: e.clientX, y: e.clientY, dx: state.crops[slot].dx, dy: state.crops[slot].dy };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const crop = state.crops[drag.slot];
  crop.dx = drag.dx - ((e.clientX - drag.x) / r.width) * (canvas.width / canvas.height) * 0.9;
  crop.dy = drag.dy - ((e.clientY - drag.y) / r.height) * 0.9;
  crop.dx = Math.max(-0.6, Math.min(0.6, crop.dx));
  crop.dy = Math.max(-0.6, Math.min(0.6, crop.dy));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = panelAt(e.clientX, e.clientY);
  if (!p) return;
  const slot = state.photos[p.photo] ? p.photo : 0;
  const crop = state.crops[slot];
  crop.zoom = Math.max(1, Math.min(3, crop.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  state.selectedPhoto = slot;
  renderTray();
  syncZoom();
  redraw();
}, { passive: false });
zoomInput.addEventListener('input', () => {
  const crop = state.crops[state.selectedPhoto];
  crop.zoom = Number(zoomInput.value) / 100;
  zoomValue.textContent = `${zoomInput.value}%`;
  redraw();
});

// --- Export ------------------------------------------------------------
document.getElementById('export').addEventListener('click', () => {
  const [w, h] = EXPORT_SIZES[exportSize.value] || EXPORT_SIZES['1080x1080'];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { statusEl.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-vice-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved neon-vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

// --- Boot --------------------------------------------------------------
async function boot() {
  try {
    await document.fonts.load('700 100px "Big Shoulders"');
    await document.fonts.load('700 40px "Instrument Sans"');
    await document.fonts.load('700 40px "Outfit"');
  } catch { /* fonts fall back to system sans */ }
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      state, setPhoto, captionInput, kickerInput, canvas, redraw,
    });
  } else {
    // First paint already shows a finished cover from the free samples.
    await setPhoto(0, 'samples/pier.jpg');
    await setPhoto(1, 'samples/boulevard.jpg');
  }
  redraw();
}
boot();
