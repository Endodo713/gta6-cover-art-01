// Neon Vice renderer — multi-panel GTA 6 style cover art, all drawn offline on canvas.
// Panels, sunset/neon grade, bold condensed lettering. No Rockstar art, logo, or font.

const GRADES = {
  sunset: {
    stops: [[0, 'rgba(150, 40, 180, 0.24)'], [0.5, 'rgba(255, 110, 40, 0.28)'], [1, 'rgba(220, 60, 130, 0.32)']],
    vignette: 0.50, highlight: 'rgba(255, 140, 90, 0.08)'
  },
  neon: {
    stops: [[0, 'rgba(20, 60, 180, 0.24)'], [0.5, 'rgba(170, 40, 200, 0.28)'], [1, 'rgba(255, 20, 120, 0.32)']],
    vignette: 0.55, highlight: 'rgba(60, 200, 255, 0.10)'
  },
  midnight: {
    stops: [[0, 'rgba(40, 20, 100, 0.28)'], [0.5, 'rgba(90, 40, 160, 0.26)'], [1, 'rgba(160, 60, 200, 0.28)']],
    vignette: 0.60, highlight: 'rgba(160, 120, 255, 0.06)'
  }
};

const DIVIDER = '#1a142e';
const KICKER = 'NEON VICE';
const MASTHEAD = 'VICE CITY COVER ART';
const DATE_LINE = 'VICE CITY · 2026';

// Poster role labels per layout and caption. Real credits, not debug tags.
const ROLE_LABELS = {
  'sunset-stack': {
    default: ['HERO', 'SUPPORT', 'SUPPORT'],
    'SUNSET HEIST': ['THE ANGLER', 'THE PIER', 'THE CATCH'],
    'BOULEVARD QUEEN': ['THE BOULEVARD', 'THE QUEEN', 'THE NIGHT'],
  },
  'vice-grid': {
    default: ['HERO', 'SUPPORT', 'SUPPORT', 'SUPPORT'],
    'SUNSET HEIST': ['THE ANGLER', 'THE PIER', 'THE CATCH', 'VICE CITY'],
    'BOULEVARD QUEEN': ['THE BOULEVARD', 'THE QUEEN', 'THE NIGHT', 'NEON VICE'],
  },
  'boulevard-strip': {
    default: ['HERO', 'SUPPORT', 'SUPPORT'],
    'SUNSET HEIST': ['THE ANGLER', 'THE PIER', 'THE CATCH'],
    'BOULEVARD QUEEN': ['THE BOULEVARD', 'THE QUEEN', 'THE NIGHT'],
  }
};

function getRoleLabels(layout, caption) {
  const byLayout = ROLE_LABELS[layout] ?? ROLE_LABELS['sunset-stack'];
  const key = (caption ?? '').trim().toUpperCase();
  return byLayout[key] ?? byLayout.default;
}

/** Fit an image to fill a rect (cover), centered. Optional source crop (px). */
function drawCoverImage(ctx, img, x, y, w, h, crop) {
  if (crop) {
    const scale = Math.max(w / crop.sw, h / crop.sh);
    const dw = crop.sw * scale;
    const dh = crop.sh * scale;
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const pw = img.naturalWidth * scale;
    const ph = img.naturalHeight * scale;
    ctx.drawImage(img, x + (w - pw) / 2, y + (h - ph) / 2, pw, ph);
  }
}

/** Source crop regions (fractions of natural dims) for distinct panel framings. */
function getCrop(img, type) {
  if (!img || type === 'hero') return null;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (type === 'tight-subject') {
    return { sx: w * 0.30, sy: h * 0.18, sw: w * 0.40, sh: h * 0.62 };
  }
  if (type === 'scenery') {
    return { sx: w * 0.42, sy: h * 0.42, sw: w * 0.52, sh: h * 0.52 };
  }
  return null;
}

/** Soft vignette (darker corners). */
function vignette(ctx, x, y, w, h, amount) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.sqrt(w * w + h * h) / 1.6);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${amount})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Corner sun accent — small, top-right of hero panel, low opacity, soft edge. */
function diagonalSun(ctx, x, y, w, h, color) {
  const size = w * 0.26;
  ctx.save();
  ctx.translate(x + w - size * 0.55, y + size * 0.55);
  ctx.rotate(-0.22);
  const grad = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size * 0.75);
  grad.addColorStop(0, `${color}66`);
  grad.addColorStop(0.5, `${color}33`);
  grad.addColorStop(1, `${color}00`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Shrink caption to fit width. */
function fitSize(ctx, text, maxSize, minSize, maxWidth) {
  let size = maxSize;
  ctx.font = `900 ${size}px 'Big Shoulders', 'Instrument Sans', sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `900 ${size}px 'Big Shoulders', 'Instrument Sans', sans-serif`;
  }
  return size;
}

/** Proper circular gold seal: ring + rays + centre disc + tiny text. */
function drawSeal(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  // outer ring
  ctx.strokeStyle = '#ffd25a';
  ctx.lineWidth = size * 0.10;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  // inner ring
  ctx.strokeStyle = '#ffd25a';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.27, 0, Math.PI * 2);
  ctx.stroke();
  // rays around the edge
  ctx.strokeStyle = '#ffd25a';
  ctx.lineWidth = size * 0.035;
  const rays = 14;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const r1 = size * 0.30;
    const r2 = size * 0.43;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
    ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
    ctx.stroke();
  }
  // centre disc
  ctx.fillStyle = '#07050f';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.17, 0, Math.PI * 2);
  ctx.fill();
  // tiny text around top
  ctx.fillStyle = '#ffd25a';
  ctx.font = `700 ${Math.max(10, size * 0.075)}px 'Instrument Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEON VICE', 0, -size * 0.32);
  ctx.fillText('COVER ART', 0, size * 0.32);
  ctx.restore();
}

/** Small poster role label, letterspaced, tucked in a panel corner. */
function drawRoleLabel(ctx, x, y, w, h, role) {
  ctx.save();
  ctx.translate(x + 10, y + 10);
  ctx.rotate(-0.02);
  ctx.fillStyle = 'rgba(255, 210, 90, 0.92)';
  ctx.font = `700 ${Math.max(11, w * 0.045)}px 'Instrument Sans', sans-serif`;
  ctx.textAlign = 'left';
  const spaced = role.split('').join(' ');
  ctx.fillText(spaced, 0, 0);
  ctx.restore();
}

/** Apply the Neon Vice grade wash evenly over a photo panel. */
function applyPanelGrade(ctx, x, y, w, h, grade) {
  const g = GRADES[grade];
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  g.stops.forEach(([p, c]) => grad.addColorStop(p, c));
  ctx.fillStyle = grad;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Draws a multi-panel cover onto `canvas` at its own size.
 * layout: 'sunset-stack' | 'vice-grid' | 'boulevard-strip'
 * grade: one of GRADES keys
 */
export function drawCover(canvas, photo, caption, layout, grade) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const g = GRADES[grade] ?? GRADES.sunset;
  const text = (caption ?? '').trim().toUpperCase() || 'SUNSET HEIST';
  const roles = getRoleLabels(layout, text);

  // Base: near-black.
  ctx.fillStyle = '#07050f';
  ctx.fillRect(0, 0, W, H);

  const panelH = H * 0.68;   // panels occupy top ~68%
  const bandH = H - panelH;  // caption band bottom ~32%

  // --- grade wash across whole canvas (sky) ---
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  g.stops.forEach(([p, c]) => wash.addColorStop(p, c));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  // --- panels ---
  const gap = 14;
  const pad = 26;
  const innerW = W - pad * 2;
  const innerH = panelH - pad * 2;

  const drawPanel = (x, y, w, h, img, cropType, role) => {
    ctx.save();
    ctx.fillStyle = '#030208';
    ctx.fillRect(x, y, w, h);
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, w - 4, h - 4);
      ctx.clip();
      drawCoverImage(ctx, img, x + 2, y + 2, w - 4, h - 4, getCrop(img, cropType));
      ctx.restore();
      // grade wash over the photo
      applyPanelGrade(ctx, x + 2, y + 2, w - 4, h - 4, grade);
    }
    vignette(ctx, x, y, w, h, g.vignette);
    ctx.restore();
    ctx.strokeStyle = DIVIDER;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    if (role) drawRoleLabel(ctx, x, y, w, h, role);
  };

  let panelIdx = 0;
  if (layout === 'sunset-stack') {
    const heroH = panelH * 0.52;
    const halfH = (panelH - heroH - gap) / 2;
    const colW = (innerW - gap) / 2;

    drawPanel(pad, pad, innerW, heroH, photo, 'hero', roles[0]);
    diagonalSun(ctx, pad, pad, innerW, heroH, '#ff3b6b');

    drawPanel(pad, pad + heroH + gap, colW, halfH, photo, 'tight-subject', roles[1]);
    drawPanel(pad + colW + gap, pad + heroH + gap, colW, halfH, photo, 'scenery', roles[2]);
  } else if (layout === 'vice-grid') {
    const halfW = (innerW - gap) / 2;
    const halfH = (innerH - gap) / 2;
    const crops = ['hero', 'tight-subject', 'scenery', 'tight-subject'];
    drawPanel(pad, pad, halfW, halfH, photo, crops[0], roles[0]);
    drawPanel(pad + halfW + gap, pad, halfW, halfH, photo, crops[1], roles[1]);
    drawPanel(pad, pad + halfH + gap, halfW, halfH, photo, crops[2], roles[2]);
    drawPanel(pad + halfW + gap, pad + halfH + gap, halfW, halfH, photo, crops[3], roles[3]);
  } else {
    const heroW = innerW * 0.62;
    const rightW = innerW - heroW - gap;
    const rightH = (innerH - gap) / 2;
    drawPanel(pad, pad, heroW, innerH, photo, 'hero', roles[0]);
    diagonalSun(ctx, pad, pad, heroW, innerH, '#ff3b6b');
    drawPanel(pad + heroW + gap, pad, rightW, rightH, photo, 'tight-subject', roles[1]);
    drawPanel(pad + heroW + gap, pad + rightH + gap, rightW, rightH, photo, 'scenery', roles[2]);
  }

  // --- masthead line above caption band (visible, newspaper-style) ---
  ctx.fillStyle = '#ffd25a';
  ctx.font = `700 18px 'Instrument Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(MASTHEAD, W / 2, panelH + 30);

  // --- caption band (tightened) ---
  ctx.fillStyle = '#030208';
  ctx.fillRect(0, panelH, W, bandH);
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, panelH);
  ctx.lineTo(W, panelH);
  ctx.stroke();

  // kicker
  ctx.fillStyle = '#ffd25a';
  ctx.font = `700 20px 'Instrument Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(KICKER, W / 2, panelH + 56);

  // caption — big, bold, condensed
  const capSize = fitSize(ctx, text, H * 0.16, 30, W * 0.92);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = capSize * 0.25;
  ctx.fillText(text, W / 2, panelH + bandH * 0.58);
  ctx.shadowBlur = 0;

  // date line
  ctx.fillStyle = '#9a93b0';
  ctx.font = `500 14px 'Instrument Sans', sans-serif`;
  ctx.fillText(DATE_LINE, W / 2, panelH + bandH * 0.84);

  // gold seal (proper circular seal, bottom right of caption band)
  drawSeal(ctx, W - 66, panelH + bandH - 52, 60);
}

/** Export canvas to PNG blob then download. */
export function exportPng(canvas, name) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('toBlob returned null'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      resolve(blob);
    }, 'image/png');
  });
}
