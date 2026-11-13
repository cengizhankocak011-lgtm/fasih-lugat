import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FALLBACK_NOTIFY_EMAIL = "cengizhankocak011@gmail.com";
const KINDS = ["destek", "oneri"] as const;
const KIND_LABELS: Record<string, string> = { destek: "Destek talebi", oneri: "Öneri" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notifyByEmail(kind: string, message: string, contact: string | null): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured; feedback email skipped");
    return;
  }

  const label = KIND_LABELS[kind];
  const html = `
    <h2>${escapeHtml(label)}</h2>
    <p style="white-space:pre-wrap;font-size:15px;line-height:1.6">${escapeHtml(message)}</p>
    <p style="color:#666;font-size:13px">İletişim: ${contact ? escapeHtml(contact) : "belirtilmedi"}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: "FasihLügat <onboarding@resend.dev>",
      to: [Deno.env.get("FEEDBACK_NOTIFY_EMAIL") || FALLBACK_NOTIFY_EMAIL],
      subject: `FasihLügat - ${label}`,
      html,
      reply_to: contact && contact.includes("@") ? contact : undefined,
    }),
  });
  if (!res.ok) console.error(`Feedback email failed (${res.status})`);
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

async function withinRateLimit(
  admin: ReturnType<typeof createClient>,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
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
    const kind = typeof body?.kind === "string" ? body.kind : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const contact = typeof body?.contact === "string" ? body.contact.trim() : "";

    if (!(KINDS as readonly string[]).includes(kind)) {
      return jsonResponse({ error: "Geçersiz mesaj türü." }, 400);
    }
    if (message.length < 10 || message.length > 2000) {
      return jsonResponse({ error: "Mesaj 10 ile 2000 karakter arasında olmalı." }, 400);
    }
    if (contact.length > 120) {
      return jsonResponse({ error: "İletişim bilgisi çok uzun." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Supabase service credentials are not configured");
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    if (!(await withinRateLimit(admin, `send-feedback:${clientIp(req)}`, 5, 3600))) {
      return jsonResponse({ error: "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin." }, 429);
    }

    const { error: writeError } = await admin
      .from("feedback_messages")
      .insert({ kind, message, contact: contact || null });
    if (writeError) throw new Error("Mesaj kaydedilemedi");

    try {
      await notifyByEmail(kind, message, contact || null);
    } catch (err) {
      console.error("Feedback email error", err instanceof Error ? err.message : err);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("request failed", err instanceof Error ? err.message : err);
    return jsonResponse({ error: "\u0130stek i\u015flenemedi. L\u00fctfen daha sonra tekrar deneyin." }, 500);
  }
});
