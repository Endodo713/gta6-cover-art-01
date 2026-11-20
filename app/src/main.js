// Wires the editor: photo load, caption, layout, grade, live preview, and 3-size PNG export.
// All rendering stays local; nothing leaves the machine.
import { drawCover, exportPng } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const frame = document.getElementById('previewFrame');
const photoInput = document.getElementById('photo');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
const gradeSelect = document.getElementById('grade');
const exportBtn = document.getElementById('export');
const sizesEl = document.getElementById('sizes');

let photo = null;

function redraw() {
  drawCover(canvas, photo, captionInput.value, layoutSelect.value, gradeSelect.value);
}

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  photo = await loadImage(url);
  URL.revokeObjectURL(url);
  redraw();
});

captionInput.addEventListener('input', redraw);
layoutSelect.addEventListener('change', redraw);
gradeSelect.addEventListener('change', redraw);

/** Load an image from a URL. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Resize canvas, redraw, export, restore size. */
async function exportAt(size, name) {
  const { width: ow, height: oh } = canvas;
  canvas.width = size.w;
  canvas.height = size.h;
  frame.style.width = size.w + 'px';
  frame.style.height = size.h + 'px';
  redraw();
  await exportPng(canvas, name);
  canvas.width = ow;
  canvas.height = oh;
  frame.style.width = '';
  frame.style.height = '';
  redraw();
}

exportBtn.addEventListener('click', async () => {
  exportBtn.disabled = true;
  exportBtn.textContent = 'Exporting…';
  sizesEl.textContent = '';
  try {
    await exportAt({ w: 1080, h: 1080 }, 'cover-1080x1080.png');
    await exportAt({ w: 1080, h: 1350 }, 'cover-1080x1350.png');
    await exportAt({ w: 1920, h: 1080 }, 'cover-1920x1080.png');
    sizesEl.textContent = 'Saved: cover-1080x1080.png · cover-1080x1350.png · cover-1920x1080.png';
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = 'Export PNG';
  }
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await runShot(shot, new URLSearchParams(location.search), async (sample, text) => {
    photo = await loadImage(sample);
    captionInput.value = text;
    redraw();
  });
} else {
  redraw();
}
