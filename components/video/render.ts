// 2D animation renderer for the explainer video. The same drawFrame powers
// the live preview and the recorded export, so playback === download.

import { Scene, VW, VH } from "./types";

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function gradient(ctx: CanvasRenderingContext2D, from: string, to: string, angle: number) {
  const a = (angle * Math.PI) / 180;
  const cx = VW / 2;
  const cy = VH / 2;
  const len = Math.abs(VW * Math.cos(a)) + Math.abs(VH * Math.sin(a));
  const dx = (Math.cos(a) * len) / 2;
  const dy = (Math.sin(a) * len) / 2;
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  cx: number,
  y: number,
  lineH: number,
  align: CanvasTextAlign = "center"
) {
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  let yy = y;
  for (const l of lines) {
    ctx.fillText(l, cx, yy);
    yy += lineH;
  }
}

// Floating accent bubbles for a little ambient motion.
function bubbles(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = accent;
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 211 + t * (12 + i * 4)) % (VW + 200)) - 100;
    const by = (i * 137) % VH;
    const r = 40 + (i % 3) * 30;
    ctx.beginPath();
    ctx.arc(bx, VH - by, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw a single frame of a scene.
 * @param elapsed seconds since the scene started
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  elapsed: number
) {
  ctx.fillStyle = gradient(ctx, scene.bgFrom, scene.bgTo, scene.bgAngle);
  ctx.fillRect(0, 0, VW, VH);
  bubbles(ctx, elapsed, scene.accent);

  const intro = easeOut(elapsed / 0.6);
  const slide = (1 - intro) * 60;

  // accent bar
  ctx.fillStyle = scene.accent;
  ctx.globalAlpha = intro;
  ctx.fillRect(VW / 2 - 60, 90, 120 * intro, 8);
  ctx.globalAlpha = 1;

  if (scene.visual === "title") {
    ctx.font = "700 96px Montserrat, sans-serif";
    const lines = wrap(ctx, scene.title, VW - 240);
    ctx.globalAlpha = intro;
    ctx.fillStyle = "#ffffff";
    drawLines(ctx, lines, VW / 2, VH / 2 - lines.length * 10 + slide, 108);
    if (scene.subtitle) {
      ctx.font = "400 40px Montserrat, sans-serif";
      ctx.fillStyle = scene.accent;
      const sub = wrap(ctx, scene.subtitle, VW - 320);
      drawLines(ctx, sub, VW / 2, VH / 2 + lines.length * 60 + 40, 52);
    }
    ctx.globalAlpha = 1;
  } else if (scene.visual === "stat") {
    const pop = easeOut(elapsed / 0.5);
    ctx.save();
    ctx.translate(VW / 2, VH / 2 - 30);
    ctx.scale(0.6 + pop * 0.4, 0.6 + pop * 0.4);
    ctx.globalAlpha = pop;
    ctx.font = "400 240px Anton, sans-serif";
    ctx.fillStyle = scene.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(scene.stat || scene.title, 0, 0);
    ctx.restore();
    ctx.globalAlpha = intro;
    ctx.font = "600 46px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    const lines = wrap(ctx, scene.title, VW - 240);
    drawLines(ctx, lines, VW / 2, VH / 2 + 180, 56);
    ctx.globalAlpha = 1;
  } else if (scene.visual === "quote") {
    ctx.globalAlpha = intro;
    ctx.font = "italic 600 64px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    const lines = wrap(ctx, `“${scene.title}”`, VW - 320);
    drawLines(ctx, lines, VW / 2, VH / 2 - lines.length * 20 + slide, 84);
    if (scene.subtitle) {
      ctx.font = "400 38px Montserrat, sans-serif";
      ctx.fillStyle = scene.accent;
      drawLines(ctx, [`— ${scene.subtitle}`], VW / 2, VH / 2 + lines.length * 44 + 40, 48);
    }
    ctx.globalAlpha = 1;
  } else {
    // bullets
    ctx.font = "700 60px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = intro;
    const titleLines = wrap(ctx, scene.title, VW - 240);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let ty = 200 + slide;
    for (const l of titleLines) {
      ctx.fillText(l, 140, ty);
      ty += 70;
    }
    ctx.globalAlpha = 1;

    ctx.font = "400 42px Montserrat, sans-serif";
    let by = ty + 40;
    scene.bullets.forEach((b, i) => {
      const reveal = clamp01((elapsed - (0.4 + i * 0.7)) / 0.5);
      if (reveal <= 0) return;
      const e = easeOut(reveal);
      ctx.globalAlpha = e;
      const bx = 160 - (1 - e) * 40;
      // dot
      ctx.fillStyle = scene.accent;
      ctx.beginPath();
      ctx.arc(bx - 24, by + 18, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e7ecff";
      const lines = wrap(ctx, b, VW - bx - 160);
      ctx.textAlign = "left";
      let ly = by;
      for (const l of lines) {
        ctx.fillText(l, bx, ly + 18);
        ly += 50;
      }
      by += Math.max(64, lines.length * 50 + 20);
      ctx.globalAlpha = 1;
    });
  }
}

// Overlay caption (current narration) + overall progress bar. Drawn on top of
// every scene by the player/exporter so timing reads as one continuous video.
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  caption: string,
  progress: number,
  accent: string
) {
  if (caption) {
    ctx.font = "500 34px Montserrat, sans-serif";
    const lines = wrap(ctx, caption, VW - 200).slice(-2);
    const boxH = lines.length * 44 + 28;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(80, VH - boxH - 40, VW - 160, boxH);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let y = VH - boxH - 40 + boxH / 2 - ((lines.length - 1) * 44) / 2;
    for (const l of lines) {
      ctx.fillText(l, VW / 2, y);
      y += 44;
    }
  }
  // progress
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, VH - 8, VW, 8);
  ctx.fillStyle = accent;
  ctx.fillRect(0, VH - 8, VW * clamp01(progress), 8);
}
