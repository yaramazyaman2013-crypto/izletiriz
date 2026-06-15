// Canvas rendering for the thumbnail studio. The same draw routine powers
// the live on-screen preview and the exported PNG, so what you see is what
// you download.

import {
  CANVAS_W,
  CANVAS_H,
  Layer,
  Scene,
  TextLayer,
} from "./types";

// Module-level measuring context (no need to attach to the DOM).
// Returns null during SSR where `document` is unavailable.
let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) {
    const c = document.createElement("canvas");
    measureCtx = c.getContext("2d");
  }
  return measureCtx;
}

const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadScene(
  scene: Scene
): Promise<Record<string, HTMLImageElement>> {
  const srcs = new Set<string>();
  if (scene.background.type === "image") srcs.add(scene.background.src);
  for (const l of scene.layers) if (l.type === "image") srcs.add(l.src);
  const out: Record<string, HTMLImageElement> = {};
  await Promise.all(
    [...srcs].map(async (s) => {
      try {
        out[s] = await loadImage(s);
      } catch {
        /* skip broken sources */
      }
    })
  );
  return out;
}

function textLines(layer: TextLayer): string[] {
  const t = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  return t.split("\n");
}

function fontString(layer: TextLayer): string {
  return `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
}

// Bounding box (unrotated) in canvas space, centered on the layer's x/y.
export function layerBox(layer: Layer): { w: number; h: number } {
  switch (layer.type) {
    case "text": {
      const ctx = getMeasureCtx();
      const lines = textLines(layer);
      let w = 0;
      if (ctx) {
        ctx.font = fontString(layer);
        for (const line of lines) w = Math.max(w, ctx.measureText(line).width);
      } else {
        // SSR estimate (no canvas available)
        for (const line of lines) w = Math.max(w, line.length * layer.fontSize * 0.55);
      }
      const lineH = layer.fontSize * 1.15;
      const pad = layer.highlight ? layer.fontSize * 0.3 : layer.strokeWidth * 2;
      return { w: w + pad * 2, h: lineH * lines.length + pad * 2 };
    }
    case "emoji":
      return { w: layer.size, h: layer.size };
    case "image":
    case "shape":
      return { w: layer.width, h: layer.height };
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  images: Record<string, HTMLImageElement>
) {
  const bg = scene.background;
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else if (bg.type === "gradient") {
    const a = (bg.angle * Math.PI) / 180;
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const len = Math.abs(CANVAS_W * Math.cos(a)) + Math.abs(CANVAS_H * Math.sin(a));
    const dx = (Math.cos(a) * len) / 2;
    const dy = (Math.sin(a) * len) / 2;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, bg.from);
    g.addColorStop(1, bg.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else {
    const img = images[bg.src];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (img) {
      // cover fit
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
    }
  }
}

function drawText(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  const lines = textLines(layer);
  ctx.font = fontString(layer);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineH = layer.fontSize * 1.15;
  const total = lineH * lines.length;
  let y = -total / 2 + lineH / 2;

  for (const line of lines) {
    if (layer.highlight) {
      const w = ctx.measureText(line).width;
      const padX = layer.fontSize * 0.28;
      const padY = layer.fontSize * 0.12;
      ctx.fillStyle = layer.highlight;
      roundRect(
        ctx,
        -w / 2 - padX,
        y - lineH / 2 - padY + lineH * 0.08,
        w + padX * 2,
        lineH + padY * 2 - lineH * 0.16,
        layer.fontSize * 0.16
      );
      ctx.fill();
    }
    if (layer.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = layer.fontSize * 0.12;
      ctx.shadowOffsetX = layer.fontSize * 0.04;
      ctx.shadowOffsetY = layer.fontSize * 0.06;
    }
    if (layer.strokeWidth > 0) {
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.lineWidth = layer.strokeWidth * 2;
      ctx.strokeStyle = layer.strokeColor;
      ctx.strokeText(line, 0, y);
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = layer.color;
    ctx.fillText(line, 0, y);
    y += lineH;
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  // Bold right-pointing arrow centered in the box.
  const x0 = -w / 2;
  const y0 = -h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, y0 + h * 0.3);
  ctx.lineTo(x0 + w * 0.55, y0 + h * 0.3);
  ctx.lineTo(x0 + w * 0.55, y0 + h * 0.05);
  ctx.lineTo(x0 + w, y0 + h * 0.5);
  ctx.lineTo(x0 + w * 0.55, y0 + h * 0.95);
  ctx.lineTo(x0 + w * 0.55, y0 + h * 0.7);
  ctx.lineTo(x0, y0 + h * 0.7);
  ctx.closePath();
  ctx.fill();
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  images: Record<string, HTMLImageElement>
) {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

  if (layer.type === "text") {
    drawText(ctx, layer);
  } else if (layer.type === "emoji") {
    ctx.font = `${layer.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.char, 0, layer.size * 0.05);
  } else if (layer.type === "image") {
    const img = images[layer.src];
    if (img) {
      ctx.globalAlpha = layer.opacity;
      if (layer.radius > 0) {
        roundRect(ctx, -layer.width / 2, -layer.height / 2, layer.width, layer.height, layer.radius);
        ctx.clip();
      }
      ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      ctx.globalAlpha = 1;
    }
  } else if (layer.type === "shape") {
    ctx.fillStyle = layer.color;
    if (layer.shape === "rect") {
      ctx.fillRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
    } else if (layer.shape === "circle") {
      ctx.beginPath();
      ctx.ellipse(0, 0, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawArrow(ctx, layer.width, layer.height, layer.color);
    }
  }
  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  images: Record<string, HTMLImageElement>
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, scene, images);
  for (const layer of scene.layers) drawLayer(ctx, layer, images);
}

export async function exportToBlob(scene: Scene): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const images = await preloadScene(scene);
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;
  drawScene(ctx, scene, images);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    )
  );
}
