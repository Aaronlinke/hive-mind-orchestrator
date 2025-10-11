import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Workflow, Plus, Play, Edit, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkflowType {
  id: string;
  name: string;
  description: string | null;
  steps: any;
  is_active: boolean;
  usage_count: number;
}

export const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    steps: [],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Fehler beim Laden der Workflows");
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("workflows").insert({
        user_id: user.id,
        name: newWorkflow.name,
        description: newWorkflow.description,
        steps: newWorkflow.steps,
      });

      if (error) throw error;

      toast.success("Workflow erstellt!");
      setIsCreateOpen(false);
      setNewWorkflow({ name: "", description: "", steps: [] });
      fetchWorkflows();
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Fehler beim Erstellen des Workflows");
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      await supabase
        .from("workflows")
        .update({ usage_count: workflows.find((w) => w.id === workflowId)!.usage_count + 1 })
        .eq("id", workflowId);

      toast.success("Workflow gestartet!");
      fetchWorkflows();
    } catch (error) {
      console.error("Error running workflow:", error);
      toast.error("Fehler beim Ausführen des Workflows");
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase.from("workflows").delete().eq("id", workflowId);

      if (error) throw error;
      toast.success("Workflow gelöscht");
      fetchWorkflows();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Workflow-Builder
          </span>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Neu
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Neuer Workflow</DialogTitle>
                <DialogDescription>
                  Erstelle einen neuen Workflow für wiederkehrende Aufgaben
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="z.B. Content-Erstellung"
                    value={newWorkflow.name}
                    onChange={(e) =>
                      setNewWorkflow({ ...newWorkflow, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea
                    placeholder="Was macht dieser Workflow?"
                    value={newWorkflow.description}
                    onChange={(e) =>
                      setNewWorkflow({ ...newWorkflow, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflow.name}
                  className="gradient-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Workflows. Erstelle deinen ersten Workflow!
            </p>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      {workflow.is_active && (
                        <Badge variant="default" className="text-xs">
                          Aktiv
                        </Badge>
                      )}
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {workflow.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {workflow.usage_count}x verwendet
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleRunWorkflow(workflow.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
