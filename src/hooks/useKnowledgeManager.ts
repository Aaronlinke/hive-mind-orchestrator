import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useKnowledgeManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchKnowledge = async (query: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-manager', {
        body: { action: 'search', query }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Search knowledge error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addKnowledge = async (knowledge: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-manager', {
        body: { action: 'add', knowledge }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add knowledge error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addNode = async (knowledge: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-manager', {
        body: { action: 'addNode', knowledge }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add node error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addEdge = async (edgeData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-manager', {
        body: { action: 'addEdge', edgeData }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add edge error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { searchKnowledge, addKnowledge, addNode, addEdge, isLoading };
};
