import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Brain,
  Image,
  Video,
  FileText,
  Workflow,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: "KI-Chat starten",
      icon: <Brain className="h-4 w-4" />,
      action: () => {
        navigate("/?tab=chat");
        toast.success("Chat geöffnet");
      },
    },
    {
      label: "Bild generieren",
      icon: <Image className="h-4 w-4" />,
      action: () => {
        navigate("/?tab=image");
        toast.success("Bildgenerator geöffnet");
      },
    },
    {
      label: "Video erstellen",
      icon: <Video className="h-4 w-4" />,
      action: () => {
        navigate("/?tab=video");
        toast.success("Videogenerator geöffnet");
      },
    },
    {
      label: "Workflow starten",
      icon: <Workflow className="h-4 w-4" />,
      action: () => {
        toast.info("Workflow-Auswahl öffnet sich");
      },
    },
    {
      label: "Analytics ansehen",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => {
        navigate("/?tab=analytics");
        toast.success("Analytics geöffnet");
      },
    },
    {
      label: "Vorlage verwenden",
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        navigate("/?tab=templates");
        toast.success("Vorlagen geöffnet");
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary via-accent to-secondary animate-gradient"
          >
            <Zap className="h-6 w-6 animate-pulse" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-background/95 backdrop-blur-lg border-primary/20"
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Schnellaktionen
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
