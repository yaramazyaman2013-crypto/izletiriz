// AI explainer-video studio — scene model shared by the renderer, the
// playback engine and the exporter. Frame is 1280x720.

export const VW = 1280;
export const VH = 720;

export type SceneVisual = "title" | "bullets" | "stat" | "quote";

export interface Scene {
  id: string;
  visual: SceneVisual;
  title: string;
  subtitle: string;
  bullets: string[];
  stat: string; // big number / keyword for "stat" visual
  narration: string; // spoken text + caption
  accent: string;
  bgFrom: string;
  bgTo: string;
  bgAngle: number;
  duration: number; // seconds (estimated, refined once audio is known)
  audio?: string; // data URL (mp3) when real TTS is available
}

export interface VideoProject {
  topic: string;
  scenes: Scene[];
  voice: string;
}

// Browser SpeechSynthesis + OpenAI tts voices. `provider` voices are passed
// straight to the TTS API; browser voices are matched by language at runtime.
export const VOICES: { label: string; value: string }[] = [
  { label: "Alloy (AI)", value: "alloy" },
  { label: "Echo (AI)", value: "echo" },
  { label: "Fable (AI)", value: "fable" },
  { label: "Onyx (AI)", value: "onyx" },
  { label: "Nova (AI)", value: "nova" },
  { label: "Shimmer (AI)", value: "shimmer" },
];

const PALETTES: [string, string, string][] = [
  ["#1e3c72", "#2a5298", "#7df0ff"],
  ["#360033", "#0b8793", "#ffd200"],
  ["#0f2027", "#2c5364", "#22c55e"],
  ["#3a1c71", "#d76d77", "#ffd6a5"],
  ["#16222a", "#3a6073", "#ff7b54"],
  ["#0a0a0f", "#231942", "#e50914"],
];

export function paletteFor(i: number): { from: string; to: string; accent: string } {
  const p = PALETTES[i % PALETTES.length];
  return { from: p[0], to: p[1], accent: p[2] };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// Rough narration timing used before (or without) real audio. ~2.6 words/sec
// plus a little padding, clamped to a sensible range.
export function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(45, Math.max(4, words / 2.6 + 1.2));
}
