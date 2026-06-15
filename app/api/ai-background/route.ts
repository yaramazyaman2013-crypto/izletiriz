// AI background generator for the thumbnail studio.
//
// Uses OpenRouter (preferred) or OpenAI to generate a real 16:9 image when a
// key is configured. Otherwise it falls back to a vibrant procedural
// background derived from the prompt, so the feature works fully offline.

import { generateImage, imageSource } from "@/lib/ai";

export const dynamic = "force-dynamic";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// Build a deterministic, punchy 1280x720 SVG background from the prompt.
function proceduralSvg(prompt: string): string {
  const seed = hash(prompt || "viral");
  const baseHue = seed % 360;
  const hue2 = (baseHue + 40 + (seed % 80)) % 360;
  const angle = (seed % 360);

  const rand = (n: number) => ((hash(prompt + ":" + n) % 1000) / 1000);

  const blobs = Array.from({ length: 5 }, (_, i) => {
    const cx = Math.round(rand(i * 3 + 1) * 1280);
    const cy = Math.round(rand(i * 3 + 2) * 720);
    const r = Math.round(180 + rand(i * 3 + 3) * 320);
    const hh = (baseHue + i * 55) % 360;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${hsl(hh, 85, 58)}" opacity="0.45"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${hsl(baseHue, 80, 45)}"/>
      <stop offset="100%" stop-color="${hsl(hue2, 80, 30)}"/>
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="90"/></filter>
    <radialGradient id="v" cx="50%" cy="45%" r="75%">
      <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <g filter="url(#b)">${blobs}</g>
  <rect width="1280" height="720" fill="url(#v)"/>
</svg>`;

  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = await request.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    /* empty body */
  }

  const source = imageSource();
  if (source) {
    try {
      const url = await generateImage(prompt);
      if (url) return Response.json({ url, source });
    } catch (err) {
      // Fall through to procedural so the user still gets a usable result.
      return Response.json({
        url: proceduralSvg(prompt),
        source: "procedural",
        note: `AI sağlayıcı hatası, prosedürel arka plana geçildi: ${(err as Error).message}`,
      });
    }
  }

  return Response.json({
    url: proceduralSvg(prompt),
    source: "procedural",
    note: "AI anahtarı (OPENROUTER_API_KEY / OPENAI_API_KEY) yok — prompt'tan prosedürel arka plan üretildi.",
  });
}
