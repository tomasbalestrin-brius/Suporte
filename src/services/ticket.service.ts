import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStats } from '@/types';

export const ticketService = {
  async createTicket(ticket: {
    user_id: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    customer_name?: string;
    customer_email?: string;
    customer_cpf?: string;
    product?: string;
  }) {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticket,
        status: 'open',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async getTickets(userId?: string): Promise<Ticket[]> {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTicket(ticketId: string, updates: Partial<Ticket>) {
    const updateData: any = { ...updates };

    // If resolving ticket, set resolved_at
    if (updates.status === 'resolved' && !updates.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTicket(ticketId: string) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
  },

  async getTicketStats(userId?: string): Promise<TicketStats> {
    let query = supabase
      .from('tickets')
      .select('status');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: TicketStats = {
      total: data?.length || 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    data?.forEach((ticket) => {
      stats[ticket.status as keyof Omit<TicketStats, 'total'>]++;
    });

    return stats;
  },

  subscribeToTickets(callback: (payload: any) => void) {
    return supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        callback
      )
      .subscribe();
  },
};
