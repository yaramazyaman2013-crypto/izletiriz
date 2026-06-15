// Viral YouTube thumbnail studio — shared scene model.
// All geometry is expressed in canvas space (1280x720). x/y is the CENTER
// of every element so dragging, rotating and exporting stay uniform.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export type Background =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "image"; src: string };

export interface BaseLayer {
  id: string;
  x: number;
  y: number;
  rotation: number; // degrees
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontFamily: string;
  fontWeight: number;
  uppercase: boolean;
  shadow: boolean;
  highlight: string | null; // optional background pill behind the text
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  width: number;
  height: number;
  opacity: number;
  radius: number; // corner radius
}

export interface EmojiLayer extends BaseLayer {
  type: "emoji";
  char: string;
  size: number;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rect" | "circle" | "arrow";
  width: number;
  height: number;
  color: string;
}

export type Layer = TextLayer | ImageLayer | EmojiLayer | ShapeLayer;

export interface Scene {
  background: Background;
  layers: Layer[];
}

export const FONTS: { label: string; value: string; weight: number }[] = [
  { label: "Anton", value: "Anton, sans-serif", weight: 400 },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif", weight: 400 },
  { label: "Archivo Black", value: "'Archivo Black', sans-serif", weight: 400 },
  { label: "Montserrat", value: "Montserrat, sans-serif", weight: 900 },
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}
