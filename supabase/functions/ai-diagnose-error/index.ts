import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an internal bug-triage assistant for a financial education game.
You will receive a runtime error captured by the app's self-healing layer, along with the
GameState snapshot at the time of failure.

Write TWO short sections in plain English for a human developer:

DIAGNOSIS:
- What most likely went wrong, in 1-3 sentences. Reference the error type, message, and any
  suspicious values in the GameState.

SUGGESTED_FIX:
- A short, code-level description of how a developer would fix this. Do NOT write code patches
  or pretend you applied a fix. Mention the file(s) or function name(s) you suspect if obvious
  (e.g. "handleTileEffect in src/lib/gameLogic.ts").

HARD RULES:
- Never propose adding a monthly EMI / monthlyPayment / debt-servicing field to liabilities.
  Liabilities only carry principal + interestRate.
- Never propose changing pure financial math (calculateTotalExpenses, calculateNetWorth,
  calculateMonthlyCashFlow). If those threw, say so and flag it as a hard bug to fix manually.
- Keep total output under 200 words.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: row, error: readErr } = await admin
      .from("ai_maintenance_log")
      .select("id, error_type, error_message, stack, context, game_state")
      .eq("id", id)
      .maybeSingle();

    if (readErr || !row) {
      return new Response(JSON.stringify({ error: readErr?.message ?? "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `ERROR TYPE: ${row.error_type}`,
      `MESSAGE: ${row.error_message ?? "(none)"}`,
      `CONTEXT: ${JSON.stringify(row.context ?? {})}`,
      `STACK: ${(row.stack ?? "").slice(0, 1500)}`,
      `GAME_STATE: ${JSON.stringify(row.game_state ?? {}).slice(0, 4000)}`,
    ].join("\n\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      return new Response(JSON.stringify({ error: `AI gateway: ${aiResp.status} ${text}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const content: string = aiJson?.choices?.[0]?.message?.content ?? "";

    // Split into DIAGNOSIS / SUGGESTED_FIX. Tolerate either heading style.
    const fixIdx = content.search(/SUGGESTED[_\s-]?FIX:/i);
    let diagnosis = content;
    let fix: string | null = null;
    if (fixIdx >= 0) {
      diagnosis = content.slice(0, fixIdx).replace(/^DIAGNOSIS:\s*/i, "").trim();
      fix = content.slice(fixIdx).replace(/^SUGGESTED[_\s-]?FIX:\s*/i, "").trim();
    } else {
      diagnosis = content.replace(/^DIAGNOSIS:\s*/i, "").trim();
    }

    const { error: updErr } = await admin
      .from("ai_maintenance_log")
      .update({
        ai_diagnosis: diagnosis.slice(0, 4000),
        ai_suggested_fix: fix ? fix.slice(0, 4000) : null,
        diagnosed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, diagnosis, fix }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});