import { supabase } from '@/lib/supabase';

export interface AIFeedback {
  id?: string;
  ticket_id: string;
  message_id?: string;
  rating: 'positive' | 'negative';
  comment?: string;
  user_id?: string;
  created_at?: string;
}

export interface FeedbackStats {
  total: number;
  positive: number;
  negative: number;
  positiveRate: number;
  negativeRate: number;
  recentFeedback: AIFeedback[];
}

export const aiFeedbackService = {
  /**
   * Submete feedback para uma resposta da IA
   */
  async submitFeedback(data: Omit<AIFeedback, 'id' | 'created_at' | 'user_id'>): Promise<AIFeedback> {
    const { data: feedback, error } = await supabase
      .from('ai_feedback')
      .insert({
        ...data,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return feedback;
  },

  /**
   * Atualiza um feedback existente
   */
  async updateFeedback(id: string, updates: Partial<AIFeedback>): Promise<void> {
    const { error } = await supabase
      .from('ai_feedback')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Busca feedback de um ticket específico
   */
  async getFeedbackByTicket(ticketId: string): Promise<AIFeedback[]> {
    const { data, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca feedback de uma mensagem específica
   */
  async getFeedbackByMessage(messageId: string): Promise<AIFeedback | null> {
    const { data, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Busca feedbacks de múltiplas mensagens de uma vez (otimizado)
   * Evita N+1 queries ao carregar feedback em lote
   */
  async getFeedbackByMessages(messageIds: string[]): Promise<Record<string, AIFeedback>> {
    if (messageIds.length === 0) {
      return {};
    }

    const { data, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .in('message_id', messageIds);

    if (error) throw error;

    // Converte array para objeto indexado por message_id
    const feedbackMap: Record<string, AIFeedback> = {};
    data?.forEach((feedback) => {
      if (feedback.message_id) {
        feedbackMap[feedback.message_id] = feedback;
      }
    });

    return feedbackMap;
  },

  /**
   * Busca todos os feedbacks (admin)
   */
  async getAllFeedback(limit = 100): Promise<AIFeedback[]> {
    const { data, error } = await supabase
      .from('ai_feedback')
      .select(`
        *,
        tickets:ticket_id (
          id,
          title,
          protocol
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtém estatísticas de feedback
   */
  async getStats(days = 30): Promise<FeedbackStats> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const total = data?.length || 0;
    const positive = data?.filter(f => f.rating === 'positive').length || 0;
    const negative = data?.filter(f => f.rating === 'negative').length || 0;

    return {
      total,
      positive,
      negative,
      positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativeRate: total > 0 ? Math.round((negative / total) * 100) : 0,
      recentFeedback: data?.slice(0, 10) || [],
    };
  },

  /**
   * Deleta um feedback (admin only)
   */
  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
