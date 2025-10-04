import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Network, Lightbulb, Globe, Eye, Database } from "lucide-react";
import { SemanticReasoningPanel } from "./ai-panels/SemanticReasoningPanel";
import { ResourceOrchestrationPanel } from "./ai-panels/ResourceOrchestrationPanel";
import { SkillManagerPanel } from "./ai-panels/SkillManagerPanel";
import { DecisionEnginePanel } from "./ai-panels/DecisionEnginePanel";
import { KnowledgeManagerPanel } from "./ai-panels/KnowledgeManagerPanel";
import { WebInteractionPanel } from "./ai-panels/WebInteractionPanel";

export const EnhancedAIPanel = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Enhanced AI Capabilities</h2>
      </div>

      <Tabs defaultValue="semantic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="semantic" className="text-xs">
            <Brain className="h-4 w-4 mr-1" />
            Semantic
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">
            <Network className="h-4 w-4 mr-1" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs">
            <Lightbulb className="h-4 w-4 mr-1" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="decision" className="text-xs">
            <Brain className="h-4 w-4 mr-1" />
            Decision
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs">
            <Database className="h-4 w-4 mr-1" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="web" className="text-xs">
            <Globe className="h-4 w-4 mr-1" />
            Web
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semantic">
          <SemanticReasoningPanel />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceOrchestrationPanel />
        </TabsContent>

        <TabsContent value="skills">
          <SkillManagerPanel />
        </TabsContent>

        <TabsContent value="decision">
          <DecisionEnginePanel />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeManagerPanel />
        </TabsContent>

        <TabsContent value="web">
          <WebInteractionPanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
