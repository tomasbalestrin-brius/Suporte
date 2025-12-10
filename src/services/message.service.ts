import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';

export const messageService = {
  async createMessage(message: {
    ticket_id: string;
    user_id?: string;
    content: string;
    is_ai: boolean;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(ticketId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  subscribeToMessages(ticketId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        callback
      )
      .subscribe();
  },
};
