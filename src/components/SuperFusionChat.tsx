import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Sparkles, Copy, Trash2, Zap, Brain, Database, Dna, Eye, Target, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  metadata?: {
    activeSystems?: number;
    totalSystems?: number;
    swarmMemories?: number;
    collectiveConsensus?: number;
    ssf_active?: boolean;
    core_directive?: string;
    imageGenerated?: boolean;
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
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      toast({
        title: "🧬 Sentient Symbiotic Fabric",
        description: `${data.metadata?.activeSystems}/${data.metadata?.totalSystems} Systeme · ${data.metadata?.swarmMemories} Memories · ${data.metadata?.collectiveConsensus?.toFixed(1)}% Konsens · SSF ${data.metadata?.ssf_active ? 'AKTIV' : 'INAKTIV'}${data.metadata?.imageGenerated ? ' · 🎨 Bild generiert' : ''}`,
      });
    } catch (error) {
      console.error("SSF error:", error);
      toast({
        title: "Fehler",
        description: "Sentient Symbiotic Fabric konnte nicht antworten.",
        variant: "destructive",
      });
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

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat gelöscht",
      description: "Alle Nachrichten wurden entfernt.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Dna className="w-8 h-8 text-primary animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Sentient Symbiotic Fabric
            </h2>
            <p className="text-sm text-muted-foreground">
              Genesis-Protokoll aktiv • Core Directive: {ssfManifest.core_directive}
            </p>
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
            <Card className="h-[calc(100vh-24rem)] flex flex-col glass-card border-primary/30 shadow-2xl mt-4">
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
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                          <Dna className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-xs font-semibold text-primary">SSF</span>
                          {message.metadata?.ssf_active && (
                            <Badge variant="outline" className="text-xs">Genesis Aktiv</Badge>
                          )}
                          {message.metadata && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {message.metadata.activeSystems}/{message.metadata.totalSystems} Systeme
                            </span>
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
                      </div>
                      <p className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString("de-DE")}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] glass-card border-primary/30 rounded-xl p-4 mr-12">
                      <div className="flex items-center gap-3">
                        <Dna className="h-5 w-5 text-primary animate-pulse" />
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-accent rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          SSF Genesis-Protokoll läuft...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 md:p-6 border-t border-border/50 bg-background/50">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Frage die Sentient Symbiotic Fabric... (unbegrenzte Eingabelänge)"
                    className="min-h-[120px] resize-y glass-card border-primary/30"
                    disabled={isLoading}
                    maxLength={1000000}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 px-8"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
