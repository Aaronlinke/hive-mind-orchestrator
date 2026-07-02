import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Terminal, Send, Trash2, Copy, Check, Users } from "lucide-react";
import { BOT_LIST, BOTS, type BotId } from "@/lib/termuxBots";
import { useGeminiAI } from "@/hooks/useGeminiAI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Mode = "council" | BotId;

export const TermuxBots = () => {
  const [mode, setMode] = useState<Mode>("council");
  const [messagesByMode, setMessagesByMode] = useState<Record<string, Msg[]>>(
    () => ({ council: [], ...Object.fromEntries(BOT_LIST.map(b => [b.id, []])) })
  );
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [councilLoading, setCouncilLoading] = useState(false);
  const { generate, isLoading: singleLoading } = useGeminiAI();
  const endRef = useRef<HTMLDivElement>(null);

  const isCouncil = mode === "council";
  const bot = !isCouncil ? BOTS[mode as BotId] : null;
  const messages = messagesByMode[mode];
  const isLoading = isCouncil ? councilLoading : singleLoading;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessagesByMode(m => ({ ...m, [mode]: [...m[mode], userMsg] }));
    setInput("");

    if (isCouncil) {
      setCouncilLoading(true);
      try {
        const history = [...messages, userMsg]
          .map(m => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
          .join("\n\n");
        const { data, error } = await supabase.functions.invoke("termux-council", {
          body: { query: history },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const botsList = (data?.bots ?? []).map((b: any) => `${b.name}`).join(" · ");
        const header = botsList ? `_Council: ${botsList}_\n\n` : "";
        const asst: Msg = { id: crypto.randomUUID(), role: "assistant", content: header + (data?.final ?? "(leer)") };
        setMessagesByMode(m => ({ ...m, [mode]: [...m[mode], asst] }));
      } catch (e: any) {
        toast.error(e.message || "Council fehlgeschlagen");
      } finally {
        setCouncilLoading(false);
      }
    } else {
      try {
        const history = [...messages, userMsg]
          .map(m => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
          .join("\n\n");
        const reply = await generate(history, { systemPrompt: bot!.systemPrompt, model: "gemini-2.5-flash" });
        const asst: Msg = { id: crypto.randomUUID(), role: "assistant", content: reply };
        setMessagesByMode(m => ({ ...m, [mode]: [...m[mode], asst] }));
      } catch { /* hook toasts */ }
    }
  };

  const clear = () => setMessagesByMode(m => ({ ...m, [mode]: [] }));

  const copy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Kopiert");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-14rem)]">
      {/* Bot picker */}
      <Card className="p-3 glass-card overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Termux Bots</h3>
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => setMode("council")}
            className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
              isCouncil
                ? "border-primary/60 bg-primary/15"
                : "border-primary/20 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-xs">Council (alle)</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 ml-6 leading-tight">
              Dirigent wählt Spezialisten → 1 Endresultat
            </p>
          </button>
          <div className="h-px bg-border/50 my-2" />
          {BOT_LIST.map(b => (
            <button
              key={b.id}
              onClick={() => setMode(b.id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                mode === b.id
                  ? "border-primary/40 bg-primary/10"
                  : "border-transparent hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{b.emoji}</span>
                <span className="font-medium text-xs">{b.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 ml-7 leading-tight">{b.tagline}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat */}
      <Card className="flex flex-col glass-card overflow-hidden">
        <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{isCouncil ? "🎛️" : bot!.emoji}</span>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">{isCouncil ? "Termux Council" : bot!.name}</h2>
              <p className="text-[10px] text-muted-foreground truncate">
                {isCouncil ? "Router → parallele Bots → 1 Endresultat" : bot!.tagline}
              </p>
            </div>
            <Badge variant="outline" className="ml-2 text-[9px]">{isCouncil ? "Multi-Bot" : "Gemini 2.5"}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={clear} disabled={!messages.length} className="h-7">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <Terminal className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Frag <strong>{isCouncil ? "den Council" : bot!.name}</strong> nach Termux-Commands, Scripts oder Fixes.</p>
                <p className="text-xs mt-2 opacity-70">Antworten sind copy-paste-ready für Termux.</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] rounded-lg p-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 border border-border/40"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:my-2 prose-pre:bg-background/80 prose-pre:border prose-pre:border-border/50 prose-code:text-xs">
                      <ReactMarkdown
                        components={{
                          pre: ({ children, ...props }) => {
                            const codeText = (() => {
                              const child: any = Array.isArray(children) ? children[0] : children;
                              return child?.props?.children?.toString?.() ?? "";
                            })();
                            const cid = crypto.randomUUID();
                            return (
                              <div className="relative group">
                                <pre {...props}>{children}</pre>
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => copy(cid, codeText)}
                                  className="absolute top-1.5 right-1.5 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition"
                                >
                                  {copiedId === cid ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            );
                          },
                        }}
                      >{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-1 text-muted-foreground text-xs pl-2">
                <span className="animate-bounce">▍</span>
                <span>{isCouncil ? "Council tagt (Router → Bots → Synthese)…" : "Bot tippt…"}</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border/50 flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Frage an ${isCouncil ? "den Council" : bot!.name}…`}
            disabled={isLoading}
            className="min-h-[52px] resize-none text-sm"
          />
          <Button onClick={send} disabled={isLoading || !input.trim()} className="self-end h-[52px] px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};