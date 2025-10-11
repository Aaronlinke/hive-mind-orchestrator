import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  image?: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Willkommen beim KI-Orchestrator!",
    description:
      "Entdecke die Macht der kollektiven KI-Intelligenz. Dieser Guide zeigt dir die wichtigsten Features.",
  },
  {
    title: "KI-Hierarchie",
    description:
      "Wähle zwischen Schwarm-KI, Direktor, Managern und Spezialisten. Jede KI hat ihre eigenen Stärken.",
  },
  {
    title: "Multi-KI Modus",
    description:
      "Aktiviere mehrere KIs gleichzeitig für komplexe Aufgaben. Die KIs arbeiten zusammen für beste Ergebnisse.",
  },
  {
    title: "Command Palette",
    description:
      "Drücke Cmd/Ctrl + K für schnellen Zugriff auf alle Funktionen. Navigiere blitzschnell durch die App.",
  },
  {
    title: "Schnellaktionen",
    description:
      "Der Floating Action Button unten rechts gibt dir sofortigen Zugriff auf die wichtigsten Tools.",
  },
  {
    title: "Analytics & Monitoring",
    description:
      "Überwache die Performance deiner KIs in Echtzeit. Optimiere deine Workflows basierend auf Daten.",
  },
];

export const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenTour) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] glass-card">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            {tourSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            {tourSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Schritt {currentStep + 1} von {tourSteps.length}
          </p>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Überspringen
            </Button>
            <Button onClick={handleNext} className="gradient-primary">
              {currentStep === tourSteps.length - 1 ? "Fertig" : "Weiter"}
              {currentStep !== tourSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
