// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the exported cover alone, at the
// export size given by ?size=WxH (default 1080x1080).
// `photo` picks the sample (samples/<photo>.jpg) and `caption` the words.
// window.__shotReady is set once painted.
export async function runShot(shot, query, ctx) {
  const { state, setPhoto, captionInput, kickerInput, canvas, redraw } = ctx;
  const photo = query.get('photo') ?? 'pier';
  const text = query.get('caption') ?? 'Sunset Heist';
  const layout = query.get('layout');
  if (layout && state.layout !== undefined) state.layout = layout;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = (query.get('size') ?? '1080x1080').split('x').map(Number);
    if (size.length === 2 && size.every((n) => Number.isFinite(n) && n > 0)) {
      canvas.width = size[0];
      canvas.height = size[1];
    }
  } else if (shot === 'editor') {
    document.body.classList.add('shot-editor');
  }
  captionInput.value = text;
  state.caption = text;
  kickerInput.value = 'Neon Sunset 2026';
  state.kicker = 'Neon Sunset 2026';
  await setPhoto(0, `samples/${photo}.jpg`);
  await setPhoto(1, `samples/${photo === 'pier' ? 'boulevard' : 'pier'}.jpg`);
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
