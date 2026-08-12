import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGateway, parseJSON, AIRateLimitError, AICreditsError } from "../_shared/ai-retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Ctx = { name: string; content: string };

const MODULES = `
- knowledge: Nexus-Wissensdatenbank (39 wissenschaftliche Formeln, Mathematik, Informationstheorie, Kryptografie)
- research: Echte Web-Recherche (DuckDuckGo + Wikipedia) für Fakten, Protokolle, Spezifikationen
- termux: Termux/Android/Linux-Spezialisten-Council (Shell, pkg, Root, Netzwerk, Automatisierung)
- debate: Zwei-Hirn-Debatte (skeptisch vs. ehrgeizig) für Architektur- und Machbarkeitsfragen
`;

async function route(prompt: string): Promise<{ modules: string[]; plan: string }> {
  const raw = await callGateway(
    `Du bist der Router eines Systems. Wähle nur die Module, die für die Aufgabe echten Mehrwert bringen.
Verfügbare Module:${MODULES}
Antworte NUR als JSON: {"modules":["knowledge"],"plan":"kurzer Umsetzungsplan in 1-3 Sätzen"}`,
    `Aufgabe: ${prompt}`,
    { jsonMode: true, temperature: 0.2, max_tokens: 400 },
  ).catch(() => "");
  const parsed = parseJSON<{ modules: string[]; plan: string }>(raw, { modules: [], plan: "" });
  const allowed = ["knowledge", "research", "termux", "debate"];
  return {
    modules: (parsed.modules || []).filter((m) => allowed.includes(m)).slice(0, 3),
    plan: parsed.plan || "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = (body?.prompt ?? "").toString().trim();
    const history: { role: string; content: string }[] = Array.isArray(body?.history) ? body.history.slice(-6) : [];

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt fehlt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { modules, plan } = await route(prompt);
    console.log("🧠 omni-solver modules:", modules.join(", ") || "(keine)");

    const jobs: Promise<Ctx | null>[] = [];

    if (modules.includes("knowledge")) {
      jobs.push(
        supabase.functions.invoke("knowledge-manager", { body: { action: "search", query: prompt } })
          .then(({ data }) => {
            const list = (data?.results || data?.entries || []).slice(0, 5)
              .map((e: any) => `• ${e.title}: ${String(e.content).slice(0, 400)}`).join("\n");
            return list ? { name: "NEXUS-WISSEN", content: list } : null;
          }).catch(() => null),
      );
    }
    if (modules.includes("research")) {
      jobs.push(
        supabase.functions.invoke("web-interaction", { body: { action: "research", query: prompt } })
          .then(({ data }) => {
            const txt = typeof data?.result === "string" ? data.result : JSON.stringify(data?.result ?? data ?? {});
            return txt && txt !== "{}" ? { name: "RECHERCHE", content: txt.slice(0, 3000) } : null;
          }).catch(() => null),
      );
    }
    if (modules.includes("termux")) {
      jobs.push(
        supabase.functions.invoke("termux-council", { body: { query: prompt } })
          .then(({ data }) => (data?.final ? { name: "TERMUX-COUNCIL", content: String(data.final).slice(0, 4000) } : null))
          .catch(() => null),
      );
    }
    if (modules.includes("debate")) {
      jobs.push(
        supabase.functions.invoke("dual-brain-debate", { body: { topic: prompt, rounds: 1 } })
          .then(({ data }) => {
            const txt = data?.synthesis || data?.result || "";
            return txt ? { name: "DEBATTE", content: String(txt).slice(0, 2500) } : null;
          }).catch(() => null),
      );
    }

    const ctx = (await Promise.all(jobs)).filter(Boolean) as Ctx[];
    const ctxBlock = ctx.length
      ? ctx.map((c) => `### ${c.name}\n${c.content}`).join("\n\n")
      : "(keine externen Module nötig)";

    const system = `Du bist das Gehirn dieser Plattform. Du lieferst EINE vollständige, sofort lauffähige Python-Lösung.

HARTE REGELN:
- Immer echter Python-Code in einem einzigen \`\`\`python Block, vollständig lauffähig, mit Imports, Fehlerbehandlung und \`if __name__ == "__main__":\`.
- KEINE Platzhalter, KEIN TODO, KEIN "...", KEINE Mock-/Demo-/Fake-Daten, KEINE Simulation von Funktionalität.
- KEINE Science-Fiction-Begriffe, keine Metaphern, keine Marketing-Sprache. Nur Technik, die real funktioniert.
- Wenn Zugangsdaten/Keys nötig sind: über Umgebungsvariablen (os.environ) lesen, nie hardcodieren.
- Externe Pakete: oben als Kommentar die exakte Installationszeile (pip install ...), Termux-tauglich.
- Vor dem Code max. 3 kurze Sätze Kontext, danach max. 5 Stichpunkte "Nutzung" (Befehle, Dateien, Grenzen).
- Bei sehr großen Aufgaben: liefere einen echten, funktionierenden Kern in voller Tiefe statt eines leeren Gerüsts, und nenne die Erweiterungspunkte konkret.
- Antworte auf Deutsch, Code und Bezeichner auf Englisch.

PLAN DES ROUTERS: ${plan || "(keiner)"}

VERFÜGBARER KONTEXT AUS DEN SYSTEMMODULEN:
${ctxBlock}`;

    const convo = history.length
      ? history.map((m) => `${m.role === "user" ? "NUTZER" : "SYSTEM"}: ${String(m.content).slice(0, 1200)}`).join("\n") + "\n\n"
      : "";

    const answer = await callGateway(system, `${convo}AUFGABE: ${prompt}`, {
      temperature: 0.35,
      max_tokens: 8000,
    });

    return new Response(JSON.stringify({ answer, modules, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const rate = e instanceof AIRateLimitError;
    const credits = e instanceof AICreditsError;
    return new Response(JSON.stringify({
      error: credits
        ? "KI-Kontingent erschöpft. Bitte Credits aufladen."
        : rate
          ? "Alle KI-Provider sind gerade ratenlimitiert. Bitte ca. 30 Sekunden warten."
          : (e instanceof Error ? e.message : "Unbekannter Fehler"),
    }), { status: rate ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
