// Shared AI provider helpers. OpenRouter is preferred (OpenAI-compatible);
// OpenAI is used as a fallback. TTS is OpenAI-only (OpenRouter has no speech
// endpoint).

interface ChatProvider {
  url: string;
  key: string;
  model: string;
  headers: Record<string, string>;
}

function orHeaders(): Record<string, string> {
  return {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://izletiriz.vercel.app",
    "X-Title": "Izletiriz Studio",
  };
}

export function chatProvider(): ChatProvider | null {
  const or = process.env.OPENROUTER_API_KEY;
  if (or) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: or,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      headers: orHeaders(),
    };
  }
  const oa = process.env.OPENAI_API_KEY;
  if (oa) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      key: oa,
      model: "gpt-4o-mini",
      headers: {},
    };
  }
  return null;
}

export function hasChat(): boolean {
  return chatProvider() !== null;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatComplete(messages: ChatMessage[], jsonMode = false): Promise<string> {
  const p = chatProvider();
  if (!p) throw new Error("AI sağlayıcı yok (OPENROUTER_API_KEY / OPENAI_API_KEY)");
  const body: Record<string, unknown> = { model: p.model, temperature: 0.8, messages };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(p.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}`, ...p.headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Chat ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

// ---- image generation -------------------------------------------------------

// OpenRouter image generation via a multimodal model that returns images in
// the chat response.
async function openRouterImage(prompt: string, key: string): Promise<string> {
  const model = process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-2.5-flash-image";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...orHeaders() },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: `Generate a 16:9 YouTube thumbnail background image. Vivid, high contrast, dramatic lighting, no text, no watermark. Subject: ${prompt}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    const hint =
      res.status === 404
        ? ` — '${model}' görsel modeli bulunamadı. OPENROUTER_IMAGE_MODEL ile geçerli bir görsel modeli ayarla.`
        : "";
    throw new Error(`OpenRouter image ${res.status}: ${detail}${hint}`);
  }
  const data = await res.json();
  const msg = data?.choices?.[0]?.message;
  const url =
    msg?.images?.[0]?.image_url?.url ??
    msg?.images?.[0]?.url ??
    (typeof msg?.content === "string" && msg.content.startsWith("data:") ? msg.content : null);
  if (!url) throw new Error("OpenRouter: görsel dönmedi");
  return url;
}

async function openAiImage(prompt: string, key: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: `YouTube thumbnail background, 16:9, vivid, high contrast, no text: ${prompt}`,
      size: "1536x1024",
      n: 1,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI image ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) return `data:image/png;base64,${b64}`;
  const url = data?.data?.[0]?.url;
  if (url) return url;
  throw new Error("OpenAI: görsel dönmedi");
}

// Returns a generated image URL/data-URL, or null if no provider is configured.
// Throws on provider error so callers can fall back to a procedural image.
export async function generateImage(prompt: string): Promise<string | null> {
  const or = process.env.OPENROUTER_API_KEY;
  if (or) return openRouterImage(prompt, or);
  const oa = process.env.OPENAI_API_KEY;
  if (oa) return openAiImage(prompt, oa);
  return null;
}

export function imageSource(): "openrouter" | "openai" | null {
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}
