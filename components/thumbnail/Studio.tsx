"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CANVAS_W,
  CANVAS_H,
  FONTS,
  Layer,
  Scene,
  TextLayer,
  uid,
} from "./types";
import { drawScene, exportToBlob, layerBox, preloadScene } from "./draw";
import { TEMPLATES, blankScene } from "./templates";

type Tab = "template" | "background" | "add" | "ai";

const EMOJIS = ["🔥", "😱", "🤯", "💀", "😂", "👀", "💰", "✅", "❌", "⚡", "🚀", "❤️", "👑", "🎯", "💯", "😍", "🤔", "🏆", "💥", "⭐"];
const SWATCHES = ["#ffffff", "#000000", "#e50914", "#ffd200", "#1d9bf0", "#22c55e", "#ff512f", "#a855f7", "#ff3b81", "#00e5ff"];

// ---- small UI helpers -------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} · ${Math.round(value)}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-600"
      />
    </Field>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded cursor-pointer bg-transparent border border-white/15"
      />
      {SWATCHES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full border border-white/20"
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

const btn = "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
const btnGhost = `${btn} bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10`;
const btnPrimary = `${btn} bg-red-600 hover:bg-red-500 text-white`;

// ---- main component ---------------------------------------------------------

export default function Studio() {
  const [scene, setScene] = useState<Scene>(() => blankScene());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("template");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const selected = scene.layers.find((l) => l.id === selectedId) ?? null;

  // Redraw the live preview whenever the scene changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (document.fonts?.ready) await document.fonts.ready;
      const images = await preloadScene(scene);
      if (cancelled) return;
      drawScene(ctx, scene, images);
    })();
    return () => {
      cancelled = true;
    };
  }, [scene]);

  // ---- scene mutations ----
  const patchLayer = useCallback((id: string, patch: Record<string, unknown>) => {
    setScene((s) => ({
      ...s,
      layers: s.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    }));
  }, []);

  const patchSelected = useCallback(
    (patch: Record<string, unknown>) => {
      if (selectedId) patchLayer(selectedId, patch);
    },
    [selectedId, patchLayer]
  );

  const addLayer = useCallback((layer: Layer) => {
    setScene((s) => ({ ...s, layers: [...s.layers, layer] }));
    setSelectedId(layer.id);
  }, []);

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setScene((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== selectedId) }));
    setSelectedId(null);
  }, [selectedId]);

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const copy = { ...selected, id: uid(), x: selected.x + 40, y: selected.y + 40 } as Layer;
    addLayer(copy);
  }, [selected, addLayer]);

  const reorderSelected = useCallback(
    (dir: 1 | -1) => {
      if (!selectedId) return;
      setScene((s) => {
        const idx = s.layers.findIndex((l) => l.id === selectedId);
        const ni = idx + dir;
        if (idx < 0 || ni < 0 || ni >= s.layers.length) return s;
        const layers = [...s.layers];
        [layers[idx], layers[ni]] = [layers[ni], layers[idx]];
        return { ...s, layers };
      });
    },
    [selectedId]
  );

  // ---- add helpers ----
  const addText = () =>
    addLayer({
      id: uid(),
      type: "text",
      text: "YENİ\nMETİN",
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      rotation: 0,
      fontSize: 130,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 9,
      fontFamily: "Anton, sans-serif",
      fontWeight: 400,
      uppercase: true,
      shadow: true,
      highlight: null,
    });

  const addEmoji = (char: string) =>
    addLayer({ id: uid(), type: "emoji", char, x: CANVAS_W / 2, y: CANVAS_H / 2, rotation: 0, size: 160 });

  const addShape = (shape: "rect" | "circle" | "arrow") =>
    addLayer({
      id: uid(),
      type: "shape",
      shape,
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      rotation: 0,
      width: shape === "rect" ? 360 : 260,
      height: shape === "rect" ? 120 : 260,
      color: "#e50914",
    });

  const onFile = (file: File, kind: "bg" | "image") => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      if (kind === "bg") {
        setScene((s) => ({ ...s, background: { type: "image", src } }));
      } else {
        const img = new Image();
        img.onload = () => {
          const ratio = img.height / img.width || 0.66;
          const w = 460;
          addLayer({
            id: uid(),
            type: "image",
            src,
            x: CANVAS_W / 2,
            y: CANVAS_H / 2,
            rotation: 0,
            width: w,
            height: w * ratio,
            opacity: 1,
            radius: 0,
          });
        };
        img.src = src;
      }
    };
    reader.readAsDataURL(file);
  };

  // ---- AI background ----
  const generateAi = async () => {
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/ai-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data?.url) {
        setScene((s) => ({ ...s, background: { type: "image", src: data.url } }));
        setAiNote(data.note ?? (data.source === "openai" ? "AI ile üretildi." : null));
      } else {
        setAiNote("Üretim başarısız oldu.");
      }
    } catch {
      setAiNote("İstek başarısız oldu (ağ hatası).");
    } finally {
      setAiLoading(false);
    }
  };

  // ---- export ----
  const download = async () => {
    setExporting(true);
    try {
      const blob = await exportToBlob(scene);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thumbnail-1280x720.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ---- pointer interactions (drag / resize / rotate) ----
  const interact = useRef<{
    mode: "drag" | "resize" | "rotate";
    id: string;
    startX: number;
    startY: number;
    origin: Layer;
    cx: number;
    cy: number;
    startAngle: number;
  } | null>(null);

  const stageScale = () => {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? r.width / CANVAS_W : 1;
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const it = interact.current;
      if (!it) return;
      const scale = stageScale();
      const dx = (e.clientX - it.startX) / scale;
      const dy = (e.clientY - it.startY) / scale;

      if (it.mode === "drag") {
        patchLayer(it.id, {
          x: Math.round(it.origin.x + dx),
          y: Math.round(it.origin.y + dy),
        });
      } else if (it.mode === "rotate") {
        const ang = (Math.atan2(e.clientY - it.cy, e.clientX - it.cx) * 180) / Math.PI;
        patchLayer(it.id, { rotation: Math.round(ang - it.startAngle) });
      } else {
        const o = it.origin;
        if (o.type === "text") {
          patchLayer(it.id, { fontSize: Math.max(24, Math.round(o.fontSize + dx * 0.4)) });
        } else if (o.type === "emoji") {
          patchLayer(it.id, { size: Math.max(40, Math.round(o.size + dx)) });
        } else if (o.type === "image") {
          const ratio = o.height / o.width;
          const w = Math.max(60, Math.round(o.width + dx));
          patchLayer(it.id, { width: w, height: Math.round(w * ratio) });
        } else if (o.type === "shape") {
          patchLayer(it.id, {
            width: Math.max(30, Math.round(o.width + dx)),
            height: Math.max(30, Math.round(o.height + dy)),
          });
        }
      }
    };
    const onUp = () => {
      interact.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [patchLayer]);

  const startInteract = (
    e: React.PointerEvent,
    layer: Layer,
    mode: "drag" | "resize" | "rotate"
  ) => {
    e.stopPropagation();
    setSelectedId(layer.id);
    const r = stageRef.current?.getBoundingClientRect();
    const cx = r ? r.left + (layer.x / CANVAS_W) * r.width : 0;
    const cy = r ? r.top + (layer.y / CANVAS_H) * r.height : 0;
    const startAngle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI - layer.rotation;
    interact.current = {
      mode,
      id: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      origin: layer,
      cx,
      cy,
      startAngle,
    };
  };

  // Overlay boxes for selection/drag, positioned in percentages so they track
  // the responsive canvas exactly.
  const boxes = useMemo(
    () =>
      scene.layers.map((l) => {
        const { w, h } = layerBox(l);
        return {
          layer: l,
          left: ((l.x - w / 2) / CANVAS_W) * 100,
          top: ((l.y - h / 2) / CANVAS_H) * 100,
          width: (w / CANVAS_W) * 100,
          height: (h / CANVAS_H) * 100,
        };
      }),
    [scene]
  );

  return (
    <div className="pt-20 pb-16 px-3 md:px-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            🎨 Thumbnail <span className="text-red-500">Stüdyo</span>
          </h1>
          <p className="text-sm text-gray-500">Viral YouTube kapak üretici · 1280×720</p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => { setScene(blankScene()); setSelectedId(null); }}>
            Sıfırla
          </button>
          <button className={btnPrimary} onClick={download} disabled={exporting}>
            {exporting ? "Hazırlanıyor…" : "⬇ PNG İndir"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        {/* Sidebar */}
        <aside className="rounded-xl p-4 h-fit" style={{ background: "#13131c", border: "1px solid #262636" }}>
          {/* Selected element properties */}
          {selected && (
            <div className="mb-5 pb-5 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">Seçili Öğe</span>
                <div className="flex gap-1">
                  <button className={btnGhost + " !px-2 !py-1"} onClick={() => reorderSelected(-1)} title="Geri gönder">↓</button>
                  <button className={btnGhost + " !px-2 !py-1"} onClick={() => reorderSelected(1)} title="Öne getir">↑</button>
                  <button className={btnGhost + " !px-2 !py-1"} onClick={duplicateSelected} title="Çoğalt">⧉</button>
                  <button className={btn + " !px-2 !py-1 bg-red-600/80 hover:bg-red-500 text-white"} onClick={removeSelected} title="Sil">🗑</button>
                </div>
              </div>

              {selected.type === "text" && (
                <TextProps layer={selected} patch={patchSelected} />
              )}
              {selected.type === "emoji" && (
                <Slider label="Boyut" value={selected.size} min={40} max={500} onChange={(v) => patchSelected({ size: v })} />
              )}
              {selected.type === "image" && (
                <>
                  <Slider label="Genişlik" value={selected.width} min={60} max={CANVAS_W} onChange={(v) => patchSelected({ width: v, height: Math.round(v * (selected.height / selected.width)) })} />
                  <Slider label="Saydamlık" value={selected.opacity * 100} min={10} max={100} onChange={(v) => patchSelected({ opacity: v / 100 })} />
                  <Slider label="Köşe yuvarlaklığı" value={selected.radius} min={0} max={200} onChange={(v) => patchSelected({ radius: v })} />
                </>
              )}
              {selected.type === "shape" && (
                <>
                  <Slider label="Genişlik" value={selected.width} min={20} max={CANVAS_W} onChange={(v) => patchSelected({ width: v })} />
                  <Slider label="Yükseklik" value={selected.height} min={20} max={CANVAS_H} onChange={(v) => patchSelected({ height: v })} />
                  <Field label="Renk"><ColorRow value={selected.color} onChange={(c) => patchSelected({ color: c })} /></Field>
                </>
              )}
              <Slider label="Döndür °" value={selected.rotation} min={-180} max={180} onChange={(v) => patchSelected({ rotation: v })} />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-black/30 p-1 rounded-lg">
            {([
              ["template", "Şablon"],
              ["background", "Arka Plan"],
              ["add", "Ekle"],
              ["ai", "AI"],
            ] as [Tab, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${
                  tab === k ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "template" && (
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setScene(t.build()); setSelectedId(null); }}
                  className="aspect-video rounded-lg text-white font-black text-lg flex items-center justify-center border border-white/10 hover:border-red-500 transition-colors"
                  style={{ background: "linear-gradient(135deg,#222,#111)" }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {tab === "background" && (
            <div>
              <Field label="Tip">
                <div className="flex gap-2">
                  <button className={scene.background.type === "solid" ? btnPrimary : btnGhost} onClick={() => setScene((s) => ({ ...s, background: { type: "solid", color: "#0a0a0f" } }))}>Düz</button>
                  <button className={scene.background.type === "gradient" ? btnPrimary : btnGhost} onClick={() => setScene((s) => ({ ...s, background: { type: "gradient", from: "#1e3c72", to: "#2a5298", angle: 120 } }))}>Gradyan</button>
                  <button className={scene.background.type === "image" ? btnPrimary : btnGhost} onClick={() => bgFileRef.current?.click()}>Görsel</button>
                </div>
              </Field>
              {scene.background.type === "solid" && (
                <Field label="Renk"><ColorRow value={scene.background.color} onChange={(c) => setScene((s) => ({ ...s, background: { type: "solid", color: c } }))} /></Field>
              )}
              {scene.background.type === "gradient" && (
                <>
                  <Field label="Başlangıç"><ColorRow value={scene.background.from} onChange={(c) => setScene((s) => ({ ...s, background: { ...(s.background as { type: "gradient"; from: string; to: string; angle: number }), from: c } }))} /></Field>
                  <Field label="Bitiş"><ColorRow value={scene.background.to} onChange={(c) => setScene((s) => ({ ...s, background: { ...(s.background as { type: "gradient"; from: string; to: string; angle: number }), to: c } }))} /></Field>
                  <Slider label="Açı °" value={scene.background.angle} min={0} max={360} onChange={(v) => setScene((s) => ({ ...s, background: { ...(s.background as { type: "gradient"; from: string; to: string; angle: number }), angle: v } }))} />
                </>
              )}
              {scene.background.type === "image" && (
                <button className={btnGhost + " w-full"} onClick={() => bgFileRef.current?.click()}>Başka görsel yükle</button>
              )}
            </div>
          )}

          {tab === "add" && (
            <div>
              <button className={btnPrimary + " w-full mb-2"} onClick={addText}>＋ Başlık / Metin</button>
              <button className={btnGhost + " w-full mb-4"} onClick={() => imgFileRef.current?.click()}>🖼 Görsel / Yüz yükle</button>

              <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Şekiller</div>
              <div className="flex gap-2 mb-4">
                <button className={btnGhost + " flex-1"} onClick={() => addShape("rect")}>▬ Kutu</button>
                <button className={btnGhost + " flex-1"} onClick={() => addShape("circle")}>● Daire</button>
                <button className={btnGhost + " flex-1"} onClick={() => addShape("arrow")}>➜ Ok</button>
              </div>

              <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Emoji</div>
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => addEmoji(e)} className="text-2xl p-1 rounded hover:bg-white/10">{e}</button>
                ))}
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div>
              <Field label="Arka plan promptu">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="örn: patlayan altın paralar, dramatik ışık"
                  className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none focus:border-red-500"
                />
              </Field>
              <button className={btnPrimary + " w-full"} onClick={generateAi} disabled={aiLoading}>
                {aiLoading ? "Üretiliyor…" : "✨ Arka Plan Üret"}
              </button>
              {aiNote && <p className="text-xs text-gray-400 mt-2">{aiNote}</p>}
              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                İpucu: Sunucuda <code>OPENAI_API_KEY</code> tanımlıysa gerçek AI görseli üretilir; yoksa prompt&apos;tan
                otomatik prosedürel arka plan oluşturulur.
              </p>
            </div>
          )}

          <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0], "bg")} />
          <input ref={imgFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0], "image")} />
        </aside>

        {/* Stage */}
        <div>
          <div
            ref={stageRef}
            className="relative w-full rounded-xl overflow-hidden select-none"
            style={{ aspectRatio: "16 / 9", border: "1px solid #262636", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            onPointerDown={() => setSelectedId(null)}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="absolute inset-0 w-full h-full"
            />
            {/* interaction overlay */}
            {boxes.map(({ layer, left, top, width, height }) => {
              const isSel = layer.id === selectedId;
              return (
                <div
                  key={layer.id}
                  onPointerDown={(e) => startInteract(e, layer, "drag")}
                  className="absolute cursor-move"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    transform: `rotate(${layer.rotation}deg)`,
                    transformOrigin: "center",
                    outline: isSel ? "2px solid #e50914" : "none",
                    outlineOffset: "2px",
                  }}
                >
                  {isSel && (
                    <>
                      {/* resize handle */}
                      <span
                        onPointerDown={(e) => startInteract(e, layer, "resize")}
                        className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-red-600 border-2 border-white cursor-nwse-resize"
                      />
                      {/* rotate handle */}
                      <span
                        onPointerDown={(e) => startInteract(e, layer, "rotate")}
                        className="absolute left-1/2 -top-7 w-4 h-4 -translate-x-1/2 rounded-full bg-blue-500 border-2 border-white cursor-grab"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Sürükle = taşı · kırmızı tutamak = boyut · mavi tutamak = döndür · boşluğa tıkla = seçimi kaldır
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- text properties sub-panel ----
function TextProps({
  layer,
  patch,
}: {
  layer: TextLayer;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field label="Metin">
        <textarea
          value={layer.text}
          onChange={(e) => patch({ text: e.target.value })}
          rows={2}
          className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none focus:border-red-500"
        />
      </Field>
      <Field label="Font">
        <select
          value={layer.fontFamily}
          onChange={(e) => {
            const f = FONTS.find((x) => x.value === e.target.value);
            patch({ fontFamily: e.target.value, fontWeight: f?.weight ?? 400 });
          }}
          className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Field>
      <Slider label="Boyut" value={layer.fontSize} min={24} max={400} onChange={(v) => patch({ fontSize: v })} />
      <Field label="Yazı rengi"><ColorRow value={layer.color} onChange={(c) => patch({ color: c })} /></Field>
      <Slider label="Kenarlık (outline)" value={layer.strokeWidth} min={0} max={30} onChange={(v) => patch({ strokeWidth: v })} />
      <Field label="Kenarlık rengi"><ColorRow value={layer.strokeColor} onChange={(c) => patch({ strokeColor: c })} /></Field>
      <div className="flex gap-2 mb-1">
        <button
          className={layer.shadow ? btnPrimary + " flex-1" : btnGhost + " flex-1"}
          onClick={() => patch({ shadow: !layer.shadow })}
        >
          Gölge
        </button>
        <button
          className={layer.uppercase ? btnPrimary + " flex-1" : btnGhost + " flex-1"}
          onClick={() => patch({ uppercase: !layer.uppercase })}
        >
          BÜYÜK
        </button>
        <button
          className={layer.highlight ? btnPrimary + " flex-1" : btnGhost + " flex-1"}
          onClick={() => patch({ highlight: layer.highlight ? null : "#e50914" })}
        >
          Vurgu
        </button>
      </div>
      {layer.highlight && (
        <Field label="Vurgu rengi"><ColorRow value={layer.highlight} onChange={(c) => patch({ highlight: c })} /></Field>
      )}
    </>
  );
}
