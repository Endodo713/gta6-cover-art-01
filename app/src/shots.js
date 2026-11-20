// Fixed screenshot scenes for offline rendering against the local server.
// ?shot=cover -> cover alone with sample photo in EVERY panel + masthead once.
// ?shot=editor -> full editor page with a sample photo.
// `photo` picks samples/<photo>.jpg ; `caption` sets the words.
// window.__shotReady is set once painted.
export async function runShot(shot, query, load) {
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }

  await load(`samples/${photo}.jpg`, caption);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
