// Vice City vignettes — real photographs, not drawings.
// The panels are real, freely licensed photographs (Pexels, free licence)
// of the Vice City subjects, studied from the official GTA VI cover
// (18 June 2026, nine panels on deep violet, logo in the middle) and the
// GTA V cover (nine panels, one hexagonal wordmark tile, every panel
// pulled up to eight degrees off axis, uneven gutters that are gaps,
// not strokes). Each photo is drawn cover-fit into its tilted panel and
// graded warm (pink from the top, orange from the foot) so the whole
// cover shares one sunset light — the same grade the user's photo gets
// in cover.js drawPhotoPanel. The three rules that carry the look: big
// close-up character portraits, one warm light across every panel, and
// a logo panel in the centre instead of a caption strip below the grid.
// Photo credits are in the README (Pexels photo IDs).

/** The vignette ids the layouts use, and the photo file for each,
 *  relative to app/. `palms` is defined in the layouts but unused in
 *  any of them, so it has no photo and falls back to the gradient. */
export const VIGNETTE_PHOTOS = {
  heli: 'images/heli.jpg',
  skyline: 'images/skyline.jpg',
  boat: 'images/boat.jpg',
  producer: 'images/producer.jpg',
  robber: 'images/robber.jpg',
  bike: 'images/bike.jpg',
  supercar: 'images/supercar.jpg',
  gator: 'images/gator.jpg',
  chase: 'images/chase.jpg',
  duo: 'images/duo.jpg',
  neon: 'images/neon.jpg',
};

/** Loaded images, keyed by vignette id. Populated by loadVignetteImages. */
const cache = {};

/** The in-flight (or finished) preload, so calling this twice — once
 *  from the editor boot, once from a screenshot run — loads each photo
 *  only once. */
let loadPromise = null;

/** Preloads every vignette photo. Call once before the first repaint;
 *  a photo that fails to load leaves its panel to the fallback gradient
 *  instead of breaking the cover. */
export function loadVignetteImages(loadImage) {
  if (!loadPromise) {
    loadPromise = (async () => {
      const entries = await Promise.allSettled(
        Object.entries(VIGNETTE_PHOTOS).map(async ([id, url]) => {
          const img = await loadImage(url);
          return [id, img];
        }),
      );
      for (const entry of entries) {
        if (entry.status === 'fulfilled') cache[entry.value[0]] = entry.value[1];
      }
      return cache;
    })();
  }
  return loadPromise;
}

/** Draws one vignette photo cover-fit into the panel, with the warm
 *  sunset grade so it sits in the same light as the user's photo. */
export function drawPhotoVignette(g, x, y, w, h, t, img) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.drawImage(img, dx, dy, dw, dh);
  // Warm grade: pink from the top, orange from the foot, so the photo
  // shares the cover's sunset light instead of reading as a pasted snap.
  const wash = g.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, 'rgba(255, 46, 136, 0.14)');
  wash.addColorStop(0.5, 'rgba(255, 46, 136, 0.0)');
  wash.addColorStop(1, 'rgba(255, 122, 26, 0.16)');
  g.fillStyle = wash;
  g.fillRect(x, y, w, h);
  // A touch of contrast: darken the edges so the photo holds its frame.
  const edge = g.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.4,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.75,
  );
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(10,4,20,0.20)');
  g.fillStyle = edge;
  g.fillRect(x, y, w, h);
  g.restore();
}

/** Fallback if a photo failed to load: a warm gradient in the theme's
 *  colours, so the panel never reads as a hole. */
function drawFallback(g, x, y, w, h, t) {
  const grad = g.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, t.skyTop);
  grad.addColorStop(0.55, t.skyMid);
  grad.addColorStop(1, t.skyBot);
  g.fillStyle = grad;
  g.fillRect(x, y, w, h);
}

/** One painter per vignette id, matching the (g, x, y, w, h, t)
 *  signature renderCover calls. */
function makePainter(id) {
  return (g, x, y, w, h, t) => {
    const img = cache[id];
    if (img) drawPhotoVignette(g, x, y, w, h, t, img);
    else drawFallback(g, x, y, w, h, t);
  };
}

/** The panel painters, keyed by the vignette id the layouts use. */
export const VIGNETTES = {
  heli: makePainter('heli'),
  duo: makePainter('duo'),
  boat: makePainter('boat'),
  robber: makePainter('robber'),
  producer: makePainter('producer'),
  skyline: makePainter('skyline'),
  supercar: makePainter('supercar'),
  gator: makePainter('gator'),
  bike: makePainter('bike'),
  palms: makePainter('palms'),
  neon: makePainter('neon'),
  chase: makePainter('chase'),
};
