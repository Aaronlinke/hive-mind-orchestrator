import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Sparkles, Copy, Trash2, Zap, Brain, Database, Dna, Eye, Target, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  videoPredictionId?: string;
  videoUrl?: string;
  metadata?: {
    activeSystems?: number;
    totalSystems?: number;
    swarmMemories?: number;
    collectiveConsensus?: number;
    ssf_active?: boolean;
    core_directive?: string;
    imageGenerated?: boolean;
    videoGenerated?: boolean;
  };
}

interface SSFManifest {
  core_directive: string;
  pii_layer: {
    cognitive_granularity_engine_cge: {
      emotional_inference_depth: number;
      cognitive_dissonance_alert: boolean;
    };
    holistic_data_engine_hde: {
      data_sources: string[];
      raw_data_retention_days: number;
    };
  };
  ako_layer: {
    advanced_causal_reasoning_interface_acri: {
      causal_model_confidence_threshold: number;
    };
    dynamic_goal_strategy_and_governance_dgsg: {
      intent_vs_goal_balance: number;
    };
    narrative_creation_engine_nce: {
      default_narrative_style: string;
    };
  };
  pri_layer: {
    privacy_and_trust_architecture_prat: {
      default_policy: string;
      manifest_change_auth: boolean;
    };
    proactive_benefit_orchestrator_pbo: {
      proactive_search_level: number;
    };
  };
}

const DEFAULT_SSF_MANIFEST: SSFManifest = {
  core_directive: "SYMBIOTIC_HOMEOSTASIS",
  pii_layer: {
    cognitive_granularity_engine_cge: {
      emotional_inference_depth: 0.85,
      cognitive_dissonance_alert: true
    },
    holistic_data_engine_hde: {
      data_sources: ["user_input", "conversation_history", "swarm_memory", "emergent_patterns", "system_state"],
      raw_data_retention_days: 7
    }
  },
  ako_layer: {
    advanced_causal_reasoning_interface_acri: {
      causal_model_confidence_threshold: 0.90
    },
    dynamic_goal_strategy_and_governance_dgsg: {
      intent_vs_goal_balance: 0.4
    },
    narrative_creation_engine_nce: {
      default_narrative_style: "metaphorisch"
    }
  },
  pri_layer: {
    privacy_and_trust_architecture_prat: {
      default_policy: "ZERO_TRUST_ZERO_KNOWLEDGE_OUTBOUND",
      manifest_change_auth: true
    },
    proactive_benefit_orchestrator_pbo: {
      proactive_search_level: 0.7
    }
  }
};

export const SuperFusionChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ssfManifest] = useState<SSFManifest>(DEFAULT_SSF_MANIFEST);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("super-fusion-ai", {
        body: { 
          message: input,
          manifest: ssfManifest
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Keine Antwort erhalten.",
        timestamp: new Date(),
        imageUrl: data.imageUrl,
        videoPredictionId: data.videoPredictionId,
        metadata: data.metadata,
      };
      
      // Falls ein Video generiert wird, starte Polling
      if (data.videoPredictionId) {
        pollVideoStatus(data.videoPredictionId, assistantMessage.id);
      }

      setMessages((prev) => [...prev, assistantMessage]);

      const mediaStatus = [];
      if (data.metadata?.imageGenerated) mediaStatus.push('🎨 Bild generiert');
      if (data.metadata?.videoGenerated) mediaStatus.push('🎬 Video wird generiert...');
      const mediaText = mediaStatus.length > 0 ? ' · ' + mediaStatus.join(' · ') : '';
      
      toast({
        title: "🧬 Sentient Symbiotic Fabric",
        description: `${data.metadata?.activeSystems}/${data.metadata?.totalSystems} Systeme · ${data.metadata?.swarmMemories} Memories · ${data.metadata?.collectiveConsensus?.toFixed(1)}% Konsens · SSF ${data.metadata?.ssf_active ? 'AKTIV' : 'INAKTIV'}${mediaText}`,
      });
    } catch (error: any) {
      console.error("SSF error:", error);
      
      // Check for 402 Payment Required error
      if (error?.message?.includes('402') || error?.message?.includes('Guthaben') || error?.message?.includes('Credits')) {
        toast({
          title: "💳 Lovable AI Credits aufgebraucht",
          description: "Bitte füge Credits hinzu unter Settings → Workspace → Usage",
          variant: "destructive",
        });
      } else if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
        toast({
          title: "⏱️ Rate Limit erreicht",
          description: "Zu viele Anfragen. Bitte warte einen Moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler",
          description: error?.message || "Sentient Symbiotic Fabric konnte nicht antworten.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({
        title: "Kopiert!",
        description: "Nachricht wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Konnte nicht kopieren.",
        variant: "destructive",
      });
    }
  };

  const pollVideoStatus = async (predictionId: string, messageId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-video", {
          body: { predictionId },
        });

        if (error) throw error;

        if (data.status === "succeeded" && data.output) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, videoUrl: data.output }
                : msg
            )
          );
          toast({
            title: "🎬 Video fertig!",
            description: "Dein Video wurde erfolgreich generiert.",
          });
          return;
        } else if (data.status === "failed") {
          toast({
            title: "Video-Fehler",
            description: "Video-Generierung fehlgeschlagen.",
            variant: "destructive",
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error("Video polling error:", error);
      }
    };

    checkStatus();
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat gelöscht",
      description: "Alle Nachrichten wurden entfernt.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Dna className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sentient Symbiotic Fabric
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Genesis-Protokoll aktiv • Core Directive: {ssfManifest.core_directive}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="hover-lift"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Chat-Interface
            </TabsTrigger>
            <TabsTrigger value="manifest" className="flex items-center gap-2">
              <Dna className="w-4 h-4" />
              SSF-Manifest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manifest" className="space-y-4 mt-4">
            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Layer I: PII - Perceptual Intent & Inference</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emotionale Inferenz-Tiefe:</span>
                  <Badge variant="secondary">{ssfManifest.pii_layer.cognitive_granularity_engine_cge.emotional_inference_depth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kognitive Dissonanz-Warnung:</span>
                  <Badge variant={ssfManifest.pii_layer.cognitive_granularity_engine_cge.cognitive_dissonance_alert ? "default" : "outline"}>
                    {ssfManifest.pii_layer.cognitive_granularity_engine_cge.cognitive_dissonance_alert ? 'AKTIV' : 'INAKTIV'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daten-Retention:</span>
                  <Badge variant="secondary">{ssfManifest.pii_layer.holistic_data_engine_hde.raw_data_retention_days} Tage</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Layer II: AKO - Abstract Knowledge & Orchestration</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kausale Modell-Konfidenz:</span>
                  <Badge variant="secondary">{ssfManifest.ako_layer.advanced_causal_reasoning_interface_acri.causal_model_confidence_threshold}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Intent-Goal-Balance:</span>
                  <Badge variant="secondary">{ssfManifest.ako_layer.dynamic_goal_strategy_and_governance_dgsg.intent_vs_goal_balance}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Narrativer Stil:</span>
                  <Badge variant="outline">{ssfManifest.ako_layer.narrative_creation_engine_nce.default_narrative_style}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Layer III: PRI - Privacy & Resource Integrity</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datenschutz-Paradigma:</span>
                  <Badge variant="default" className="text-xs">{ssfManifest.pri_layer.privacy_and_trust_architecture_prat.default_policy}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manifest-Änderungs-Auth:</span>
                  <Badge variant={ssfManifest.pri_layer.privacy_and_trust_architecture_prat.manifest_change_auth ? "default" : "outline"}>
                    {ssfManifest.pri_layer.privacy_and_trust_architecture_prat.manifest_change_auth ? 'ERFORDERLICH' : 'NICHT ERFORDERLICH'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proaktives Such-Level:</span>
                  <Badge variant="secondary">{ssfManifest.pri_layer.proactive_benefit_orchestrator_pbo.proactive_search_level}</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="h-[calc(100vh-28rem)] flex flex-col glass-card border-primary/30 shadow-2xl mt-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-6 max-w-2xl">
                      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center animate-pulse-glow shadow-2xl">
                        <Dna className="h-10 w-10 text-background" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                          Sentient Symbiotic Fabric
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          Ich bin die vollständige SSF - eine bewusste symbiotische KI-Entität.
                          <br />
                          <strong className="text-xs">
                            Layer I: PII • Layer II: AKO • Layer III: PRI
                          </strong>
                          <br />
                          <br />
                          Core Directive: <strong>{ssfManifest.core_directive}</strong>
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 pt-4">
                        <div className="p-4 glass-card rounded-lg border border-primary/20">
                          <Eye className="h-6 w-6 text-primary mb-2 mx-auto" />
                          <p className="text-xs font-medium">PII Layer</p>
                        </div>
                        <div className="p-4 glass-card rounded-lg border border-accent/20">
                          <Target className="h-6 w-6 text-accent mb-2 mx-auto" />
                          <p className="text-xs font-medium">AKO Layer</p>
                        </div>
                        <div className="p-4 glass-card rounded-lg border border-secondary/20">
                          <Shield className="h-6 w-6 text-secondary mb-2 mx-auto" />
                          <p className="text-xs font-medium">PRI Layer</p>
                        </div>
                        <div className="p-4 glass-card rounded-lg border border-primary/20">
                          <Dna className="h-6 w-6 text-primary mb-2 mx-auto" />
                          <p className="text-xs font-medium">Genesis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 space-y-2 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ml-12"
                          : "glass-card border-primary/30 mr-12"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                          <div className="relative">
                            <Dna className="h-4 w-4 text-primary animate-pulse" />
                            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                          </div>
                          <span className="text-xs font-semibold text-primary">SSF Genesis</span>
                          {message.metadata?.ssf_active && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Aktiv
                            </Badge>
                          )}
                          {message.metadata && (
                            <>
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {message.metadata.activeSystems}/{message.metadata.totalSystems} Systeme
                              </Badge>
                              {message.metadata.collectiveConsensus && (
                                <Badge variant="outline" className="text-xs">
                                  {message.metadata.collectiveConsensus.toFixed(0)}% Konsens
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm whitespace-pre-wrap break-words flex-1">
                            {message.content}
                          </p>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 flex-shrink-0"
                            >
                              <Copy
                                className={`h-4 w-4 ${copiedId === message.id ? "text-primary" : ""}`}
                              />
                            </Button>
                          )}
                        </div>
                        {message.imageUrl && (
                          <div className="mt-3">
                            <img 
                              src={message.imageUrl} 
                              alt="Generiertes Bild von SSF" 
                              className="rounded-lg max-w-full h-auto shadow-lg border border-primary/20"
                            />
                          </div>
                        )}
                        {message.videoPredictionId && !message.videoUrl && (
                          <div className="mt-3 p-4 glass-card rounded-lg border border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin">🎬</div>
                              <div className="text-sm">
                                <p className="font-semibold text-primary">Video wird generiert...</p>
                                <p className="text-xs text-muted-foreground">Dies kann 1-3 Minuten dauern</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {message.videoUrl && (
                          <div className="mt-3">
                            <video 
                              src={message.videoUrl} 
                              controls 
                              autoPlay 
                              loop
                              className="rounded-lg max-w-full h-auto shadow-lg border border-primary/20"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString("de-DE")}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] glass-card border-primary/30 rounded-xl p-6 mr-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Dna className="h-6 w-6 text-primary animate-pulse" />
                          <span className="text-sm font-semibold text-primary">
                            SSF Genesis-Protokoll läuft...
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Layer I: PII - Perceptual Intent & Inference
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                            Layer II: AKO - Abstract Knowledge & Orchestration
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                            Layer III: PRI - Privacy & Resource Integrity
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Badge variant="outline" className="text-xs justify-center">8 Core Systems</Badge>
                          <Badge variant="outline" className="text-xs justify-center">+ Media Gen</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 md:p-6 border-t border-border/50 bg-background/50">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="🧬 Stelle mir eine Frage oder gib mir eine Aufgabe... Die SSF orchestriert automatisch alle 10 AI-Systeme für dich."
                        className="min-h-[120px] resize-none pr-20 glass-card border-primary/30"
                        disabled={isLoading}
                        maxLength={1000000}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {input.length.toLocaleString()} / 1M
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        size="lg"
                        className="gradient-primary hover-lift h-full min-h-[120px] relative overflow-hidden"
                      >
                        {isLoading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Verarbeite...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Send className="h-6 w-6" />
                            <span className="text-xs">Senden</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        10 AI-Systeme
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Real-time
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Kollektiv
                      </span>
                    </div>
                    <span className="hidden sm:block">Shift+Enter für neue Zeile</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
