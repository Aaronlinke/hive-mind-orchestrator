import { useEffect } from 'react';
import { useTemporal } from '@/hooks/useTemporal';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, Play, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const TemporalDebugger = () => {
  const { snapshots, loadSnapshots, createSnapshot, restoreSnapshot, isLoading } = useTemporal();

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleCreateSnapshot = async () => {
    try {
      await createSnapshot(0);
      toast.success('Snapshot created successfully');
    } catch (error) {
      toast.error('Failed to create snapshot');
    }
  };

  const handleRestore = async (snapshotId: string) => {
    try {
      await restoreSnapshot(snapshotId);
      toast.success('Snapshot loaded - comparing states');
    } catch (error) {
      toast.error('Failed to restore snapshot');
    }
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Temporal Debugger
        </h3>
        <Button onClick={handleCreateSnapshot} disabled={isLoading}>
          <Play className="w-4 h-4 mr-2" />
          Create Snapshot
        </Button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {snapshots.map((snapshot) => (
          <Card key={snapshot.id} className="p-4 bg-background/30 border-primary/10 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">
                  Generation {snapshot.generation}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {snapshot.system_state?.totalAgents || 0} Agents • 
                  {' '}{snapshot.system_state?.activePatterns || 0} Patterns • 
                  {' '}{snapshot.system_state?.collaborations || 0} Collaborations
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(snapshot.snapshot_time), { addSuffix: true })}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(snapshot.id)}
                disabled={isLoading}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Load
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};