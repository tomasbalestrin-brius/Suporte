import { supabase } from '@/lib/supabase';

export interface QuickReply {
  id?: string;
  title: string;
  shortcut: string; // Ex: "/senha", "/acesso"
  content: string;
  category: string;
  active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const quickReplyService = {
  /**
   * Busca todas as respostas rápidas ativas
   */
  async getAll(activeOnly = true): Promise<QuickReply[]> {
    let query = supabase
      .from('quick_replies')
      .select('*')
      .order('category')
      .order('title');

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca uma resposta rápida por atalho
   */
  async getByShortcut(shortcut: string): Promise<QuickReply | null> {
    const { data, error } = await supabase
      .from('quick_replies')
      .select('*')
      .eq('shortcut', shortcut)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Cria uma nova resposta rápida
   */
  async create(reply: Omit<QuickReply, 'id' | 'created_at' | 'updated_at'>): Promise<QuickReply> {
    const { data, error } = await supabase
      .from('quick_replies')
      .insert(reply)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza uma resposta rápida
   */
  async update(id: string, updates: Partial<QuickReply>): Promise<void> {
    const { error } = await supabase
      .from('quick_replies')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deleta uma resposta rápida
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quick_replies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle ativo/inativo
   */
  async toggleActive(id: string, active: boolean): Promise<void> {
    await this.update(id, { active });
  },

  /**
   * Busca categorias únicas
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('quick_replies')
      .select('category')
      .eq('active', true);

    if (error) throw error;

    const categories = [...new Set(data.map((r) => r.category))];
    return categories.sort();
  },
};
