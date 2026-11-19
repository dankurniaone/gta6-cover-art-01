// Vice City vignettes — every panel is drawn from scratch with Canvas shapes,
// in the inked comic style of the GTA covers: bold black outlines, blocked
// shadows, hard rim light, sunset and neon colours. No Rockstar artwork is
// used anywhere; these are original drawings. Each function paints one panel
// into the rectangle (x, y, w, h) using the theme's colours.

function ink(g) {
  g.lineJoin = 'round';
  g.lineCap = 'round';
}

function skyWash(g, x, y, w, h, t) {
  const sky = g.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, t.skyTop);
  sky.addColorStop(0.55, t.skyMid);
  sky.addColorStop(1, t.skyBot);
  g.fillStyle = sky;
  g.fillRect(x, y, w, h);
}

function sunDisc(g, x, y, w, h, t) {
  const r = Math.min(w, h) * 0.26;
  const cx = x + w * 0.68;
  const cy = y + h * 0.42;
  g.fillStyle = t.sun;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = Math.max(2, w * 0.02);
  g.strokeStyle = t.outline;
  g.stroke();
  // Slats cut across the low sun, the retro sunset look.
  g.fillStyle = t.skyBot;
  for (let i = 0; i < 3; i++) {
    const sy = cy + r * (0.1 + i * 0.28);
    g.fillRect(cx - r, sy, r * 2, r * 0.09);
  }
}

function skylineRow(g, x, y, w, h, t, seed) {
  // A row of dark towers with lit windows, sitting on the panel's base.
  const base = y + h;
  let px = x;
  let i = 0;
  while (px < x + w) {
    const bw = w * (0.14 + ((seed + i * 7) % 5) * 0.03);
    const bh = h * (0.35 + ((seed + i * 13) % 7) * 0.08);
    g.fillStyle = t.tower;
    g.fillRect(px, base - bh, bw, bh);
    g.lineWidth = Math.max(1.5, w * 0.012);
    g.strokeStyle = t.outline;
    g.strokeRect(px, base - bh, bw, bh);
    // Lit windows: a few warm squares.
    g.fillStyle = t.window;
    const cols = Math.max(1, Math.floor(bw / (w * 0.05)));
    const rows = Math.max(1, Math.floor(bh / (h * 0.14)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if ((c * 3 + r * 5 + seed + i) % 4 === 0) {
          g.fillRect(px + bw * 0.2 + c * w * 0.05, base - bh + h * 0.07 + r * h * 0.14, w * 0.022, h * 0.05);
        }
      }
    }
    // Antenna on the tallest tower.
    if (i % 3 === 1) {
      g.strokeStyle = t.outline;
      g.lineWidth = Math.max(1.5, w * 0.012);
      g.beginPath();
      g.moveTo(px + bw / 2, base - bh);
      g.lineTo(px + bw / 2, base - bh - h * 0.16);
      g.stroke();
      g.fillStyle = t.accent;
      g.beginPath();
      g.arc(px + bw / 2, base - bh - h * 0.18, Math.max(2, w * 0.014), 0, Math.PI * 2);
      g.fill();
    }
    px += bw + w * 0.02;
    i++;
  }
}

/** Top-left tradition: a police helicopter over the skyline at sunset. */
export function drawHelicopterPanel(g, x, y, w, h, t) {
  ink(g);
  skyWash(g, x, y, w, h, t);
  sunDisc(g, x, y, w, h * 0.8, t);
  skylineRow(g, x, y + h * 0.45, w, h * 0.55, t, 3);
  // Helicopter silhouette, nose to the right, rotor spinning overhead.
  const cx = x + w * 0.5;
  const cy = y + h * 0.34;
  const s = Math.min(w, h);
  g.fillStyle = t.heli;
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.02);
  // Rotor mast + blades.
  g.beginPath();
  g.moveTo(cx - s * 0.34, cy - s * 0.16);
  g.lineTo(cx + s * 0.36, cy - s * 0.2);
  g.lineWidth = Math.max(3, s * 0.03);
  g.stroke();
  g.beginPath();
  g.moveTo(cx, cy - s * 0.16);
  g.lineTo(cx, cy - s * 0.05);
  g.stroke();
  // Body: rounded cabin with a tail boom to the left.
  g.beginPath();
  g.moveTo(cx - s * 0.3, cy + s * 0.02);
  g.lineTo(cx - s * 0.12, cy - s * 0.05);
  g.lineTo(cx + s * 0.12, cy - s * 0.05);
  g.lineTo(cx + s * 0.2, cy + s * 0.04);
  g.lineTo(cx + s * 0.12, cy + s * 0.12);
  g.lineTo(cx - s * 0.22, cy + s * 0.12);
  g.closePath();
  g.fill();
  g.lineWidth = Math.max(2, s * 0.02);
  g.stroke();
  // Tail boom + tail rotor.
  g.beginPath();
  g.moveTo(cx - s * 0.28, cy + s * 0.04);
  g.lineTo(cx - s * 0.46, cy - s * 0.02);
  g.lineTo(cx - s * 0.46, cy + s * 0.06);
  g.closePath();
  g.fill();
  g.stroke();
  // Searchlight cone cutting down to the streets.
  g.fillStyle = 'rgba(255, 240, 180, 0.35)';
  g.beginPath();
  g.moveTo(cx + s * 0.05, cy + s * 0.12);
  g.lineTo(cx - s * 0.08, y + h);
  g.lineTo(cx + s * 0.22, y + h);
  g.closePath();
  g.fill();
  // Skids.
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, s * 0.018);
  g.beginPath();
  g.moveTo(cx - s * 0.2, cy + s * 0.18);
  g.lineTo(cx + s * 0.16, cy + s * 0.18);
  g.stroke();
}

/** A speedboat cutting across teal water, white wake behind it. */
export function drawSpeedboatPanel(g, x, y, w, h, t) {
  ink(g);
  skyWash(g, x, y, w, h * 0.45, t);
  sunDisc(g, x, y, w, h * 0.45, t);
  // Sea.
  const sea = g.createLinearGradient(x, y + h * 0.45, x, y + h);
  sea.addColorStop(0, t.seaTop);
  sea.addColorStop(1, t.seaBot);
  g.fillStyle = sea;
  g.fillRect(x, y + h * 0.45, w, h * 0.55);
  // Wake: white chevrons trailing the boat.
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.lineWidth = Math.max(2, w * 0.015);
  for (let i = 0; i < 3; i++) {
    const wy = y + h * (0.62 + i * 0.1);
    g.beginPath();
    g.moveTo(x + w * 0.18, wy);
    g.lineTo(x + w * 0.5, wy + h * 0.05);
    g.lineTo(x + w * 0.82, wy);
    g.stroke();
  }
  // Hull: a low white wedge with a pink stripe, nose to the right.
  const bx = x + w * 0.22;
  const by = y + h * 0.52;
  const bw = w * 0.58;
  const bh = h * 0.14;
  g.fillStyle = '#f4f1e8';
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(bx, by);
  g.lineTo(bx + bw, by + bh * 0.25);
  g.lineTo(bx + bw * 0.92, by + bh);
  g.lineTo(bx + bw * 0.08, by + bh);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = t.accent;
  g.fillRect(bx + bw * 0.1, by + bh * 0.55, bw * 0.78, bh * 0.22);
  // Windscreen + driver silhouette.
  g.fillStyle = t.tower;
  g.beginPath();
  g.moveTo(bx + bw * 0.42, by);
  g.lineTo(bx + bw * 0.58, by - bh * 0.7);
  g.lineTo(bx + bw * 0.66, by - bh * 0.55);
  g.lineTo(bx + bw * 0.55, by);
  g.closePath();
  g.fill();
  g.fillStyle = t.outline;
  g.beginPath();
  g.arc(bx + bw * 0.52, by - bh * 0.85, bh * 0.28, 0, Math.PI * 2);
  g.fill();
}

/** A yellow supercar, door raised, on a neon-lit street. */
export function drawSupercarPanel(g, x, y, w, h, t) {
  ink(g);
  // Night street: deep wall, neon strip, dark road.
  g.fillStyle = t.night;
  g.fillRect(x, y, w, h);
  g.fillStyle = t.accent;
  g.fillRect(x, y + h * 0.34, w, h * 0.03);
  g.fillStyle = t.accent2;
  g.fillRect(x, y + h * 0.38, w, h * 0.015);
  g.fillStyle = '#101018';
  g.fillRect(x, y + h * 0.62, w, h * 0.38);
  // Road centre line.
  g.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 4; i++) g.fillRect(x + w * (0.05 + i * 0.25), y + h * 0.82, w * 0.12, h * 0.02);
  // Car body: low wedge, nose to the right, door swung up.
  const cx = x + w * 0.12;
  const cy = y + h * 0.52;
  const cw = w * 0.76;
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
  // Raised scissor door.
  g.fillStyle = t.car;
  g.beginPath();
  g.moveTo(cx + cw * 0.4, cy);
  g.lineTo(cx + cw * 0.34, cy - ch * 1.15);
  g.lineTo(cx + cw * 0.52, cy - ch * 1.15);
  g.lineTo(cx + cw * 0.58, cy);
  g.closePath();
  g.fill();
  g.stroke();
  // Windows, headlight glow, wheels.
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
  // Wheels with hubcaps, so they read as wheels at any panel size.
  for (const wx of [0.22, 0.78]) {
    const wr = Math.min(w, h) * 0.085;
    g.fillStyle = '#0c0c10';
    g.beginPath();
    g.arc(cx + cw * wx, cy + ch * 0.98, wr, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#e8e8e8';
    g.lineWidth = Math.max(1.5, w * 0.01);
    g.stroke();
    g.fillStyle = '#9aa0aa';
    g.beginPath();
    g.arc(cx + cw * wx, cy + ch * 0.98, wr * 0.45, 0, Math.PI * 2);
    g.fill();
  }
}

/** Palm silhouettes against a big low sun. */
export function drawPalmSunsetPanel(g, x, y, w, h, t) {
  ink(g);
  skyWash(g, x, y, w, h, t);
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
  // Sea strip at the base.
  g.fillStyle = t.seaBot;
  g.fillRect(x, y + h * 0.82, w, h * 0.18);
  g.strokeStyle = 'rgba(255,255,255,0.6)';
  g.lineWidth = Math.max(1.5, w * 0.01);
  g.beginPath();
  g.moveTo(x + w * 0.1, y + h * 0.88);
  g.lineTo(x + w * 0.9, y + h * 0.88);
  g.stroke();
  // Two palms, one each side, leaning in.
  drawPalm(g, x + w * 0.16, y + h * 0.95, h * 0.62, -0.22, t, w);
  drawPalm(g, x + w * 0.86, y + h * 0.95, h * 0.5, 0.28, t, w);
}

function drawPalm(g, bx, by, height, lean, t, w) {
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
  // Coconuts.
  g.fillStyle = t.outline;
  g.beginPath();
  g.arc(tx - 4, ty + 4, Math.max(2, s * 0.03), 0, Math.PI * 2);
  g.arc(tx + 4, ty + 5, Math.max(2, s * 0.03), 0, Math.PI * 2);
  g.fill();
}

/** An alligator drifting in the swamp, eyes and snout above the water. */
export function drawAlligatorPanel(g, x, y, w, h, t) {
  ink(g);
  skyWash(g, x, y, w, h * 0.5, t);
  // Swamp water, dark green-teal.
  const water = g.createLinearGradient(x, y + h * 0.5, x, y + h);
  water.addColorStop(0, '#1d5c4a');
  water.addColorStop(1, '#0a2e26');
  g.fillStyle = water;
  g.fillRect(x, y + h * 0.5, w, h * 0.5);
  // Reeds at the edges.
  g.strokeStyle = '#0d3d2f';
  g.lineWidth = Math.max(2, w * 0.015);
  for (let i = 0; i < 5; i++) {
    const rx = x + w * (0.04 + i * 0.05);
    g.beginPath();
    g.moveTo(rx, y + h);
    g.lineTo(rx + w * 0.02, y + h * (0.62 + (i % 2) * 0.06));
    g.stroke();
  }
  // The gator: a long snout breaking the surface, eyes on bumps.
  const gy = y + h * 0.68;
  g.fillStyle = t.gator;
  g.strokeStyle = t.outline;
  g.lineWidth = Math.max(2, w * 0.018);
  g.beginPath();
  g.moveTo(x + w * 0.12, gy);
  g.lineTo(x + w * 0.86, gy - h * 0.02);
  g.lineTo(x + w * 0.9, gy + h * 0.07);
  g.lineTo(x + w * 0.14, gy + h * 0.09);
  g.closePath();
  g.fill();
  g.stroke();
  // Nostrils + teeth ridge.
  g.fillStyle = t.outline;
  g.beginPath();
  g.arc(x + w * 0.82, gy + h * 0.01, Math.max(1.5, w * 0.012), 0, Math.PI * 2);
  g.arc(x + w * 0.86, gy + h * 0.01, Math.max(1.5, w * 0.012), 0, Math.PI * 2);
  g.fill();
  // Eyes: two bumps with amber irises, big enough to read at a glance.
  for (const ex of [0.3, 0.42]) {
    g.fillStyle = t.gator;
    g.beginPath();
    g.arc(x + w * ex, gy - h * 0.06, h * 0.07, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#ffb020';
    g.beginPath();
    g.arc(x + w * ex, gy - h * 0.065, h * 0.04, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = t.outline;
    g.beginPath();
    g.arc(x + w * ex, gy - h * 0.065, h * 0.018, 0, Math.PI * 2);
    g.fill();
  }
  // Ripples.
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = Math.max(1.5, w * 0.01);
  for (let i = 0; i < 2; i++) {
    g.beginPath();
    g.ellipse(x + w * 0.5, gy + h * (0.16 + i * 0.07), w * (0.36 + i * 0.06), h * 0.03, 0, 0, Math.PI * 2);
    g.stroke();
  }
}

/** A daytime skyline: towers against the sunset, sun low between them. */
export function drawDaySkylinePanel(g, x, y, w, h, t) {
  ink(g);
  skyWash(g, x, y, w, h, t);
  sunDisc(g, x, y, w, h * 0.7, t);
  skylineRow(g, x, y + h * 0.35, w, h * 0.65, t, 7);
  // A palm in the foreground corner for scale.
  drawPalm(g, x + w * 0.1, y + h * 1.02, h * 0.42, 0.2, t, w);
}

/** Neon skyline: dark towers, a pink neon sign, teal windows. */
export function drawNeonSkylinePanel(g, x, y, w, h, t) {
  ink(g);
  g.fillStyle = t.night;
  g.fillRect(x, y, w, h);
  // Stars.
  g.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 12; i++) {
    const sx = x + w * ((i * 0.37 + 0.11) % 0.95);
    const sy = y + h * ((i * 0.53 + 0.07) % 0.35);
    g.fillRect(sx, sy, Math.max(1, w * 0.008), Math.max(1, w * 0.008));
  }
  skylineRow(g, x, y + h * 0.3, w, h * 0.7, t, 11);
  // Neon sign: a glowing pink bar with a teal underline, centre panel.
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

/** A police chase: cruiser with light bar, motion lines, night street. */
export function drawChasePanel(g, x, y, w, h, t) {
  ink(g);
  g.fillStyle = t.night;
  g.fillRect(x, y, w, h);
  g.fillStyle = '#101018';
  g.fillRect(x, y + h * 0.6, w, h * 0.4);
  // Speed lines.
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = Math.max(1.5, w * 0.012);
  for (let i = 0; i < 4; i++) {
    const ly = y + h * (0.2 + i * 0.13);
    g.beginPath();
    g.moveTo(x + w * (0.05 + i * 0.04), ly);
    g.lineTo(x + w * (0.4 + i * 0.05), ly);
    g.stroke();
  }
  // Cruiser body.
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
  // Black-and-white door + windows.
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
  // Light bar: red left, blue right, glowing.
  g.shadowBlur = w * 0.04;
  g.shadowColor = '#ff2e2e';
  g.fillStyle = '#ff2e2e';
  g.fillRect(cx + cw * 0.36, cy - ch * 0.28, cw * 0.12, ch * 0.26);
  g.shadowColor = '#2e7dff';
  g.fillStyle = '#2e7dff';
  g.fillRect(cx + cw * 0.52, cy - ch * 0.28, cw * 0.12, ch * 0.26);
  g.shadowBlur = 0;
  // Wheels with hubcaps.
  for (const wx of [0.22, 0.78]) {
    const wr = Math.min(w, h) * 0.085;
    g.fillStyle = '#0c0c10';
    g.beginPath();
    g.arc(cx + cw * wx, cy + ch * 0.98, wr, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#e8e8e8';
    g.lineWidth = Math.max(1.5, w * 0.01);
    g.stroke();
    g.fillStyle = '#9aa0aa';
    g.beginPath();
    g.arc(cx + cw * wx, cy + ch * 0.98, wr * 0.45, 0, Math.PI * 2);
    g.fill();
  }
}

/** The panel painters, keyed by the vignette id the layouts use. */
export const VIGNETTES = {
  heli: drawHelicopterPanel,
  skyline: drawDaySkylinePanel,
  boat: drawSpeedboatPanel,
  palms: drawPalmSunsetPanel,
  supercar: drawSupercarPanel,
  gator: drawAlligatorPanel,
  neon: drawNeonSkylinePanel,
  chase: drawChasePanel,
};
