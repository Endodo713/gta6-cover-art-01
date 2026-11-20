// Neon Vice cover renderer — multi-panel GTA 6 poster style.
// Every panel (hero + supporting) carries the photo. Masthead drawn exactly once.
// Sunset/neon grade (magenta -> orange, cyan lift, vignette) applied evenly.
// Offline, no network, no Rockstar assets.

const MAGENTA = '#d11a5f';
const ORANGE = '#ff7a3c';
const CYAN = '#22d3ee';
const GOLD = '#f5c242';
const NEAR_BLACK = '#08040f';
const DIVIDER = 8;

/** Draw a cover onto `canvas` (already sized) using `photo` and `caption`. */
export function drawCover(canvas, photo, caption) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();

  // Background
  ctx.fillStyle = NEAR_BLACK;
  ctx.fillRect(0, 0, W, H);

  // Layout fractions
  const heroH = H * 0.50;
  const supportH = H * 0.17;
  const bandTop = heroH + DIVIDER + supportH + DIVIDER;
  const bandH = H - bandTop - 30;

  // Hero panel (full width) — syFrac 0.15 keeps faces near the top edge in frame.
  drawPanel(ctx, photo, 0, 0, W, heroH, { sxFrac: 0.50, syFrac: 0.15 });

  // Divider 1
  drawDivider(ctx, 0, heroH, W);

  // Supporting panels: two side-by-side, each carries the photo (different crop)
  const supportY = heroH + DIVIDER;
  const half = (W - DIVIDER) / 2;
  drawPanel(ctx, photo, 0, supportY, half, supportH, { sxFrac: 0.30, syFrac: 0.30 });
  drawDivider(ctx, half, supportY, DIVIDER);
  drawPanel(ctx, photo, half + DIVIDER, supportY, half, supportH, { sxFrac: 0.70, syFrac: 0.60 });

  // Caption band
  drawBand(ctx, 0, bandTop, W, bandH, caption);

  ctx.restore();
}

/** Fill a panel rect with the photo (cover-filled, cropped by crop offset) then the sunset/neon grade. */
function drawPanel(ctx, photo, x, y, w, h, crop) {
  ctx.save();
  ctx.fillStyle = NEAR_BLACK;
  ctx.fillRect(x, y, w, h);
  if (photo && photo.naturalWidth && photo.naturalHeight) {
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const maxSx = Math.max(0, photo.naturalWidth - sw);
    const maxSy = Math.max(0, photo.naturalHeight - sh);
    const sx = Math.min(Math.max(maxSx * crop.sxFrac, 0), maxSx);
    const sy = Math.min(Math.max(maxSy * crop.syFrac, 0), maxSy);
    ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h);
  }
  drawGrade(ctx, x, y, w, h);
  ctx.restore();
}

/** Sunset/neon grade: warm wash bottom, cyan highlight lift top, vignette edges. */
function drawGrade(ctx, x, y, w, h) {
  const bottom = ctx.createLinearGradient(x, y + h * 0.45, x, y + h);
  bottom.addColorStop(0, 'rgba(209, 26, 95, 0)');
  bottom.addColorStop(1, 'rgba(255, 122, 60, 0.34)');
  ctx.fillStyle = bottom;
  ctx.fillRect(x, y, w, h);

  const top = ctx.createLinearGradient(x, y, x, y + h * 0.4);
  top.addColorStop(0, 'rgba(34, 211, 238, 0.12)');
  top.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, h);

  const vig = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.85);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.50)');
  ctx.fillStyle = vig;
  ctx.fillRect(x, y, w, h);
}

/** Thin divider line between panels. */
function drawDivider(ctx, x, y, w) {
  ctx.save();
  ctx.fillStyle = 'rgba(245, 194, 66, 0.35)';
  ctx.fillRect(x, y, w, 2);
  ctx.restore();
}

/** Caption band: masthead (once) + big caption. */
function drawBand(ctx, x, y, w, h, caption) {
  const text = (caption || '').trim().toUpperCase();
  const midY = y + h * 0.42;

  // Masthead — drawn EXACTLY once, above the caption band.
  ctx.save();
  ctx.font = '700 17px "Instrument Sans", "Outfit", sans-serif';
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const masthead = 'NEON VICE / VICE CITY · 1986';
  let mSize = 17;
  ctx.font = `700 ${mSize}px "Instrument Sans", "Outfit", sans-serif`;
  let mW = ctx.measureText(masthead).width;
  while (mW > w * 0.82 && mSize > 9) {
    mSize -= 1;
    ctx.font = `700 ${mSize}px "Instrument Sans", "Outfit", sans-serif`;
    mW = ctx.measureText(masthead).width;
  }
  ctx.fillText(masthead, x + w / 2, midY - h * 0.08);
  ctx.restore();

  // Caption — level 1, huge condensed capitals.
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  let size = h * 0.55;
  ctx.font = `700 ${size}px "Big Shoulders", "Instrument Sans", sans-serif`;
  while (ctx.measureText(text).width > w * 0.94 && size > 20) {
    size -= 2;
    ctx.font = `700 ${size}px "Big Shoulders", "Instrument Sans", sans-serif`;
  }
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = size * 0.15;
  ctx.fillText(text, x + w / 2, midY + h * 0.28);
  ctx.shadowBlur = 0;
  ctx.restore();
}
