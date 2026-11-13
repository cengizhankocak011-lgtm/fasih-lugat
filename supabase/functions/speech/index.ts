import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "gemini-3.8-flash-tts";
const MAX_CHARS = 600;
const STYLE = "Standard Arabic, clear and measured pace, pronounced carefully with full diacritics, like a teacher reading for a learner";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clientIp(req: Request): string {
  const direct = req.headers.get("cf-connecting-ip")?.trim();
  if (direct) return direct.slice(0, 64);
  const hops = (req.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  const trusted = hops.at(-1);
  return trusted ? trusted.slice(0, 64) : "unknown";
}

async function withinRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return true;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.message);
    return true;
  }
  return data !== false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text || text.length > MAX_CHARS) {
      return jsonResponse({ error: "Metin 1-600 karakter olmalıdır." }, 400);
    }

    if (!(await withinRateLimit(`speech:${clientIp(req)}`, 60, 600))) {
      return jsonResponse({ error: "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin." }, 429);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        model: MODEL,
        input: [
          {
            type: "user_input",
            content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style: STYLE }] }],
          },
        ],
        response_format: { type: "audio", mime_type: "audio/wav" },
        generation_config: { speech_config: [{ voice: "Kore" }] },
      }),
    });
    if (!res.ok) throw new Error(`Speech request failed (${res.status})`);

    const data = await res.json();
    const audio = (data?.steps ?? [])
      .filter((step: { type?: string }) => step.type === "model_output")
      .flatMap((step: { content?: { type?: string; data?: unknown }[] }) => step.content ?? [])
      .filter((part: { type?: string }) => part.type === "audio")
      .at(-1);
    if (!audio || typeof audio.data !== "string") throw new Error("Empty audio response");

    const bytes = Uint8Array.from(atob(audio.data), (c) => c.charCodeAt(0));
    return new Response(bytes, { status: 200, headers: { ...corsHeaders, "Content-Type": "audio/wav" } });
  } catch (err) {
    console.error("request failed", err instanceof Error ? err.message : err);
    return jsonResponse({ error: "\u0130stek i\u015flenemedi. L\u00fctfen daha sonra tekrar deneyin." }, 500);
  }
});
