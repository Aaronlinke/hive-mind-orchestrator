import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Send, LayoutGrid, Copy, Check, Download, Loader2 } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  modules?: string[];
}

const MODULE_LABEL: Record<string, string> = {
  knowledge: "Nexus-Wissen",
  research: "Web-Recherche",
  termux: "Termux-Council",
  debate: "Dual-Brain",
};

const extractPython = (text: string) => {
  const m = text.match(/```(?:python|py)?\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : "";
};

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="overflow-x-auto rounded-lg bg-background-deep/60 p-3 text-xs leading-relaxed">
    {children}
  </pre>
);

const OmniChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: prompt }];
    setMessages(history);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("omni-solver", {
        body: {
          prompt,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.answer) throw new Error("Leere Antwort. Bitte erneut senden.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, modules: data.modules }]);
    } catch (e: any) {
      toast.error(e?.message || "Anfrage fehlgeschlagen");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Fehler:** ${e?.message || "Anfrage fehlgeschlagen"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, i: number) => {
    const code = extractPython(text) || text;
    await navigator.clipboard.writeText(code);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const download = (text: string) => {
    const code = extractPython(text);
    if (!code) return toast.error("Kein Python-Code in dieser Antwort");
    const url = URL.createObjectURL(new Blob([code], { type: "text/x-python" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution_${Date.now()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background/95 to-accent/5">
      <header className="glass-card sticky top-0 z-20 border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between gap-3 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary via-accent to-secondary p-2.5">
              <Brain className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-lg font-bold md:text-xl">Solver</h1>
              <p className="text-xs text-muted-foreground">Eine Frage — eine vollständige Python-Lösung</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Alle Module</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-3 md:p-6">
        {messages.length === 0 && (
          <div className="mt-10 space-y-4 text-center">
            <h2 className="text-xl font-semibold">Was soll gebaut werden?</h2>
            <p className="text-sm text-muted-foreground">
              Beschreibe die Aufgabe. Das System wählt selbstständig Wissensbasis, Recherche, Termux-Spezialisten
              oder Debatte und liefert eine einzige, lauffähige Lösung.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Portscanner mit Nebenläufigkeit und JSON-Report",
                "Termux-Backup-Script für Fotos nach Nextcloud",
                "Umfrage-Tool mit SQLite und Auswertung",
              ].map((s) => (
                <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => setInput(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "w-full rounded-2xl rounded-bl-sm border border-border/60 bg-card px-4 py-3"
              }
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <>
                  {m.modules && m.modules.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {m.modules.map((mod) => (
                        <Badge key={mod} variant="outline" className="text-[10px]">
                          {MODULE_LABEL[mod] || mod}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-sm prose-invert max-w-none break-words">
                    <ReactMarkdown components={{ pre: ({ children }) => <CodeBlock>{children}</CodeBlock> }}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => copy(m.content, i)}>
                      {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Code
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => download(m.content)}>
                      <Download className="h-3.5 w-3.5" />
                      .py
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Module werden koordiniert und Lösung erstellt…
          </div>
        )}
        <div ref={endRef} />
      </main>

      <div className="sticky bottom-0 border-t border-border/50 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex max-w-3xl items-end gap-2 p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Aufgabe beschreiben…"
            className="max-h-40 min-h-[48px] resize-none"
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-12 w-12 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OmniChat;
