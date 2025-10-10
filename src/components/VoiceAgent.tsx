import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; url: string; type: string }[];
  timestamp: Date;
}

export const VoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      toast({
        title: "Dateien hinzugefügt",
        description: `${files.length} Datei(en) bereit zum Upload`,
      });
    }
  };

  const uploadFiles = async (): Promise<{ name: string; url: string; type: string }[]> => {
    const uploadedFiles = [];
    
    for (const file of selectedFiles) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `user-uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('agent-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('agent-files')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
        });
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: "Upload Fehler",
          description: `Konnte ${file.name} nicht hochladen`,
          variant: "destructive",
        });
      }
    }

    return uploadedFiles;
  };

  const processVoiceCommand = async (transcript: string) => {
    setIsProcessing(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: transcript,
      timestamp: new Date(),
    };

    // Upload files if any
    let attachments: { name: string; url: string; type: string }[] = [];
    if (selectedFiles.length > 0) {
      attachments = await uploadFiles();
      userMessage.attachments = attachments;
      setSelectedFiles([]);
    }

    setMessages(prev => [...prev, userMessage]);

    try {
      // Bestimme den richtigen Agent basierend auf dem Command
      let functionName = 'fusion-chat';
      let body: any = {
        request: transcript,
        context: {
          conversationHistory: messages.slice(-10),
          attachments,
        }
      };

      // Keywords für spezifische Agenten
      if (transcript.toLowerCase().includes('web') || transcript.toLowerCase().includes('internet') || transcript.toLowerCase().includes('suche')) {
        functionName = 'web-interaction';
        body = { request: transcript, context: body.context };
      } else if (transcript.toLowerCase().includes('bild') || transcript.toLowerCase().includes('visualisier')) {
        functionName = 'visual-concept-generator';
      } else if (transcript.toLowerCase().includes('analysier') || transcript.toLowerCase().includes('chat')) {
        functionName = 'semantic-reasoning';
        body.history = messages.slice(-20);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });

      if (error) throw error;

      let responseContent = '';
      if (data.response) responseContent = data.response;
      else if (data.prognosis) responseContent = `Analyse: ${JSON.stringify(data.prognosis, null, 2)}`;
      else if (data.decision) responseContent = `Entscheidung: ${JSON.stringify(data.decision, null, 2)}`;
      else if (data.content) responseContent = data.content;
      else responseContent = JSON.stringify(data, null, 2);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Text-to-Speech für die Antwort (später mit ElevenLabs)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseContent.substring(0, 200));
        utterance.lang = 'de-DE';
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Voice command error:', error);
      toast({
        title: "Fehler",
        description: "Konnte Befehl nicht verarbeiten",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = async () => {
    try {
      const recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Höre zu...",
          description: "Sprechen Sie Ihren Befehl",
        });
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        await processVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Erkennungsfehler",
          description: "Bitte versuchen Sie es erneut",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice recognition error:', error);
      toast({
        title: "Voice nicht unterstützt",
        description: "Ihr Browser unterstützt keine Spracherkennung",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 glass-card border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Voice Agent</h2>
            <p className="text-sm text-muted-foreground">
              Steuern Sie die KI mit Ihrer Stimme
            </p>
          </div>
          
          <Badge variant={isListening ? "default" : "outline"} className="text-sm">
            {isListening ? "Höre zu..." : "Bereit"}
          </Badge>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={startListening}
            disabled={isListening || isProcessing}
            className="gradient-primary flex-1"
            size="lg"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2 animate-pulse" />
                Zuhören...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Verarbeite...
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Sprechen
              </>
            )}
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.json"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            Files
          </Button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold mb-2">Ausgewählte Dateien:</p>
            <div className="space-y-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Klicken Sie auf "Sprechen" und geben Sie einen Befehl</p>
              <p className="text-xs mt-2">Beispiele:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>"Suche im Internet nach neuesten KI-Trends"</li>
                <li>"Analysiere meine letzten Chats"</li>
                <li>"Erstelle ein Bild von einem Sonnenuntergang"</li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-card border-primary/20'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold mb-1">Anhänge:</p>
                    {message.attachments.map((att, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline">
                          {att.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString('de-DE')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
