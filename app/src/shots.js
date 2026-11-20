// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone;
// ?shot=editor shows the editor with a sample photo loaded.
// `photo` picks the sample (samples/<photo>.jpg) and `caption` the words.
// window.__shotReady is set once painted so the harness can capture.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await load(`samples/${query.get('photo') ?? 'pier'}.jpg`, query.get('caption') ?? 'SUNSET HEIST');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
