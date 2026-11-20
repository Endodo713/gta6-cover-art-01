// Neon Vice main — photo load, caption, live preview, 3-size PNG export.
// Offline in the browser; photos never leave the machine.
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const caption = document.getElementById('caption');
const status = document.getElementById('status');
let photo = null;

function redraw() {
  drawCover(canvas, photo, caption.value);
}

/** Load an image from a URL. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    photo = await loadImage(URL.createObjectURL(file));
    redraw();
    status.textContent = 'Photo loaded.';
  } catch (err) {
    status.textContent = 'Gagal memuat foto: ' + err.message;
  }
});
caption.addEventListener('input', redraw);

const SIZES = [
  { name: 'cover-1080x1080.png', w: 1080, h: 1080 },
  { name: 'cover-1080x1350.png', w: 1080, h: 1350 },
  { name: 'cover-1920x1080.png', w: 1920, h: 1080 },
];

document.getElementById('export').addEventListener('click', async () => {
  if (!photo) {
    status.textContent = 'Pilih foto dulu.';
    return;
  }
  let done = 0;
  for (const { name, w, h } of SIZES) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    drawCover(off, photo, caption.value);
    const blob = await new Promise((res) => off.toBlob(res, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    done += 1;
    status.textContent = `Terexport ${done}/${SIZES.length} — ${name}`;
  }
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (sample, text) => {
    photo = await loadImage(sample);
    caption.value = text;
    redraw();
  });
} else {
  redraw();
}
