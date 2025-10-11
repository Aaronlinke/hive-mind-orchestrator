import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Brain,
  Image,
  Video,
  BarChart3,
  Mic,
  FileText,
  Settings,
  LogOut,
  Zap,
  Workflow,
  Trophy,
  Palette,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: Command[] = [
    {
      id: "chat",
      label: "Chat mit KI öffnen",
      icon: <Brain className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/");
        toast.success("Chat geöffnet");
      },
      category: "Navigation",
    },
    {
      id: "swarm",
      label: "Schwarm-Intelligenz",
      icon: <Brain className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/swarm-intelligence");
        toast.success("Schwarm-Intelligenz geöffnet");
      },
      category: "Navigation",
    },
    {
      id: "image",
      label: "Bild generieren",
      icon: <Image className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/?tab=image");
        toast.success("Bildgenerator geöffnet");
      },
      category: "Tools",
    },
    {
      id: "video",
      label: "Video generieren",
      icon: <Video className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/?tab=video");
        toast.success("Videogenerator geöffnet");
      },
      category: "Tools",
    },
    {
      id: "analytics",
      label: "Analytics öffnen",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/?tab=analytics");
        toast.success("Analytics geöffnet");
      },
      category: "Navigation",
    },
    {
      id: "voice",
      label: "Sprachassistent",
      icon: <Mic className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/?tab=voice");
        toast.success("Sprachassistent geöffnet");
      },
      category: "Tools",
    },
    {
      id: "templates",
      label: "Vorlagen durchsuchen",
      icon: <FileText className="mr-2 h-4 w-4" />,
      action: () => {
        navigate("/?tab=templates");
        toast.success("Vorlagen geöffnet");
      },
      category: "Tools",
    },
    {
      id: "workflows",
      label: "Workflows verwalten",
      icon: <Workflow className="mr-2 h-4 w-4" />,
      action: () => {
        toast.info("Workflow-Manager öffnet sich");
      },
      category: "Produktivität",
    },
    {
      id: "achievements",
      label: "Erfolge ansehen",
      icon: <Trophy className="mr-2 h-4 w-4" />,
      action: () => {
        toast.info("Erfolge werden angezeigt");
      },
      category: "Profil",
    },
    {
      id: "theme",
      label: "Theme anpassen",
      icon: <Palette className="mr-2 h-4 w-4" />,
      action: () => {
        toast.info("Theme-Editor öffnet sich");
      },
      category: "Einstellungen",
    },
    {
      id: "logout",
      label: "Abmelden",
      icon: <LogOut className="mr-2 h-4 w-4" />,
      action: async () => {
        await supabase.auth.signOut();
        toast.success("Erfolgreich abgemeldet");
      },
      category: "Account",
    },
  ];

  const categories = Array.from(new Set(commands.map((cmd) => cmd.category)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Suche Befehle... (Cmd/Ctrl + K)" />
      <CommandList>
        <CommandEmpty>Keine Befehle gefunden.</CommandEmpty>
        {categories.map((category, idx) => (
          <div key={category}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {commands
                .filter((cmd) => cmd.category === category)
                .map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => {
                      cmd.action();
                      setOpen(false);
                    }}
                  >
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
