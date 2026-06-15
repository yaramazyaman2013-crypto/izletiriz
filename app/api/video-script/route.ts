// Generates an explainer-video script (a list of scene specs) for a topic.
//
// With OPENAI_API_KEY set it asks an LLM for real, structured content.
// Without a key it builds a usable scaffold from the topic and any notes the
// user pasted, so the studio still works offline.

export const dynamic = "force-dynamic";

type SceneSpec = {
  visual: "title" | "bullets" | "stat" | "quote";
  title: string;
  subtitle: string;
  bullets: string[];
  stat: string;
  narration: string;
};

function clampMinutes(m: unknown): number {
  const n = typeof m === "number" ? m : Number(m);
  if (!Number.isFinite(n)) return 5;
  return Math.min(15, Math.max(1, Math.round(n)));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Offline scaffold: structured intro → sections → recap → outro.
function fallbackScript(topic: string, minutes: number, notes: string): SceneSpec[] {
  const t = topic || "Konu";
  const scenes: SceneSpec[] = [];
  scenes.push({
    visual: "title",
    title: t,
    subtitle: "Hızlı ve anlaşılır anlatım",
    bullets: [],
    stat: "",
    narration: `Merhaba! Bu videoda ${t} konusunu adım adım, basit bir dille anlatacağım. Hazırsan başlayalım.`,
  });
  scenes.push({
    visual: "bullets",
    title: "Bu videoda neler var?",
    subtitle: "",
    bullets: [`${t} nedir?`, "Neden önemli?", "Nasıl çalışır?", "Örnekler ve özet"],
    stat: "",
    narration: `Önce ${t} kavramının ne olduğuna bakacağız, ardından neden önemli olduğunu, nasıl çalıştığını ve birkaç örneği inceleyeceğiz.`,
  });

  const noteSentences = splitSentences(notes);
  if (noteSentences.length) {
    // Turn the user's own notes into section scenes.
    const perScene = 2;
    for (let i = 0; i < noteSentences.length; i += perScene) {
      const chunk = noteSentences.slice(i, i + perScene);
      scenes.push({
        visual: "bullets",
        title: `Bölüm ${Math.floor(i / perScene) + 1}`,
        subtitle: "",
        bullets: chunk,
        stat: "",
        narration: chunk.join(" "),
      });
    }
  } else {
    const target = Math.max(3, minutes * 2);
    const sections = [
      ["Tanım", `${t}, en yalın haliyle bu alandaki temel bir kavramdır. Şimdi bunu biraz açalım.`],
      ["Neden önemli?", `${t} önemlidir çünkü günlük hayatta ve birçok alanda karşımıza çıkar.`],
      ["Nasıl çalışır?", `${t} adım adım ilerleyen bir süreçle çalışır; her adım bir öncekinin üzerine kurulur.`],
      ["Örnek", `${t} konusunu somut bir örnekle düşünelim; böylece kavram netleşir.`],
      ["İpuçları", `${t} öğrenirken pratik yapmak ve küçük örneklerle başlamak çok faydalıdır.`],
    ];
    for (let i = 0; i < target; i++) {
      const s = sections[i % sections.length];
      scenes.push({
        visual: i % 3 === 2 ? "stat" : "bullets",
        title: s[0],
        subtitle: "",
        bullets: i % 3 === 2 ? [] : [s[1]],
        stat: i % 3 === 2 ? `#${i + 1}` : "",
        narration: s[1],
      });
    }
  }

  scenes.push({
    visual: "bullets",
    title: "Özet",
    subtitle: "",
    bullets: ["Ana fikri anladık", "Neden önemli gördük", "Nasıl çalıştığını öğrendik"],
    stat: "",
    narration: `Kısaca özetlersek, ${t} konusunda temel fikri, önemini ve işleyişini gördük.`,
  });
  scenes.push({
    visual: "title",
    title: "Teşekkürler!",
    subtitle: "İzlediğin için sağ ol — abone olmayı unutma!",
    bullets: [],
    stat: "",
    narration: "İzlediğin için teşekkürler! Beğendiysen abone ol ve bir sonraki videoda görüşmek üzere.",
  });
  return scenes;
}

async function llmScript(topic: string, minutes: number, notes: string, key: string): Promise<SceneSpec[]> {
  const sceneCount = Math.max(4, Math.round(minutes * 3));
  const sys =
    "You are a scriptwriter for short animated explainer videos. " +
    "Reply ONLY with strict JSON: an array of scene objects. " +
    'Each object: {"visual":"title|bullets|stat|quote","title":string,"subtitle":string,"bullets":string[],"stat":string,"narration":string}. ' +
    "narration is what the narrator speaks (40-70 words). bullets are short phrases (max 6 words). " +
    "Use 'stat' visual for a single big number/keyword. Write in the same language as the topic.";
  const user = `Topic: ${topic}\nTarget length: ${minutes} minutes (~${sceneCount} scenes).\n${
    notes ? "Use these notes:\n" + notes : "No extra notes."
  }\nReturn ${sceneCount} scenes starting with a title scene and ending with an outro.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user + '\nWrap the array as {"scenes": [...]}.' },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const arr: unknown = Array.isArray(parsed) ? parsed : parsed.scenes;
  if (!Array.isArray(arr)) throw new Error("LLM returned no scenes array");
  return arr.map((s) => {
    const o = s as Record<string, unknown>;
    return {
      visual: (["title", "bullets", "stat", "quote"].includes(String(o.visual)) ? o.visual : "bullets") as SceneSpec["visual"],
      title: String(o.title ?? ""),
      subtitle: String(o.subtitle ?? ""),
      bullets: Array.isArray(o.bullets) ? o.bullets.map(String).slice(0, 6) : [],
      stat: String(o.stat ?? ""),
      narration: String(o.narration ?? ""),
    };
  });
}

export async function POST(request: Request) {
  let topic = "";
  let notes = "";
  let minutes = 5;
  try {
    const body = await request.json();
    topic = String(body?.topic ?? "").trim();
    notes = String(body?.notes ?? "").trim();
    minutes = clampMinutes(body?.minutes);
  } catch {
    /* empty body */
  }

  const key = process.env.OPENAI_API_KEY;
  if (key && topic) {
    try {
      const scenes = await llmScript(topic, minutes, notes, key);
      if (scenes.length) return Response.json({ scenes, source: "openai" });
    } catch (err) {
      return Response.json({
        scenes: fallbackScript(topic, minutes, notes),
        source: "fallback",
        note: `AI senaryo hatası, iskelet senaryoya geçildi: ${(err as Error).message}`,
      });
    }
  }

  return Response.json({
    scenes: fallbackScript(topic, minutes, notes),
    source: "fallback",
    note: key
      ? "Konu boş — iskelet senaryo üretildi."
      : "OPENAI_API_KEY tanımlı değil — konudan/notlardan iskelet senaryo üretildi.",
  });
}
