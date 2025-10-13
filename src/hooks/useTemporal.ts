import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TemporalSnapshot {
  id: string;
  snapshot_time: string;
  generation: number;
  system_state: any;
  agent_states: any;
  consciousness_state: any;
  created_by: string;
}

export const useTemporal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<TemporalSnapshot[]>([]);

  const loadSnapshots = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('temporal_snapshots')
        .select('*')
        .order('snapshot_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSnapshots(data || []);
    } catch (error) {
      console.error('Load snapshots error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSnapshot = async (generation: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('temporal-engine', {
        body: { action: 'create-snapshot', generation }
      });

      if (error) throw error;
      await loadSnapshots();
      return data;
    } catch (error) {
      console.error('Create snapshot error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSnapshot = async (snapshotId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('temporal-engine', {
        body: { action: 'restore-snapshot', snapshotId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Restore snapshot error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    snapshots,
    isLoading,
    loadSnapshots,
    createSnapshot,
    restoreSnapshot
  };
};