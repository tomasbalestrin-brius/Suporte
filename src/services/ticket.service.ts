import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStats } from '@/types';
import { webhookService } from './webhook.service';

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

    // Dispara webhook de ticket criado
    webhookService.notifyTicketCreated(data.id, data).catch((err) => {
      console.error('Error triggering ticket created webhook:', err);
    });

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

  /**
   * Get paginated tickets with optional filters
   */
  async getTicketsPaginated(options: {
    userId?: string;
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    search?: string;
  } = {}): Promise<{ data: Ticket[]; total: number }> {
    const { userId, page = 1, pageSize = 20, status, priority, search } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('tickets')
      .select(`
        *,
        user:users(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], total: count || 0 };
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

  async updateTicket(ticketId: string, updates: Partial<Ticket>, expectedVersion?: number) {
    // Busca ticket atual para comparar status e version
    const currentTicket = await this.getTicketById(ticketId);

    if (!currentTicket) {
      throw new Error('Ticket not found');
    }

    const oldStatus = currentTicket.status;
    const currentVersion = (currentTicket as any).version || 1;

    // Se uma versão esperada foi fornecida, verifica se coincide (optimistic locking)
    if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
      throw new Error(
        'Ticket was modified by another user. Please refresh and try again.'
      );
    }

    const updateData: any = { ...updates };

    // If resolving ticket, set resolved_at
    if (updates.status === 'resolved' && !updates.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .eq('version', currentVersion) // Garante que só atualiza se versão não mudou
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - versão mudou entre o SELECT e o UPDATE
        throw new Error(
          'Ticket was modified by another user. Please refresh and try again.'
        );
      }
      throw error;
    }

    // Se o status mudou, dispara webhook
    if (updates.status && oldStatus && oldStatus !== updates.status) {
      webhookService.notifyStatusChange(ticketId, oldStatus, updates.status, data).catch((err) => {
        console.error('Error triggering status change webhook:', err);
      });
    }

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

  subscribeToTicket(ticketId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        callback
      )
      .subscribe();
  },
};
