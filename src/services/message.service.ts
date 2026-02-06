import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';
import { emailNotificationService } from './emailNotification.service';

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

    // If message is from admin (has user_id and not AI), send email to customer
    if (data && message.user_id && !message.is_ai) {
      this.sendAdminReplyEmailIfNeeded(data).catch(err => {
        console.error('Error sending admin reply email:', err);
      });
    }

    return data;
  },

  async sendAdminReplyEmailIfNeeded(message: Message) {
    try {
      // Get ticket info with customer details
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          customer_name,
          customer_email,
          user:users(name, email)
        `)
        .eq('id', message.ticket_id)
        .single();

      if (error) throw error;

      // Only send email if customer has an email
      if (ticket?.customer_email) {
        const adminName = (ticket.user as any)?.name || 'Equipe de Suporte';

        await emailNotificationService.sendAdminReplyEmail({
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          customerName: ticket.customer_name || 'Cliente',
          customerEmail: ticket.customer_email,
          replyContent: message.content,
          adminName,
        });
      }
    } catch (error) {
      // Don't throw - we don't want to block message creation
      console.error('Error in sendAdminReplyEmailIfNeeded:', error);
    }
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
