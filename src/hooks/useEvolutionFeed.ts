import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeedEvent {
  id: string;
  event_type: string;
  event_data: any;
  generation: number;
  timestamp: string;
  visibility: string;
  upvotes: number;
  downvotes: number;
}

export const useEvolutionFeed = () => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evolution_feed')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Load feed error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const vote = async (eventId: string, isUpvote: boolean) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const { error } = await supabase
        .from('evolution_feed')
        .update({
          upvotes: isUpvote ? event.upvotes + 1 : event.upvotes,
          downvotes: !isUpvote ? event.downvotes + 1 : event.downvotes
        })
        .eq('id', eventId);

      if (error) throw error;
      await loadFeed();
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  useEffect(() => {
    loadFeed();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('evolution_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'evolution_feed'
        },
        (payload) => {
          setEvents(prev => [payload.new as FeedEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    events,
    isLoading,
    loadFeed,
    vote
  };
};