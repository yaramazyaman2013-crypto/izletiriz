// Text-to-speech for the video studio. Returns an mp3 data URL when
// OPENAI_API_KEY is set; otherwise responds with available:false so the client
// falls back to the browser's built-in SpeechSynthesis voice.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let text = "";
  let voice = "alloy";
  try {
    const body = await request.json();
    text = String(body?.text ?? "").trim();
    if (body?.voice) voice = String(body.voice);
  } catch {
    /* empty body */
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json({ available: false, reason: "OPENAI_API_KEY tanımlı değil" });
  }
  if (!text) {
    return Response.json({ available: false, reason: "Metin boş" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, format: "mp3" }),
    });
    if (!res.ok) {
      return Response.json({
        available: false,
        reason: `TTS ${res.status}: ${(await res.text()).slice(0, 160)}`,
      });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return Response.json({
      available: true,
      audio: `data:audio/mp3;base64,${buf.toString("base64")}`,
    });
  } catch (err) {
    return Response.json({ available: false, reason: (err as Error).message });
  }
}
