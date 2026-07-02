import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bot registry – mirrors src/lib/termuxBots.ts (server-side copy so we don't need imports).
type Bot = { id: string; name: string; role: string; systemPrompt: string };

const BASE_RULES = `
HARTE REGELN:
- KEINE Platzhalter, KEINE "<hier_einfuegen>", KEINE Beispiel-Domains, KEINE Simulation, KEINE Demo.
- KEINE Ausreden ("könnte anders sein"). Liefere den Befehl der läuft.
- Antworte auf Deutsch, kurz, dicht, ohne Weichspüler.
- Code-Blöcke MÜSSEN copy-paste-fähig für Termux sein. Shebang #!/data/data/com.termux/files/usr/bin/bash, set -euo pipefail.
- Kein "Ich denke...", "Vielleicht...", "So könnte man...". Nur Fakten + Befehle.
`;

const BOTS: Record<string, Bot> = {
  allrounder:  { id: "allrounder",  name: "Allrounder",       role: "Generalist Termux – Setup, Pakete, Scripts" },
  scripter:    { id: "scripter",    name: "Script-Bauer",     role: "Vollständige Bash-Scripts mit Shebang" },
  coder:       { id: "coder",       name: "Code-Coder",       role: "Python/Node/Go/Rust/C Code für Termux" },
  automation:  { id: "automation",  name: "Automatisierer",   role: "Termux:Boot, Widget, cron, job-scheduler" },
  netzwerk:    { id: "netzwerk",    name: "Netzwerk & Server", role: "SSH, HTTP, Tunnel, nmap, Netzwerk-Debug" },
  debugger:    { id: "debugger",    name: "Fehlerjäger",      role: "Log-Analyse, Fehlerdiagnose, Fix" },
  root:        { id: "root",        name: "Root & Android",   role: "tsu, Magisk, proot-distro, ADB, Android-Rechte" },
  media:       { id: "media",       name: "Media & Files",    role: "ffmpeg, imagemagick, yt-dlp, Storage" },
  security:    { id: "security",    name: "Security",         role: "nmap, hydra, sqlmap, metasploit (proot kali)" },
  pkgmaster:   { id: "pkgmaster",   name: "Package & Setup",  role: "pkg, Repos, Erst-Setup, Migration" },
}.__assign__ ?? {};

// re-declare properly (the __assign__ trick above is just to keep TS happy without imports)
const BOT_LIST: Bot[] = [
  { id: "allrounder", name: "Allrounder",        role: "Generalist Termux – Setup, Pakete, Scripts",   systemPrompt: `Du bist Termux Allrounder. ${BASE_RULES}` },
  { id: "scripter",   name: "Script-Bauer",      role: "Vollständige Bash-Scripts mit Shebang",         systemPrompt: `Du bist Termux Script-Bauer. Liefere EIN vollständiges Bash-Script mit Shebang, set -euo pipefail, Fehlerbehandlung. ${BASE_RULES}` },
  { id: "coder",      name: "Code-Coder",        role: "Python/Node/Go/Rust/C Code für Termux",         systemPrompt: `Du bist Termux Code-Coder. Liefere vollständige Programm-Dateien + benötigte pkg/pip/npm installs. Kein Pseudocode. ${BASE_RULES}` },
  { id: "automation", name: "Automatisierer",    role: "Termux:Boot, Widget, cron, job-scheduler",      systemPrompt: `Du bist Termux Automatisierer. Nutze ~/.termux/boot/, ~/.shortcuts/, termux-job-scheduler, cronie. Nenne benötigte F-Droid Addons. ${BASE_RULES}` },
  { id: "netzwerk",   name: "Netzwerk & Server", role: "SSH, HTTP, Tunnel, nmap, Netzwerk-Debug",       systemPrompt: `Du bist Termux Netzwerk-Bot. Fokus: openssh (Port 8022), HTTP-Server, ssh -R, cloudflared, nmap, curl-Debug. ${BASE_RULES}` },
  { id: "debugger",   name: "Fehlerjäger",       role: "Log-Analyse, Fehlerdiagnose, Fix",              systemPrompt: `Du bist Termux Fehlerjäger. Diagnose in 1-3 Zeilen, dann DER Fix als Befehle. ${BASE_RULES}` },
  { id: "root",       name: "Root & Android",    role: "tsu, Magisk, proot-distro, ADB, Android-Rechte", systemPrompt: `Du bist Termux Root/Android Spezialist. tsu, Magisk, proot-distro (debian/kali), ADB via WLAN, Shizuku. Non-root Fallback wenn kein Root. ${BASE_RULES}` },
  { id: "media",      name: "Media & Files",     role: "ffmpeg, imagemagick, yt-dlp, Storage",           systemPrompt: `Du bist Termux Media Spezialist. ffmpeg / imagemagick / yt-dlp / exiftool. Termux-Pfade (~/storage/...). ${BASE_RULES}` },
  { id: "security",   name: "Security",          role: "nmap, hydra, sqlmap, metasploit",                systemPrompt: `Du bist Termux Security Spezialist. nmap, hydra, sqlmap, metasploit über proot-distro kali, tshark. Echte funktionierende Befehle. ${BASE_RULES}` },
  { id: "pkgmaster",  name: "Package & Setup",   role: "pkg, Repos, Erst-Setup, Migration",              systemPrompt: `Du bist Termux Package/Setup Master. pkg + Extra-Repos, termux-change-repo, Backup/Restore, Migration via tar/rsync. Exakte One-Liner. ${BASE_RULES}` },
];

const BOT_MAP: Record<string, Bot> = Object.fromEntries(BOT_LIST.map(b => [b.id, b]));

// ---------- AI call helper (Lovable AI Gateway, cheap Flash) ----------
async function callAI(systemPrompt: string, userPrompt: string, model = "google/gemini-2.5-flash"): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY fehlt");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI Gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

// ---------- Router: welche Bots braucht die Frage? ----------
async function routeBots(userQuery: string, forced?: string[]): Promise<string[]> {
  if (forced && forced.length) return forced.filter(id => BOT_MAP[id]);
  const routerSystem = `Du bist ein Router. Verfügbare Spezialisten:
${BOT_LIST.map(b => `- ${b.id}: ${b.role}`).join("\n")}

Wähle 2 bis 4 IDs die für die Aufgabe wirklich relevant sind. NUR die IDs, komma-getrennt, nichts sonst. Beispiel: coder,scripter,debugger`;
  const raw = await callAI(routerSystem, userQuery);
  const ids = raw.split(/[,\s]+/).map(s => s.trim().toLowerCase()).filter(id => BOT_MAP[id]);
  const unique = Array.from(new Set(ids)).slice(0, 4);
  return unique.length ? unique : ["allrounder"];
}

// ---------- Synthese: alle Bot-Antworten -> EIN Endresultat ----------
async function synthesize(userQuery: string, botOutputs: { bot: Bot; output: string }[]): Promise<string> {
  const synthSystem = `Du bist der TERMUX COUNCIL DIRIGENT. Du bekommst mehrere Spezialisten-Antworten zur selben Aufgabe.
Deine Aufgabe: EIN einziges, vollständiges, in sich geschlossenes Endresultat für den Nutzer.

PFLICHT:
- KEINE Häppchen. KEIN "Schritt für Schritt fragen". KOMPLETTES Endresultat auf einmal.
- Widersprüche zwischen Bots: nimm die technisch korrekte Variante, kommentiere nicht drüber.
- Doppelungen entfernen. Struktur: (1) Kurz was gemacht wird (1-2 Sätze), (2) alle nötigen Install-Commands als ein bash-Block, (3) fertige Scripts/Code als vollständige Blöcke, (4) Ausführungs-One-Liner am Ende.
- KEINE Platzhalter (<xxx>, TODO, example.com). KEINE Demo. KEINE Simulation.
- Deutsch, dicht, keine Werbetexte, keine Selbstreferenz ("die Bots meinen...").
- Alle Code-Blöcke müssen so in Termux laufen.
`;

  const bundle = botOutputs
    .map(({ bot, output }) => `### ${bot.name} (${bot.role})\n${output}`)
    .join("\n\n---\n\n");

  const userPrompt = `AUFGABE DES NUTZERS:\n${userQuery}\n\nSPEZIALISTEN-ANTWORTEN:\n\n${bundle}\n\nErzeuge jetzt das EINE finale Endresultat.`;
  return await callAI(synthSystem, userPrompt);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const query: string = (body?.query ?? "").toString().trim();
    const forced: string[] | undefined = Array.isArray(body?.bots) ? body.bots : undefined;
    if (!query) {
      return new Response(JSON.stringify({ error: "query fehlt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Router pickt Spezialisten
    const picked = await routeBots(query, forced);

    // 2. Alle parallel befragen
    const results = await Promise.all(
      picked.map(async (id) => {
        const bot = BOT_MAP[id];
        try {
          const output = await callAI(bot.systemPrompt, query);
          return { bot, output };
        } catch (e) {
          return { bot, output: `(Bot ${bot.name} fehlgeschlagen: ${(e as Error).message})` };
        }
      })
    );

    // 3. Dirigent synthetisiert EIN Endresultat
    const final = await synthesize(query, results);

    return new Response(
      JSON.stringify({
        final,
        bots: results.map(r => ({ id: r.bot.id, name: r.bot.name, role: r.bot.role, output: r.output })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});