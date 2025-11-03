import { useState, useRef, useEffect } from 'react';
import { useSupremeOrchestrator } from '@/hooks/useSupremeOrchestrator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Trash2, Sparkles, Zap } from 'lucide-react';

export const SupremeOrchestratorChat = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, streamingContent, sendMessage, clearMessages } = useSupremeOrchestrator();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <Zap className="w-4 h-4 text-accent absolute -top-1 -right-1" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SUPREME ORCHESTRATOR
              </CardTitle>
              <CardDescription>
                Meta-System aller AI-Funktionen • Maximale Intelligenz
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={clearMessages}
            variant="outline"
            size="sm"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="default">🧠 Alle Spezialisten</Badge>
          <Badge variant="secondary">🔮 Collective Intelligence</Badge>
          <Badge variant="outline">⚡ Master Orchestrator</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Supreme Orchestrator bereit</p>
                <p className="text-sm">Alle AI-Systeme sind synchronisiert und einsatzbereit</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.timestamp && (
                    <p className="text-xs opacity-70 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stelle deine Frage an das Supreme AI-System..."
            disabled={isLoading}
            className="min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="self-end"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
