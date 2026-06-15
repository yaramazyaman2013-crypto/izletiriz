"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Scene,
  VideoProject,
  VOICES,
  VW,
  VH,
  estimateDuration,
  paletteFor,
  uid,
} from "./types";
import { drawFrame, drawOverlay } from "./render";

type SceneSpec = Omit<Scene, "id" | "accent" | "bgFrom" | "bgTo" | "bgAngle" | "duration" | "audio">;

function visualMin(s: { visual: Scene["visual"]; bullets: string[] }): number {
  if (s.visual === "bullets") return Math.max(3.5, 0.4 + s.bullets.length * 0.7 + 1.6);
  return 3;
}

function computeDuration(s: Scene, audioDur?: number): number {
  const vm = visualMin(s);
  if (audioDur && audioDur > 0) return Math.max(vm, audioDur + 0.5);
  return Math.max(vm, estimateDuration(s.narration));
}

function guessLang(text: string): string {
  return /[çğıİöşüÇĞÖŞÜ]/.test(text) ? "tr-TR" : "en-US";
}

function pickMime(): string {
  const cands = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return "video/webm";
  return cands.find((c) => MediaRecorder.isTypeSupported(c)) ?? "video/webm";
}

const btn = "px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50";
const btnPrimary = `${btn} bg-red-600 hover:bg-red-500 text-white`;
const btnGhost = `${btn} bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10`;

export default function VideoStudio() {
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [notes, setNotes] = useState("");
  const [voice, setVoice] = useState(VOICES[0].value);

  const [project, setProject] = useState<VideoProject | null>(null);
  const [busy, setBusy] = useState<null | "script" | "audio" | "export">(null);
  const [note, setNote] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [exportPct, setExportPct] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioElsRef = useRef<Record<string, HTMLAudioElement>>({});
  const rafRef = useRef<number | null>(null);
  const clockRef = useRef({ start: 0, paused: 0 });
  const sceneIdxRef = useRef(-1);

  const scenes = useMemo(() => project?.scenes ?? [], [project]);

  // Timeline (start offsets + total) recomputed when durations change.
  const timeline = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const s of scenes) {
      starts.push(acc);
      acc += s.duration;
    }
    return { starts, total: acc };
  }, [scenes]);

  const sceneAt = useCallback(
    (t: number) => {
      const { starts } = timeline;
      let i = 0;
      for (let k = 0; k < scenes.length; k++) {
        if (t >= starts[k]) i = k;
        else break;
      }
      return { i, elapsed: t - (starts[i] ?? 0) };
    },
    [timeline, scenes]
  );

  const drawAt = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !scenes.length) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { i, elapsed } = sceneAt(t);
      const s = scenes[i];
      if (!s) return;
      drawFrame(ctx, s, elapsed);
      drawOverlay(ctx, s.narration, timeline.total ? t / timeline.total : 0, s.accent);
    },
    [scenes, sceneAt, timeline.total]
  );

  // Static preview of the first frame whenever the project changes.
  useEffect(() => {
    if (project) drawAt(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  // ---- generate script ----
  const generate = async () => {
    if (!topic.trim()) return;
    setBusy("script");
    setNote(null);
    stop();
    try {
      const res = await fetch("/api/video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, minutes, notes }),
      });
      const data = await res.json();
      const specs: SceneSpec[] = data?.scenes ?? [];
      const built: Scene[] = specs.map((sp, i) => {
        const p = paletteFor(i);
        const base: Scene = {
          id: uid(),
          visual: sp.visual,
          title: sp.title,
          subtitle: sp.subtitle,
          bullets: sp.bullets ?? [],
          stat: sp.stat,
          narration: sp.narration,
          accent: p.accent,
          bgFrom: p.from,
          bgTo: p.to,
          bgAngle: 120,
          duration: 0,
        };
        base.duration = computeDuration(base);
        return base;
      });
      audioElsRef.current = {};
      setHasAudio(false);
      setProject({ topic, scenes: built, voice });
      setNote(
        data?.note ??
          (data?.source === "openai" ? "AI ile senaryo üretildi." : "İskelet senaryo üretildi.")
      );
    } catch {
      setNote("Senaryo üretilemedi (ağ hatası).");
    } finally {
      setBusy(null);
    }
  };

  // ---- attach AI voice (TTS) ----
  const addVoice = async () => {
    if (!project) return;
    setBusy("audio");
    setNote(null);
    try {
      let any = false;
      let unavailableReason = "";
      const updated = await Promise.all(
        project.scenes.map(async (s) => {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: s.narration, voice }),
          });
          const data = await res.json();
          if (data?.available && data.audio) {
            any = true;
            const audioEl = new Audio(data.audio);
            audioElsRef.current[s.id] = audioEl;
            const dur = await new Promise<number>((resolve) => {
              audioEl.onloadedmetadata = () => resolve(audioEl.duration || 0);
              audioEl.onerror = () => resolve(0);
            });
            return { ...s, audio: data.audio, duration: computeDuration(s, dur) };
          }
          unavailableReason = data?.reason ?? "";
          return s;
        })
      );
      setProject({ ...project, scenes: updated, voice });
      setHasAudio(any);
      setNote(
        any
          ? "AI seslendirme eklendi — dışa aktarımda video sesli olacak."
          : `AI ses yok (${unavailableReason}). Oynatmada tarayıcı sesi + altyazı kullanılacak; export sessiz olur.`
      );
    } catch {
      setNote("Seslendirme isteği başarısız oldu.");
    } finally {
      setBusy(null);
    }
  };

  // ---- live playback ----
  const stopAudio = () => {
    Object.values(audioElsRef.current).forEach((a) => {
      a.pause();
    });
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  };

  const speakScene = (s: Scene) => {
    if (hasAudio) {
      const el = audioElsRef.current[s.id];
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    } else if (typeof speechSynthesis !== "undefined" && s.narration) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(s.narration);
      u.lang = guessLang(s.narration);
      u.rate = 1;
      speechSynthesis.speak(u);
    }
  };

  // Plain (hoisted) function so it can re-schedule itself via requestAnimationFrame.
  // Reads fixed scene/timeline data through closures — these don't change mid-playback.
  function loop() {
    const { total } = timeline;
    const t = (performance.now() - clockRef.current.start) / 1000;
    if (t >= total) {
      drawAt(total - 0.01);
      stopAudio();
      setPlaying(false);
      sceneIdxRef.current = -1;
      return;
    }
    const { i } = sceneAt(t);
    if (i !== sceneIdxRef.current) {
      sceneIdxRef.current = i;
      speakScene(scenes[i]);
    }
    drawAt(t);
    rafRef.current = requestAnimationFrame(loop);
  }

  const play = () => {
    if (!scenes.length) return;
    setPlaying(true);
    sceneIdxRef.current = -1;
    clockRef.current.start = performance.now() - clockRef.current.paused * 1000;
    rafRef.current = requestAnimationFrame(loop);
  };

  const pause = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    clockRef.current.paused = (performance.now() - clockRef.current.start) / 1000;
    stopAudio();
    setPlaying(false);
  };

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    clockRef.current.paused = 0;
    sceneIdxRef.current = -1;
    stopAudio();
    setPlaying(false);
    if (project) drawAt(0);
  }, [project, drawAt]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopAudio();
  }, []);

  // ---- export to webm (real-time) ----
  const exportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !scenes.length) return;
    setBusy("export");
    setExportPct(0);
    setNote(null);
    stop();

    const fps = 30;
    const stream = canvas.captureStream(fps);
    let audioCtx: AudioContext | null = null;

    // Mix scheduled scene audio into the recording when available.
    if (hasAudio) {
      try {
        audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        await Promise.all(
          scenes.map(async (s, i) => {
            if (!s.audio || !audioCtx) return;
            const buf = await fetch(s.audio).then((r) => r.arrayBuffer());
            const decoded = await audioCtx.decodeAudioData(buf);
            const src = audioCtx.createBufferSource();
            src.buffer = decoded;
            src.connect(dest);
            src.start(audioCtx.currentTime + timeline.starts[i] + 0.15);
          })
        );
        dest.stream.getAudioTracks().forEach((tk) => stream.addTrack(tk));
      } catch {
        audioCtx = null;
      }
    }

    const recorder = new MediaRecorder(stream, { mimeType: pickMime() });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    recorder.start(1000);
    const t0 = performance.now();
    const total = timeline.total;

    await new Promise<void>((resolve) => {
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        setExportPct(Math.min(100, Math.round((t / total) * 100)));
        if (t >= total) {
          drawAt(total - 0.01);
          resolve();
          return;
        }
        drawAt(t);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    recorder.stop();
    await done;
    if (audioCtx) audioCtx.close();

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(topic || "video").replace(/\s+/g, "-").slice(0, 40)}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    setBusy(null);
    setNote(
      hasAudio
        ? "Video indirildi (sesli, .webm)."
        : "Video indirildi (.webm) — tarayıcı sesi kaydedilemediği için sessizdir. Sesli video için AI ses ekle."
    );
  };

  const mmss = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

  return (
    <div className="pt-20 pb-16 px-3 md:px-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-white">
          🎬 AI Anlatım <span className="text-red-500">Videosu</span>
        </h1>
        <p className="text-sm text-gray-500">
          Konu yaz → senaryo + seslendirme + 2D animasyon → 15 dk&apos;ya kadar video (.webm)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        {/* Controls */}
        <aside className="rounded-xl p-4 h-fit" style={{ background: "#13131c", border: "1px solid #262636" }}>
          <label className="block mb-3">
            <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Konu</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="örn: Kara delikler nasıl oluşur?"
              className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none focus:border-red-500"
            />
          </label>

          <label className="block mb-3">
            <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
              Süre · {minutes} dk (yaklaşık)
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </label>

          <label className="block mb-3">
            <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
              Notlar (opsiyonel — anahtarsız modda kullanılır)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Kendi metnini/anlatım notlarını buraya yapıştırabilirsin"
              className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none focus:border-red-500"
            />
          </label>

          <label className="block mb-4">
            <span className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Ses</span>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/15 p-2 text-sm text-white outline-none"
            >
              {VOICES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </label>

          <button className={btnPrimary + " w-full mb-2"} onClick={generate} disabled={busy !== null || !topic.trim()}>
            {busy === "script" ? "Senaryo üretiliyor…" : "1) Senaryo Üret"}
          </button>
          <button className={btnGhost + " w-full mb-2"} onClick={addVoice} disabled={busy !== null || !project}>
            {busy === "audio" ? "Ses ekleniyor…" : "2) AI Ses Ekle (opsiyonel)"}
          </button>
          <button className={btnPrimary + " w-full"} onClick={exportVideo} disabled={busy !== null || !project}>
            {busy === "export" ? `Kaydediliyor… %${exportPct}` : "3) Video İndir (.webm)"}
          </button>

          {note && <p className="text-xs text-gray-400 mt-3 leading-relaxed">{note}</p>}
          <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
            Sunucuda <code>OPENAI_API_KEY</code> varsa gerçek AI senaryo + sesli video üretilir. Yoksa konudan/notlardan
            iskelet senaryo + tarayıcı sesi (altyazılı) kullanılır. Export gerçek zamanlıdır: 5 dk&apos;lık video ~5 dk
            kayıt sürer.
          </p>
        </aside>

        {/* Preview */}
        <div>
          <div
            className="relative w-full rounded-xl overflow-hidden"
            style={{ aspectRatio: "16 / 9", border: "1px solid #262636", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", background: "#000" }}
          >
            <canvas ref={canvasRef} width={VW} height={VH} className="absolute inset-0 w-full h-full" />
            {!project && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                Önizleme için önce senaryo üret
              </div>
            )}
          </div>

          {project && (
            <div className="flex items-center gap-2 mt-3">
              {playing ? (
                <button className={btnGhost} onClick={pause}>⏸ Duraklat</button>
              ) : (
                <button className={btnPrimary} onClick={play}>▶ Oynat</button>
              )}
              <button className={btnGhost} onClick={stop}>⏹ Başa al</button>
              <span className="text-xs text-gray-500 ml-auto">
                {scenes.length} sahne · {mmss(timeline.total)} {hasAudio ? "· 🔊 AI ses" : "· 🗣 tarayıcı sesi"}
              </span>
            </div>
          )}

          {/* Scene list (editable narration/title) */}
          {project && (
            <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {scenes.map((s, i) => (
                <div key={s.id} className="rounded-lg p-3 text-sm" style={{ background: "#13131c", border: "1px solid #262636" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.accent, color: "#000" }}>
                      {i + 1} · {s.visual}
                    </span>
                    <span className="text-xs text-gray-500">{mmss(s.duration)}</span>
                  </div>
                  <div className="font-semibold text-white">{s.title}</div>
                  {s.narration && <div className="text-gray-400 text-xs mt-1">{s.narration}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
