// Vice City vignettes, redrawn from the real GTA covers.
// Every panel is an original Canvas drawing in the hand-inked comic style
// Rockstar's covers use (Stephen Bliss tradition): bold black outlines,
// blocked shadows, hard rim light, saturated colour, subjects that fill
// the frame. Nothing here copies Rockstar artwork; these are new drawings
// built from the covers' grammar, studied from the official GTA VI cover
// (18 June 2026, nine panels on deep violet, logo in the middle) and the
// GTA V cover (nine panels, one hexagonal wordmark tile, every panel
// pulled up to eight degrees off axis, uneven gutters that are gaps,
// not strokes). The three rules that carry the look: big close-up
// character portraits, one warm light across every panel, and a logo
// panel in the centre instead of a caption strip below the grid.

function pen(g) {
  g.lineJoin = 'round';
  g.lineCap = 'round';
}

/** Warm sunset wash, top to bottom. */
function sunsetSky(g, x, y, w, h, t) {
  const sky = g.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, t.skyTop);
  sky.addColorStop(0.55, t.skyMid);
  sky.addColorStop(1, t.skyBot);
  g.fillStyle = sky;
  g.fillRect(x, y, w, h);
}

/** The low retro sun: a disc with slats cut across it. */
function lowSun(g, x, y, w, h, t) {
  const r = Math.min(w, h) * 0.3;
  const cx = x + w * 0.68;
  const cy = y + h * 0.42;
  g.fillStyle = t.sun;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = Math.max(2, w * 0.02);
  g.strokeStyle = t.outline;
  g.stroke();
  g.fillStyle = t.skyBot;
  for (let i = 0; i < 3; i++) {
    const sy = cy + r * (0.08 + i * 0.3);
    g.fillRect(cx - r, sy, r * 2, r * 0.09);
  }
}

/** A row of dark towers with lit windows, rooted on the panel's base. */
function towerRow(g, x, y, w, h, t, seed) {
  const base = y + h;
  let px = x;
  let i = 0;
  while (px < x + w) {
    const bw = w * (0.13 + ((seed + i * 7) % 5) * 0.03);
    const bh = h * (0.34 + ((seed + i * 13) % 7) * 0.08);
    g.fillStyle = t.tower;
    g.fillRect(px, base - bh, bw, bh);
    g.lineWidth = Math.max(1.5, w * 0.012);
    g.strokeStyle = t.outline;
    g.strokeRect(px, base - bh, bw, bh);
    g.fillStyle = t.window;
    const cols = Math.max(1, Math.floor(bw / (w * 0.05)));
    const rows = Math.max(1, Math.floor(bh / (h * 0.13)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if ((c * 3 + r * 5 + seed + i) % 4 === 0) {
          g.fillRect(px + bw * 0.18 + c * w * 0.05, base - bh + h * 0.07 + r * h * 0.13, w * 0.022, h * 0.05);
        }
      }
    }
    if (i % 3 === 1) {
      g.strokeStyle = t.outline;
      g.lineWidth = Math.max(1.5, w * 0.012);
      g.beginPath();
      g.moveTo(px + bw / 2, base - bh);
      g.lineTo(px + bw / 2, base - bh - h * 0.15);
      g.stroke();
      g.fillStyle = t.accent;
      g.beginPath();
      g.arc(px + bw / 2, base - bh - h * 0.17, Math.max(2, w * 0.014), 0, Math.PI * 2);
      g.fill();
    }
    px += bw + w * 0.02;
    i++;
  }
}

/** One palm: a leaning trunk and six drooping fronds, plus coconuts. */
function palmTree(g, bx, by, height, lean, t, w) {
  const s = Math.min(w, height);
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(3, s * 0.045);
  g.beginPath();
  g.moveTo(bx, by);
  g.quadraticCurveTo(bx + lean * height * 0.4, by - height * 0.6, bx + lean * height, by - height);
  g.stroke();
  const tx = bx + lean * height;
  const ty = by - height;
  g.lineWidth = Math.max(2, s * 0.03);
  for (let i = 0; i < 6; i++) {
    const a = (-0.15 - i * 0.32) + (lean > 0 ? 0.5 : 0);
    const len = height * (0.34 - (i % 2) * 0.06);
    g.beginPath();
    g.moveTo(tx, ty);
    g.quadraticCurveTo(
      tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.5 - height * 0.08,
      tx + Math.cos(a) * len, ty + Math.sin(a) * len + height * 0.12,
    );
    g.stroke();
  }
  g.fillStyle = t.outline;
  g.beginPath();
  g.arc(tx - 4, ty + 4, Math.max(2, s * 0.03), 0, Math.PI * 2);
  g.arc(tx + 4, ty + 5, Math.max(2, s * 0.03), 0, Math.PI * 2);
  g.fill();
}

/** A comic car wheel: dark tyre, light rim, grey hub. */
function comicWheel(g, cx, cy, r, w) {
  g.fillStyle = '#0c0c10';
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#e8e8e8';
  g.lineWidth = Math.max(1.5, w * 0.01);
  g.stroke();
  g.fillStyle = '#9aa0aa';
  g.beginPath();
  g.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  g.fill();
}

/** Top-left tradition, on every GTA cover since GTA III: a police
 *  helicopter over the waterfront skyline. The Sea Sparrow here is drawn
 *  big, nose to the right, blue glass canopy catching the sun. */
export function drawHelicopterPanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h, t);
  lowSun(g, x, y, w, h * 0.75, t);
  towerRow(g, x, y + h * 0.5, w, h * 0.5, t, 3);
  // Water at the base.
  const sea = g.createLinearGradient(x, y + h * 0.82, x, y + h);
  sea.addColorStop(0, t.seaTop);
  sea.addColorStop(1, t.seaBot);
  g.fillStyle = sea;
  g.fillRect(x, y + h * 0.82, w, h * 0.18);
  // The helicopter, large in the frame.
  const cx = x + w * 0.5;
  const cy = y + h * 0.36;
  const s = Math.min(w, h);
  g.fillStyle = t.heli;
  g.strokeStyle = t.outline;
  // Rotor blur: a translucent disc above the mast.
  g.fillStyle = 'rgba(20,10,30,0.28)';
  g.beginPath();
  g.ellipse(cx, cy - s * 0.2, s * 0.48, s * 0.05, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = t.heli;
  g.lineWidth = Math.max(3, s * 0.03);
  g.beginPath();
  g.moveTo(cx - s * 0.38, cy - s * 0.2);
  g.lineTo(cx + s * 0.4, cy - s * 0.24);
  g.stroke();
  g.beginPath();
  g.moveTo(cx, cy - s * 0.2);
  g.lineTo(cx, cy - s * 0.06);
  g.stroke();
  // Body: rounded cabin, glass canopy, tail boom to the left.
  g.lineWidth = Math.max(2, s * 0.02);
  g.beginPath();
  g.moveTo(cx - s * 0.3, cy + s * 0.02);
  g.lineTo(cx - s * 0.12, cy - s * 0.06);
  g.lineTo(cx + s * 0.12, cy - s * 0.06);
  g.lineTo(cx + s * 0.22, cy + s * 0.04);
  g.lineTo(cx + s * 0.12, cy + s * 0.13);
  g.lineTo(cx - s * 0.22, cy + s * 0.13);
  g.closePath();
  g.fill();
  g.stroke();
  // Blue glass canopy with a sun glint.
  g.fillStyle = '#2e7fd6';
  g.beginPath();
  g.moveTo(cx + s * 0.02, cy - s * 0.04);
  g.lineTo(cx + s * 0.14, cy - s * 0.04);
  g.lineTo(cx + s * 0.17, cy + s * 0.04);
  g.lineTo(cx + s * 0.02, cy + s * 0.05);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.beginPath();
  g.moveTo(cx + s * 0.05, cy - s * 0.03);
  g.lineTo(cx + s * 0.09, cy - s * 0.03);
  g.lineTo(cx + s * 0.07, cy + s * 0.02);
  g.closePath();
  g.fill();
  // Tail boom, tail rotor, floats.
  g.fillStyle = t.heli;
  g.beginPath();
  g.moveTo(cx - s * 0.28, cy + s * 0.04);
  g.lineTo(cx - s * 0.48, cy - s * 0.03);
  g.lineTo(cx - s * 0.48, cy + s * 0.06);
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = Math.max(2, s * 0.018);
  g.beginPath();
  g.moveTo(cx - s * 0.48, cy - s * 0.06);
  g.lineTo(cx - s * 0.48, cy + s * 0.08);
  g.stroke();
  g.fillStyle = '#c8ccd4';
  g.beginPath();
  g.ellipse(cx - s * 0.05, cy + s * 0.2, s * 0.3, s * 0.05, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = t.outline;
  g.stroke();
  // Searchlight cone cutting down to the water.
  g.fillStyle = 'rgba(255, 240, 180, 0.32)';
  g.beginPath();
  g.moveTo(cx + s * 0.06, cy + s * 0.13);
  g.lineTo(cx - s * 0.1, y + h);
  g.lineTo(cx + s * 0.24, y + h);
  g.closePath();
  g.fill();
}

/** The duo, top centre, as on the official GTA VI cover: two figures
 *  close together, facing the viewer, the woman in front, the man
 *  behind her with a pistol at his shoulder. Bold flat shapes, hard rim
 *  light on one side of each face, palm silhouettes behind them. */
export function drawDuoPanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h, t);
  // Palm silhouettes behind the pair.
  g.strokeStyle = 'rgba(18,8,31,0.55)';
  g.lineWidth = Math.max(3, w * 0.02);
  palmTree(g, x + w * 0.12, y + h * 0.55, h * 0.5, -0.2, { ...t, outline: 'rgba(18,8,31,0.55)' }, w);
  palmTree(g, x + w * 0.92, y + h * 0.55, h * 0.45, 0.22, { ...t, outline: 'rgba(18,8,31,0.55)' }, w);
  const s = Math.min(w, h);
  // The man, behind and to the right: head, short hair, tank top, pistol.
  const mx = x + w * 0.66;
  const my = y + h * 0.34;
  g.fillStyle = '#c98a5e';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  g.beginPath();
  g.ellipse(mx, my, w * 0.13, h * 0.17, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Short dark hair + stubble jaw.
  g.fillStyle = '#241a12';
  g.beginPath();
  g.ellipse(mx, my - h * 0.1, w * 0.13, h * 0.09, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = 'rgba(36,26,18,0.5)';
  g.beginPath();
  g.ellipse(mx, my + h * 0.12, w * 0.11, h * 0.07, 0, 0, Math.PI);
  g.fill();
  // Rim light on the man's right cheek.
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(2, s * 0.018);
  g.beginPath();
  g.arc(mx, my, w * 0.13, -0.6, 0.9);
  g.stroke();
  // Eyes: two dark slits under a heavy brow.
  g.fillStyle = t.outline;
  g.fillRect(mx - w * 0.07, my - h * 0.015, w * 0.045, h * 0.012);
  g.fillRect(mx + w * 0.025, my - h * 0.015, w * 0.045, h * 0.012);
  // Tank top + a pistol held up at his shoulder.
  g.fillStyle = '#e8e4da';
  g.beginPath();
  g.moveTo(mx - w * 0.2, y + h);
  g.lineTo(mx - w * 0.16, my + h * 0.22);
  g.lineTo(mx + w * 0.16, my + h * 0.22);
  g.lineTo(mx + w * 0.2, y + h);
  g.closePath();
  g.fill();
  g.strokeStyle = t.outline;
  g.stroke();
  g.fillStyle = '#1a1a22';
  g.save();
  g.translate(mx + w * 0.14, my + h * 0.16);
  g.rotate(-0.5);
  g.fillRect(-w * 0.02, -h * 0.09, w * 0.05, h * 0.2);
  g.fillRect(-w * 0.02, h * 0.08, w * 0.035, h * 0.07);
  g.restore();
  // The woman, in front and to the left: dark wavy hair, face, dark top.
  const wx = x + w * 0.36;
  const wy = y + h * 0.42;
  g.fillStyle = '#2a1420';
  g.beginPath();
  g.ellipse(wx, wy - h * 0.06, w * 0.2, h * 0.26, 0.12, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#d9a17c';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  g.beginPath();
  g.ellipse(wx, wy, w * 0.115, h * 0.155, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Hair falling over one side of her face.
  g.fillStyle = '#2a1420';
  g.beginPath();
  g.ellipse(wx - w * 0.09, wy - h * 0.02, w * 0.05, h * 0.14, 0.25, 0, Math.PI * 2);
  g.fill();
  // Rim light on her left cheek, eyes, lips.
  g.strokeStyle = '#ff7a9e';
  g.lineWidth = Math.max(2, s * 0.018);
  g.beginPath();
  g.arc(wx, wy, w * 0.115, Math.PI * 0.6, Math.PI * 1.35);
  g.stroke();
  g.fillStyle = t.outline;
  g.fillRect(wx - w * 0.065, wy - h * 0.01, w * 0.04, h * 0.012);
  g.fillRect(wx + w * 0.025, wy - h * 0.01, w * 0.04, h * 0.012);
  g.fillStyle = '#a83a4e';
  g.beginPath();
  g.ellipse(wx, wy + h * 0.075, w * 0.032, h * 0.014, 0, 0, Math.PI * 2);
  g.fill();
  // Her dark top + a gold hoop earring.
  g.fillStyle = '#3a2a4d';
  g.beginPath();
  g.moveTo(wx - w * 0.2, y + h);
  g.lineTo(wx - w * 0.15, wy + h * 0.2);
  g.lineTo(wx + w * 0.15, wy + h * 0.2);
  g.lineTo(wx + w * 0.2, y + h);
  g.closePath();
  g.fill();
  g.strokeStyle = t.outline;
  g.stroke();
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(1.5, s * 0.012);
  g.beginPath();
  g.arc(wx - w * 0.115, wy + h * 0.03, w * 0.02, 0, Math.PI * 2);
  g.stroke();
}

/** A speedboat from a high angle, wake behind it, a pink flamingo
 *  crossing overhead — the top-right panel of the official GTA VI cover. */
export function drawSpeedboatPanel(g, x, y, w, h, t) {
  pen(g);
  // Bright teal water fills most of the panel; a strip of sky at top.
  const sea = g.createLinearGradient(x, y, x, y + h);
  sea.addColorStop(0, '#19b8c9');
  sea.addColorStop(0.5, '#0e7d9e');
  sea.addColorStop(1, '#0a4a6e');
  g.fillStyle = sea;
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 5; i++) {
    const wy = y + h * (0.2 + i * 0.15);
    g.fillRect(x + w * (0.08 + (i % 3) * 0.3), wy, w * 0.16, h * 0.012);
  }
  // The flamingo, big, crossing the top of the frame.
  const fx = x + w * 0.62;
  const fy = y + h * 0.18;
  const s = Math.min(w, h);
  g.fillStyle = '#ff5e8a';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.018);
  g.beginPath();
  g.moveTo(fx - w * 0.22, fy);
  g.quadraticCurveTo(fx - w * 0.05, fy - h * 0.14, fx + w * 0.16, fy - h * 0.02);
  g.lineTo(fx + w * 0.2, fy + h * 0.05);
  g.lineTo(fx - w * 0.05, fy + h * 0.04);
  g.closePath();
  g.fill();
  g.stroke();
  // Neck + head, beak down.
  g.lineWidth = Math.max(2, s * 0.016);
  g.beginPath();
  g.moveTo(fx + w * 0.16, fy - h * 0.02);
  g.quadraticCurveTo(fx + w * 0.3, fy - h * 0.08, fx + w * 0.3, fy + h * 0.04);
  g.stroke();
  g.fillStyle = '#ff5e8a';
  g.beginPath();
  g.arc(fx + w * 0.3, fy + h * 0.06, w * 0.03, 0, Math.PI * 2);
  g.fill();
  // Legs trailing.
  g.strokeStyle = '#ff5e8a';
  g.beginPath();
  g.moveTo(fx - w * 0.18, fy + h * 0.03);
  g.lineTo(fx - w * 0.3, fy + h * 0.16);
  g.moveTo(fx - w * 0.14, fy + h * 0.04);
  g.lineTo(fx - w * 0.26, fy + h * 0.17);
  g.stroke();
  // The boat, large, nose down-right, white hull with a blue stripe.
  const bx = x + w * 0.12;
  const by = y + h * 0.52;
  const bw = w * 0.72;
  const bh = h * 0.2;
  g.fillStyle = '#f4f1e8';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(bx, by);
  g.lineTo(bx + bw * 0.55, by - bh * 0.5);
  g.lineTo(bx + bw, by + bh * 0.3);
  g.lineTo(bx + bw * 0.9, by + bh);
  g.lineTo(bx + bw * 0.1, by + bh);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#2e5fd6';
  g.fillRect(bx + bw * 0.12, by + bh * 0.5, bw * 0.7, bh * 0.22);
  // Passengers: three small heads in the cockpit.
  g.fillStyle = '#8a5a3a';
  for (const px of [0.4, 0.52, 0.64]) {
    g.beginPath();
    g.arc(bx + bw * px, by - bh * 0.18, bh * 0.2, 0, Math.PI * 2);
    g.fill();
  }
  // Wake: white chevrons fanning behind the stern.
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = Math.max(2, w * 0.015);
  for (let i = 0; i < 3; i++) {
    const wy = y + h * (0.72 + i * 0.08);
    g.beginPath();
    g.moveTo(x + w * 0.1, wy);
    g.lineTo(x + w * 0.42, wy + h * 0.04);
    g.lineTo(x + w * 0.78, wy);
    g.stroke();
  }
}

/** The bank robber, middle right: a man with long dark hair and
 *  sunglasses, a light jacket, an assault rifle held across his body,
 *  a bank facade behind him. */
export function drawRobberPanel(g, x, y, w, h, t) {
  pen(g);
  // Bank facade: warm columns and a sign band.
  g.fillStyle = '#e8a35c';
  g.fillRect(x, y, w, h);
  g.fillStyle = '#c97e3e';
  for (let i = 0; i < 4; i++) {
    g.fillRect(x + w * (0.08 + i * 0.24), y, w * 0.09, h);
  }
  g.fillStyle = '#7a2e4d';
  g.fillRect(x, y + h * 0.08, w, h * 0.12);
  g.fillStyle = '#ffd23e';
  g.font = `700 ${Math.max(12, h * 0.07)}px system-ui, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('BANK', x + w * 0.5, y + h * 0.14);
  const s = Math.min(w, h);
  // The man: big head, long dark hair, sunglasses, light jacket.
  const mx = x + w * 0.5;
  const my = y + h * 0.36;
  g.fillStyle = '#1e1410';
  g.beginPath();
  g.ellipse(mx, my - h * 0.02, w * 0.22, h * 0.3, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#c98a5e';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  g.beginPath();
  g.ellipse(mx, my, w * 0.17, h * 0.22, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Hair over the shoulders.
  g.fillStyle = '#1e1410';
  g.beginPath();
  g.ellipse(mx - w * 0.12, my + h * 0.14, w * 0.05, h * 0.14, 0.2, 0, Math.PI * 2);
  g.ellipse(mx + w * 0.12, my + h * 0.14, w * 0.05, h * 0.14, -0.2, 0, Math.PI * 2);
  g.fill();
  // Sunglasses: one dark bar with two lenses.
  g.fillStyle = '#101018';
  g.beginPath();
  g.roundRect(mx - w * 0.14, my - h * 0.03, w * 0.28, h * 0.06, h * 0.025);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fillRect(mx - w * 0.08, my - h * 0.02, w * 0.03, h * 0.015);
  // Beard + rim light.
  g.fillStyle = 'rgba(30,20,16,0.55)';
  g.beginPath();
  g.ellipse(mx, my + h * 0.11, w * 0.1, h * 0.06, 0, 0, Math.PI);
  g.fill();
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(2, s * 0.016);
  g.beginPath();
  g.arc(mx, my, w * 0.12, -0.5, 0.8);
  g.stroke();
  // Light jacket + a rifle held diagonally across the body.
  g.fillStyle = '#d8d2c4';
  g.beginPath();
  g.moveTo(mx - w * 0.32, y + h);
  g.lineTo(mx - w * 0.26, my + h * 0.2);
  g.lineTo(mx + w * 0.26, my + h * 0.2);
  g.lineTo(mx + w * 0.32, y + h);
  g.closePath();
  g.fill();
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  g.stroke();
  g.fillStyle = '#1a1a22';
  g.save();
  g.translate(mx, my + h * 0.3);
  g.rotate(0.5);
  g.fillRect(-w * 0.3, -h * 0.025, w * 0.6, h * 0.06);
  g.fillRect(w * 0.08, -h * 0.06, w * 0.04, h * 0.12);
  g.fillRect(-w * 0.05, h * 0.01, w * 0.05, h * 0.09);
  g.restore();
  // A gloved hand on the grip.
  g.fillStyle = '#5a3a22';
  g.beginPath();
  g.arc(mx + w * 0.1, my + h * 0.32, w * 0.04, 0, Math.PI * 2);
  g.fill();
}

/** The producer, pointing at the viewer: a bearded man in dark
 *  sunglasses, gold chains and a signet ring, warm red shirt behind him. */
export function drawProducerPanel(g, x, y, w, h, t) {
  pen(g);
  // Warm patterned shirt: red field with a gold border motif.
  g.fillStyle = '#8e1f3d';
  g.fillRect(x, y, w, h);
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(2, w * 0.015);
  g.strokeRect(x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88);
  g.fillStyle = '#ffd23e';
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.arc(x + w * (0.15 + i * 0.23), y + h * 0.12, Math.max(2, w * 0.015), 0, Math.PI * 2);
    g.fill();
  }
  const s = Math.min(w, h);
  const mx = x + w * 0.48;
  const my = y + h * 0.36;
  // Head: warm dark skin, short hair, full beard.
  g.fillStyle = '#7a4a28';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  g.beginPath();
  g.ellipse(mx, my, w * 0.19, h * 0.24, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = '#14100c';
  g.beginPath();
  g.ellipse(mx, my - h * 0.11, w * 0.14, h * 0.09, 0, Math.PI, 0);
  g.fill();
  g.beginPath();
  g.ellipse(mx, my + h * 0.12, w * 0.13, h * 0.1, 0, 0, Math.PI);
  g.fill();
  // Dark sunglasses with a gold frame edge.
  g.fillStyle = '#101018';
  g.beginPath();
  g.roundRect(mx - w * 0.155, my - h * 0.04, w * 0.31, h * 0.07, h * 0.03);
  g.fill();
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(1.5, s * 0.01);
  g.beginPath();
  g.roundRect(mx - w * 0.115, my - h * 0.04, w * 0.23, h * 0.06, h * 0.025);
  g.stroke();
  // Rim light on the right side of the face.
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(2, s * 0.016);
  g.beginPath();
  g.arc(mx, my, w * 0.14, -0.6, 0.9);
  g.stroke();
  // Gold chains + a medallion, over a dark shirt.
  g.fillStyle = '#2a1a2e';
  g.beginPath();
  g.moveTo(mx - w * 0.34, y + h);
  g.lineTo(mx - w * 0.26, my + h * 0.22);
  g.lineTo(mx + w * 0.26, my + h * 0.22);
  g.lineTo(mx + w * 0.34, y + h);
  g.closePath();
  g.fill();
  g.strokeStyle = t.outline;
  g.stroke();
  g.strokeStyle = '#ffd23e';
  g.lineWidth = Math.max(3, s * 0.025);
  g.beginPath();
  g.arc(mx, my + h * 0.2, w * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  g.beginPath();
  g.arc(mx, my + h * 0.24, w * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  g.fillStyle = '#ffd23e';
  g.beginPath();
  g.arc(mx, my + h * 0.36, w * 0.045, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(1.5, s * 0.01);
  g.stroke();
  // The pointing hand, large in the foreground, ring on the finger.
  const hx = x + w * 0.68;
  const hy = y + h * 0.78;
  g.fillStyle = '#7a4a28';
  g.beginPath();
  g.ellipse(hx, hy, w * 0.11, h * 0.09, -0.3, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.018);
  g.stroke();
  g.fillStyle = '#7a4a28';
  g.save();
  g.translate(hx + w * 0.06, hy - h * 0.05);
  g.rotate(-0.6);
  g.beginPath();
  g.roundRect(-w * 0.02, -h * 0.12, w * 0.05, h * 0.16, h * 0.02);
  g.fill();
  g.restore();
  g.fillStyle = '#ffd23e';
  g.beginPath();
  g.arc(hx + w * 0.02, hy - h * 0.02, w * 0.025, 0, Math.PI * 2);
  g.fill();
}

/** A yellow supercar, scissor door raised, on Ocean Drive: art-deco
 *  buildings and palms behind it, the car big in the frame. */
export function drawSupercarPanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h * 0.55, t);
  // Art-deco facades behind the car.
  g.fillStyle = '#5c2a6e';
  g.fillRect(x, y + h * 0.3, w * 0.34, h * 0.3);
  g.fillStyle = '#3d1a4d';
  g.fillRect(x + w * 0.66, y + h * 0.26, w * 0.34, h * 0.34);
  g.fillStyle = t.window;
  for (let i = 0; i < 3; i++) {
    g.fillRect(x + w * (0.08 + i * 0.1), y + h * 0.36, w * 0.04, h * 0.05);
    g.fillRect(x + w * (0.72 + i * 0.09), y + h * 0.32, w * 0.04, h * 0.05);
  }
  palmTree(g, x + w * 0.5, y + h * 0.62, h * 0.34, 0.18, t, w);
  // Street.
  g.fillStyle = '#101018';
  g.fillRect(x, y + h * 0.6, w, h * 0.4);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 4; i++) g.fillRect(x + w * (0.05 + i * 0.25), y + h * 0.84, w * 0.12, h * 0.02);
  // The car: a low yellow wedge, nose right, door swung up.
  const cx = x + w * 0.1;
  const cy = y + h * 0.52;
  const cw = w * 0.8;
  const ch = h * 0.2;
  g.fillStyle = t.car;
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(cx, cy + ch);
  g.lineTo(cx + cw * 0.06, cy + ch * 0.3);
  g.lineTo(cx + cw * 0.32, cy);
  g.lineTo(cx + cw * 0.62, cy);
  g.lineTo(cx + cw * 0.94, cy + ch * 0.45);
  g.lineTo(cx + cw, cy + ch);
  g.closePath();
  g.fill();
  g.stroke();
  // Body shading: a darker lower half and a sun glint on the bonnet.
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.beginPath();
  g.moveTo(cx + cw * 0.1, cy + ch);
  g.lineTo(cx + cw * 0.9, cy + ch);
  g.lineTo(cx + cw * 0.94, cy + ch * 0.55);
  g.lineTo(cx + cw * 0.06, cy + ch * 0.55);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath();
  g.ellipse(cx + cw * 0.45, cy + ch * 0.22, cw * 0.16, ch * 0.12, 0, 0, Math.PI * 2);
  g.fill();
  // Raised scissor door.
  g.fillStyle = t.car;
  g.beginPath();
  g.moveTo(cx + cw * 0.4, cy);
  g.lineTo(cx + cw * 0.34, cy - ch * 1.2);
  g.lineTo(cx + cw * 0.52, cy - ch * 1.2);
  g.lineTo(cx + cw * 0.58, cy);
  g.closePath();
  g.fill();
  g.stroke();
  // Window, headlight, wheels.
  g.fillStyle = '#0e1420';
  g.beginPath();
  g.moveTo(cx + cw * 0.36, cy + ch * 0.08);
  g.lineTo(cx + cw * 0.6, cy + ch * 0.08);
  g.lineTo(cx + cw * 0.66, cy + ch * 0.32);
  g.lineTo(cx + cw * 0.38, cy + ch * 0.32);
  g.closePath();
  g.fill();
  g.fillStyle = '#fff6c8';
  g.beginPath();
  g.arc(cx + cw * 0.95, cy + ch * 0.55, Math.max(2, w * 0.02), 0, Math.PI * 2);
  g.fill();
  comicWheel(g, cx + cw * 0.22, cy + ch * 0.98, Math.min(w, h) * 0.085, w);
  comicWheel(g, cx + cw * 0.78, cy + ch * 0.98, Math.min(w, h) * 0.085, w);
}

/** The alligator, from the front — the first animal to take a whole
 *  panel on a GTA cover, jaws wide open toward the viewer. A side view
 *  reads as a boat; a front view reads as an alligator at once: two eyes
 *  above one big open mouth, teeth around the rim, water below. */
export function drawAlligatorPanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h * 0.45, t);
  const water = g.createLinearGradient(x, y + h * 0.45, x, y + h);
  water.addColorStop(0, '#1d5c4a');
  water.addColorStop(1, '#0a2e26');
  g.fillStyle = water;
  g.fillRect(x, y + h * 0.45, w, h * 0.55);
  // Reeds at the edges and a lily pad.
  g.strokeStyle = '#0d3d2f';
  g.lineWidth = Math.max(2, w * 0.015);
  for (let i = 0; i < 3; i++) {
    const rx = x + w * (0.03 + i * 0.04);
    g.beginPath();
    g.moveTo(rx, y + h);
    g.lineTo(rx + w * 0.02, y + h * (0.62 + (i % 2) * 0.05));
    g.stroke();
    const rx2 = x + w * (0.9 + i * 0.03);
    g.beginPath();
    g.moveTo(rx2, y + h);
    g.lineTo(rx2 - w * 0.02, y + h * (0.6 + (i % 2) * 0.06));
    g.stroke();
  }
  g.fillStyle = '#2f7a4d';
  g.beginPath();
  g.ellipse(x + w * 0.88, y + h * 0.93, w * 0.08, h * 0.03, 0, 0, Math.PI * 2);
  g.fill();
  // The head, huge and front-on: a broad snout, eyes on top, one big
  // open mouth below.
  const cx = x + w * 0.5;
  const cy = y + h * 0.58;
  const s = Math.min(w, h);
  const headW = w * 0.66;
  const headH = h * 0.6;
  g.fillStyle = t.gator;
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.ellipse(cx, cy, headW / 2, headH / 2, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // A lighter snout bridge down the middle.
  g.fillStyle = '#4a8a52';
  g.beginPath();
  g.ellipse(cx, cy - headH * 0.14, headW * 0.3, headH * 0.26, 0, 0, Math.PI * 2);
  g.fill();
  // Eyes: two bumps on top of the head, amber irises, glaring.
  for (const side of [-1, 1]) {
    const ex = cx + side * headW * 0.24;
    const ey = cy - headH * 0.38;
    g.fillStyle = t.gator;
    g.beginPath();
    g.arc(ex, ey, s * 0.075, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#ffb020';
    g.beginPath();
    g.arc(ex, ey, s * 0.048, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = t.outline;
    g.beginPath();
    g.arc(ex, ey, s * 0.02, 0, Math.PI * 2);
    g.fill();
  }
  // Nostrils on the snout bridge.
  g.fillStyle = t.outline;
  for (const side of [-1, 1]) {
    g.beginPath();
    g.arc(cx + side * headW * 0.09, cy - headH * 0.3, Math.max(1.5, w * 0.012), 0, Math.PI * 2);
    g.fill();
  }
  // The open mouth: a dark red oval, teeth around the rim, a tongue.
  const mx = cx;
  const my = cy + headH * 0.18;
  const mw = headW * 0.72;
  const mh = headH * 0.44;
  g.fillStyle = '#7a1e2e';
  g.beginPath();
  g.ellipse(mx, my, mw / 2, mh / 2, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#d23b4e';
  g.beginPath();
  g.ellipse(mx, my + mh * 0.22, mw * 0.26, mh * 0.2, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f4f1e8';
  for (let i = 0; i < 6; i++) {
    const tx = mx - mw * 0.32 + (i * mw * 0.64) / 5;
    const ty = my - mh * 0.42;
    g.beginPath();
    g.moveTo(tx - mw * 0.045, ty);
    g.lineTo(tx + mw * 0.045, ty);
    g.lineTo(tx, ty + mh * 0.22);
    g.closePath();
    g.fill();
  }
  for (let i = 0; i < 5; i++) {
    const tx = mx - mw * 0.28 + (i * mw * 0.56) / 4;
    const ty = my + mh * 0.42;
    g.beginPath();
    g.moveTo(tx - mw * 0.045, ty);
    g.lineTo(tx + mw * 0.045, ty);
    g.lineTo(tx, ty - mh * 0.22);
    g.closePath();
    g.fill();
  }
  // Splash + ripples.
  g.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.arc(x + w * (0.15 + i * 0.12), y + h * (0.82 + (i % 2) * 0.06), Math.max(2, w * 0.012), 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = Math.max(1.5, w * 0.01);
  for (let i = 0; i < 2; i++) {
    g.beginPath();
    g.ellipse(cx, y + h * (0.9 + i * 0.04), w * (0.34 + i * 0.06), h * 0.03, 0, 0, Math.PI * 2);
    g.stroke();
  }
}

/** A motorcycle doing a wheelie, rider leaning back, a police cruiser
 *  behind it — the bottom-right panel of the official GTA VI cover. */
export function drawBikePanel(g, x, y, w, h, t) {
  pen(g);
  // Dusk sky over a street: purple above, teal road below.
  const sky = g.createLinearGradient(x, y, x, y + h * 0.6);
  sky.addColorStop(0, '#7a3a9e');
  sky.addColorStop(1, '#ff7a9e');
  g.fillStyle = sky;
  g.fillRect(x, y, w, h * 0.6);
  g.fillStyle = '#101018';
  g.fillRect(x, y + h * 0.6, w, h * 0.4);
  // Power lines + a street sign.
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(1.5, w * 0.01);
  g.beginPath();
  g.moveTo(x, y + h * 0.18);
  g.lineTo(x + w, y + h * 0.14);
  g.moveTo(x, y + h * 0.24);
  g.lineTo(x + w, y + h * 0.2);
  g.stroke();
  // The police cruiser behind, small, light bar flashing.
  const px = x + w * 0.08;
  const py = y + h * 0.72;
  g.fillStyle = '#e8e8ea';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.015);
  g.beginPath();
  g.moveTo(px, py + h * 0.1);
  g.lineTo(px + w * 0.04, py + h * 0.02);
  g.lineTo(px + w * 0.24, py + h * 0.02);
  g.lineTo(px + w * 0.32, py + h * 0.1);
  g.closePath();
  g.fill();
  g.stroke();
  g.shadowBlur = w * 0.03;
  g.shadowColor = '#ff2e2e';
  g.fillStyle = '#ff2e2e';
  g.fillRect(px + w * 0.1, py - h * 0.02, w * 0.05, h * 0.035);
  g.shadowColor = '#2e7dff';
  g.fillStyle = '#2e7dff';
  g.fillRect(px + w * 0.17, py - h * 0.02, w * 0.05, h * 0.035);
  g.shadowBlur = 0;
  // The bike, big, front wheel in the air, rider leaning back.
  const bx = x + w * 0.42;
  const by = y + h * 0.58;
  const s = Math.min(w, h);
  // Rear wheel on the ground, front wheel up.
  comicWheel(g, bx, by + h * 0.14, h * 0.13, w);
  comicWheel(g, bx + w * 0.26, by - h * 0.1, h * 0.12, w);
  // Frame + pink/purple fairing.
  g.fillStyle = '#c22e88';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(bx - w * 0.08, by + h * 0.1);
  g.lineTo(bx + w * 0.1, by - h * 0.02);
  g.lineTo(bx + w * 0.3, by - h * 0.14);
  g.lineTo(bx + w * 0.34, by - h * 0.04);
  g.lineTo(bx + w * 0.16, by + h * 0.1);
  g.closePath();
  g.fill();
  g.stroke();
  // Tank + seat + handlebar.
  g.fillStyle = '#e8a0d8';
  g.beginPath();
  g.moveTo(bx + w * 0.08, by - h * 0.04);
  g.lineTo(bx + w * 0.2, by - h * 0.1);
  g.lineTo(bx + w * 0.26, by - h * 0.04);
  g.lineTo(bx + w * 0.14, by + h * 0.02);
  g.closePath();
  g.fill();
  // The rider: helmet, white tee, jeans, leaning back over the seat.
  g.fillStyle = '#2a2a34';
  g.beginPath();
  g.arc(bx + w * 0.24, by - h * 0.26, h * 0.075, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.016);
  g.stroke();
  g.fillStyle = '#19e3d6';
  g.beginPath();
  g.arc(bx + w * 0.26, by - h * 0.27, h * 0.045, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f4f1e8';
  g.beginPath();
  g.moveTo(bx + w * 0.14, by - h * 0.18);
  g.lineTo(bx + w * 0.28, by - h * 0.2);
  g.lineTo(bx + w * 0.32, by - h * 0.02);
  g.lineTo(bx + w * 0.12, by - h * 0.02);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#2e4a6e';
  g.beginPath();
  g.moveTo(bx + w * 0.12, by - h * 0.02);
  g.lineTo(bx + w * 0.3, by - h * 0.02);
  g.lineTo(bx + w * 0.26, by + h * 0.12);
  g.lineTo(bx + w * 0.1, by + h * 0.12);
  g.closePath();
  g.fill();
  // Speed lines.
  g.strokeStyle = 'rgba(255,255,255,0.4)';
  g.lineWidth = Math.max(1.5, w * 0.012);
  for (let i = 0; i < 3; i++) {
    const ly = y + h * (0.3 + i * 0.1);
    g.beginPath();
    g.moveTo(x + w * 0.06, ly);
    g.lineTo(x + w * 0.34, ly);
    g.stroke();
  }
}

/** Palm silhouettes against a big low sun over the sea. */
export function drawPalmSunsetPanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h, t);
  const cx = x + w * 0.5;
  const cy = y + h * 0.62;
  const r = Math.min(w, h) * 0.3;
  g.fillStyle = t.sun;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = Math.max(2, w * 0.02);
  g.strokeStyle = t.outline;
  g.stroke();
  g.fillStyle = t.skyBot;
  for (let i = 0; i < 3; i++) {
    const sy = cy + r * (0.08 + i * 0.3);
    g.fillRect(cx - r, sy, r * 2, r * 0.09);
  }
  g.fillStyle = t.seaBot;
  g.fillRect(x, y + h * 0.82, w, h * 0.18);
  g.strokeStyle = 'rgba(255,255,255,0.6)';
  g.lineWidth = Math.max(1.5, w * 0.01);
  g.beginPath();
  g.moveTo(x + w * 0.1, y + h * 0.88);
  g.lineTo(x + w * 0.9, y + h * 0.88);
  g.stroke();
  palmTree(g, x + w * 0.16, y + h * 0.95, h * 0.62, -0.22, t, w);
  palmTree(g, x + w * 0.86, y + h * 0.95, h * 0.5, 0.28, t, w);
}

/** A daytime skyline: towers against the sunset, sun low between them. */
export function drawDaySkylinePanel(g, x, y, w, h, t) {
  pen(g);
  sunsetSky(g, x, y, w, h, t);
  lowSun(g, x, y, w, h * 0.7, t);
  towerRow(g, x, y + h * 0.35, w, h * 0.65, t, 7);
  palmTree(g, x + w * 0.1, y + h * 1.02, h * 0.42, 0.2, t, w);
}

/** Neon skyline: dark towers, a glowing pink sign, teal windows. */
export function drawNeonSkylinePanel(g, x, y, w, h, t) {
  pen(g);
  g.fillStyle = t.night;
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 12; i++) {
    const sx = x + w * ((i * 0.37 + 0.11) % 0.95);
    const sy = y + h * ((i * 0.53 + 0.07) % 0.35);
    g.fillRect(sx, sy, Math.max(1, w * 0.008), Math.max(1, w * 0.008));
  }
  towerRow(g, x, y + h * 0.3, w, h * 0.7, t, 11);
  const sx = x + w * 0.18;
  const sy = y + h * 0.16;
  const sw = w * 0.64;
  g.shadowColor = t.accent;
  g.shadowBlur = w * 0.05;
  g.fillStyle = t.accent;
  g.fillRect(sx, sy, sw, h * 0.09);
  g.fillStyle = t.accent2;
  g.fillRect(sx, sy + h * 0.12, sw, h * 0.025);
  g.shadowBlur = 0;
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.015);
  g.strokeRect(sx, sy, sw, h * 0.09);
}

/** A police chase: cruiser with a light bar, motion lines, night street. */
export function drawChasePanel(g, x, y, w, h, t) {
  pen(g);
  g.fillStyle = t.night;
  g.fillRect(x, y, w, h);
  g.fillStyle = '#101018';
  g.fillRect(x, y + h * 0.6, w, h * 0.4);
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = Math.max(1.5, w * 0.012);
  for (let i = 0; i < 4; i++) {
    const ly = y + h * (0.2 + i * 0.13);
    g.beginPath();
    g.moveTo(x + w * (0.05 + i * 0.04), ly);
    g.lineTo(x + w * (0.4 + i * 0.05), ly);
    g.stroke();
  }
  const cx = x + w * 0.18;
  const cy = y + h * 0.5;
  const cw = w * 0.64;
  const ch = h * 0.18;
  g.fillStyle = '#e8e8ea';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(cx, cy + ch);
  g.lineTo(cx + cw * 0.05, cy + ch * 0.3);
  g.lineTo(cx + cw * 0.3, cy);
  g.lineTo(cx + cw * 0.6, cy);
  g.lineTo(cx + cw * 0.92, cy + ch * 0.4);
  g.lineTo(cx + cw, cy + ch);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#14141c';
  g.fillRect(cx + cw * 0.32, cy + ch * 0.12, cw * 0.34, ch * 0.8);
  g.fillStyle = '#0e1420';
  g.beginPath();
  g.moveTo(cx + cw * 0.34, cy + ch * 0.1);
  g.lineTo(cx + cw * 0.58, cy + ch * 0.1);
  g.lineTo(cx + cw * 0.64, cy + ch * 0.34);
  g.lineTo(cx + cw * 0.36, cy + ch * 0.34);
  g.closePath();
  g.fill();
  g.shadowBlur = w * 0.04;
  g.shadowColor = '#ff2e2e';
  g.fillStyle = '#ff2e2e';
  g.fillRect(cx + cw * 0.36, cy - ch * 0.28, cw * 0.12, ch * 0.26);
  g.shadowColor = '#2e7dff';
  g.fillStyle = '#2e7dff';
  g.fillRect(cx + cw * 0.52, cy - ch * 0.28, cw * 0.12, ch * 0.26);
  g.shadowBlur = 0;
  comicWheel(g, cx + cw * 0.22, cy + ch * 0.98, Math.min(w, h) * 0.085, w);
  comicWheel(g, cx + cw * 0.78, cy + ch * 0.98, Math.min(w, h) * 0.085, w);
}

/** The panel painters, keyed by the vignette id the layouts use. */
export const VIGNETTES = {
  heli: drawHelicopterPanel,
  duo: drawDuoPanel,
  boat: drawSpeedboatPanel,
  robber: drawRobberPanel,
  producer: drawProducerPanel,
  skyline: drawDaySkylinePanel,
  supercar: drawSupercarPanel,
  gator: drawAlligatorPanel,
  bike: drawBikePanel,
  palms: drawPalmSunsetPanel,
  neon: drawNeonSkylinePanel,
  chase: drawChasePanel,
};
