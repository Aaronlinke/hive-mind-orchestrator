import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  skill_id: string;
  skill_path: string;
  is_active: boolean;
  capabilities: any;
  performance_metrics: any;
}

export const useSkillManager = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skill-manager', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Load skills error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkill = async (skillId: string, skillPath: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skill-manager', {
        body: { action: 'load', skillId, skillPath }
      });

      if (error) throw error;
      await loadSkills();
      return data;
    } catch (error) {
      console.error('Load skill error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const executeSkill = async (skillId: string, input: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skill-manager', {
        body: { action: 'execute', skillId, input }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Execute skill error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  return { skills, isLoading, loadSkill, executeSkill, loadSkills };
};
