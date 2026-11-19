// Neon Vice cover renderer — all art drawn in code, no external assets.
// A cover is: graded photo panels (magenta-orange-cyan sunset grade on
// near-black), white panel dividers, one huge condensed caption in
// Big Shoulders (SIL OFL), one small gold kicker. Three layouts:
//   stack  — hero on top, two panels below, caption band at the foot
//   grid   — 2x2 panels, caption band across the middle
//   strip  — hero left, two stacked panels right, caption band at the foot
// Every length is a fraction of the canvas so one draw function serves
// the live preview and all three export sizes (1080x1080, 1080x1350,
// 1920x1080).

export const LAYOUTS = {
  // cx/cy = the fraction of the photo centred in the panel (0.5 = middle);
  // zoom = default framing zoom for a panel reusing a photo.
  stack: { name: 'Sunset Stack', panels: [
    { photo: 0, x: 0, y: 0, w: 1, h: 0.545, cx: 0.5, cy: 0.35 },
    { photo: 1, x: 0, y: 0.555, w: 0.495, h: 0.26, cx: 0.5, cy: 0.3 },
    { photo: 2, x: 0.505, y: 0.555, w: 0.495, h: 0.26, cx: 0.8, cy: 0.2, zoom: 1.5 },
  ]},
  grid: { name: 'Vice Grid', panels: [
    { photo: 0, x: 0, y: 0, w: 0.495, h: 0.397, cx: 0.5, cy: 0.35 },
    { photo: 1, x: 0.505, y: 0, w: 0.495, h: 0.397, cx: 0.5, cy: 0.3 },
    { photo: 1, x: 0, y: 0.593, w: 0.495, h: 0.407, cx: 0.25, cy: 0.35, zoom: 1.5 },
    { photo: 0, x: 0.505, y: 0.593, w: 0.495, h: 0.407, cx: 0.2, cy: 0.3, zoom: 1.5 },
  ]},
  strip: { name: 'Boulevard Strip', panels: [
    { photo: 1, x: 0, y: 0, w: 0.611, h: 0.785, cx: 0.5, cy: 0.4 },
    { photo: 0, x: 0.621, y: 0, w: 0.379, h: 0.388, cx: 0.5, cy: 0.35 },
    { photo: 0, x: 0.621, y: 0.398, w: 0.379, h: 0.387, cx: 0.85, cy: 0.3, zoom: 1.6 },
  ]},
};

export const CAPTION_POSITIONS = { bottom: 'Bottom', top: 'Top' };
export const CAPTION_FONTS = {
  shoulders: { label: 'Big Shoulders', css: '"Big Shoulders", sans-serif' },
  outfit: { label: 'Outfit', css: '"Outfit", sans-serif' },
  instrument: { label: 'Instrument Sans', css: '"Instrument Sans", sans-serif' },
};

const INK = '#08040f';
const KICKER = '#ffd25a';

/** Draw one photo into a panel rect: `frame` centres photo fraction
 * (cx, cy) in the panel at `frame.zoom`; `crop` is the user's pan/zoom. */
function drawPanelPhoto(ctx, photo, rect, frame, crop) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo) {
    // Empty slot: drawn sunset sky, so the cover is complete with 0 photos.
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#ff2e82');
    sky.addColorStop(0.55, '#ff7a28');
    sky.addColorStop(1, '#2a0a4a');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffd25a';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.62, Math.min(w, h) * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  } else {
    const zoom = (frame.zoom || 1) * (crop.zoom || 1);
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * zoom;
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    let px = x + w / 2 - (frame.cx ?? 0.5) * pw - (crop.dx || 0) * w;
    let py = y + h / 2 - (frame.cy ?? 0.5) * ph - (crop.dy || 0) * h;
    // Never let the framing leave a gap at a panel edge.
    px = Math.min(Math.max(px, x + w - pw), x);
    py = Math.min(Math.max(py, y + h - ph), y);
    ctx.drawImage(photo, px, py, pw, ph);
  }
  // Sunset/neon grade: magenta top, orange middle, deep purple foot,
  // cyan lift in the highlights, vignette at the edges.
  const tint = ctx.createLinearGradient(0, y, 0, y + h);
  tint.addColorStop(0, 'rgba(255,46,130,0.34)');
  tint.addColorStop(0.5, 'rgba(255,122,40,0.26)');
  tint.addColorStop(1, 'rgba(42,10,74,0.38)');
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createRadialGradient(
    x + w / 2, y + h * 0.42, Math.min(w, h) * 0.1,
    x + w / 2, y + h * 0.42, Math.max(w, h) * 0.75,
  );
  glow.addColorStop(0, 'rgba(64,224,255,0.10)');
  glow.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** The caption band: near-black strip, huge caps, small gold kicker. */
function drawCaptionBand(ctx, w, h, band, state) {
  const text = (state.caption || '').trim().toUpperCase();
  ctx.fillStyle = INK;
  ctx.fillRect(0, band.y, w, band.h);
  // Thin neon rule along the band edge.
  const rule = ctx.createLinearGradient(0, 0, w, 0);
  rule.addColorStop(0, '#ff2e82');
  rule.addColorStop(0.5, '#ff7a28');
  rule.addColorStop(1, '#40e0ff');
  ctx.fillStyle = rule;
  ctx.fillRect(0, band.y, w, Math.max(3, h * 0.004));
  if (!text) return;
  const font = CAPTION_FONTS[state.captionFont] || CAPTION_FONTS.shoulders;
  let size = band.h * (state.captionSize / 100);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const setFont = (s) => { ctx.font = `700 ${s}px ${font.css}`; };
  setFont(size);
  const maxW = w * 0.92;
  while (ctx.measureText(text).width > maxW && size > 12) {
    size -= 2;
    setFont(size);
  }
  try { ctx.letterSpacing = `${Math.round(size * 0.01)}px`; } catch { /* older canvas */ }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8,4,15,0.9)';
  ctx.lineWidth = Math.max(2, size * 0.045);
  const cy = band.y + band.h * 0.46;
  ctx.strokeText(text, w / 2, cy);
  ctx.fillStyle = state.captionColor || '#ffffff';
  ctx.fillText(text, w / 2, cy);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  // Kicker: 2-4 words, gold, letterspaced.
  const kick = (state.kicker || '').trim().toUpperCase();
  if (kick) {
    const ks = Math.max(11, band.h * 0.13);
    ctx.font = `700 ${ks}px "Instrument Sans", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(ks * 0.32)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = KICKER;
    ctx.fillText(kick, w / 2, band.y + band.h * 0.87);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
}

/**
 * Draw the whole cover onto `canvas` (any size). `state`:
 * { photos: [img|null x3], crops: [{dx,dy,zoom} x3], layout, caption,
 *   captionSize (60-180, % of band height), captionFont, captionColor,
 *   captionPosition: 'bottom'|'top', kicker }
 * Returns the panel rects in canvas pixels (for drag hit-testing).
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  const layout = LAYOUTS[state.layout] || LAYOUTS.stack;
  const bandH = h * (state.layout === 'grid' ? 0.186 : 0.215);
  const band = state.captionPosition === 'top'
    ? { y: 0, h: bandH }
    : { y: h - bandH, h: bandH };
  // Photo area is everything outside the caption band.
  const photoTop = state.captionPosition === 'top' ? bandH : 0;
  const photoBottom = state.captionPosition === 'top' ? h : band.y;
  const div = Math.max(4, Math.round(w * 0.009));
  const rects = [];
  for (const p of layout.panels) {
    const top = Math.max(p.y * h, photoTop);
    const bottom = Math.min((p.y + p.h) * h, photoBottom);
    if (bottom - top <= 0) continue;
    rects.push({ x: p.x * w, y: top, w: p.w * w, h: bottom - top, photo: p.photo, frame: p });
  }
  for (const r of rects) {
    const photo = state.photos[r.photo] || state.photos[0] || null;
    const base = state.crops[r.photo] || { dx: 0, dy: 0, zoom: 1 };
    // A panel reusing photo 0 uses photo 0's user pan/zoom but its own
    // default framing, so one photo fills several panels differently.
    const crop = state.photos[r.photo] ? base : state.crops[0];
    drawPanelPhoto(ctx, photo, r, r.frame, crop);
  }
  // White dividers between panels.
  ctx.fillStyle = '#ffffff';
  for (const r of rects) {
    ctx.fillRect(r.x + r.w - div / 2, r.y, div, r.h);
    ctx.fillRect(r.x, r.y + r.h - div / 2, r.w, div);
  }
  drawCaptionBand(ctx, w, h, band, state);
  return rects;
}
