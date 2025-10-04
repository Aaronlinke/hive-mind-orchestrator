import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWebInteraction = () => {
  const [isInteracting, setIsInteracting] = useState(false);

  const fetchWebContent = async (url: string) => {
    setIsInteracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('web-interaction', {
        body: { action: 'fetch', url }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fetch web content error:', error);
      throw error;
    } finally {
      setIsInteracting(false);
    }
  };

  const extractContent = async (url: string, selector?: string) => {
    setIsInteracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('web-interaction', {
        body: { action: 'extract', url, selector }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Extract content error:', error);
      throw error;
    } finally {
      setIsInteracting(false);
    }
  };

  const simulateInteraction = async (url: string, actions: any) => {
    setIsInteracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('web-interaction', {
        body: { action: 'interact', url, data: actions }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Simulate interaction error:', error);
      throw error;
    } finally {
      setIsInteracting(false);
    }
  };

  return { fetchWebContent, extractContent, simulateInteraction, isInteracting };
};
