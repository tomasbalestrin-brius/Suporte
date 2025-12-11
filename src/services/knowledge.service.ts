import { supabase } from '@/lib/supabase';
import type { KnowledgeBase } from '@/types';

export const knowledgeService = {
  /**
   * Busca todos os itens da base de conhecimento
   */
  async getAll(activeOnly = true): Promise<KnowledgeBase[]> {
    let query = supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca um item específico por ID
   */
  async getById(id: string): Promise<KnowledgeBase | null> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca conhecimento por palavras-chave
   */
  async searchByKeywords(keywords: string[]): Promise<KnowledgeBase[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .overlaps('keywords', keywords);

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca conhecimento por produto
   */
  async searchByProduct(product: string): Promise<KnowledgeBase[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .or(`product.eq.${product},product.is.null`);

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca conhecimento por categoria
   */
  async searchByCategory(category: string): Promise<KnowledgeBase[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .eq('category', category);

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca conhecimento por texto (título ou conteúdo)
   */
  async searchByText(searchText: string): Promise<KnowledgeBase[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .or(`title.ilike.%${searchText}%,content.ilike.%${searchText}%`);

    if (error) throw error;
    return data || [];
  },

  /**
   * Cria novo item na base de conhecimento
   */
  async create(knowledge: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBase> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(knowledge)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza item da base de conhecimento
   */
  async update(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deleta item da base de conhecimento
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Ativa/desativa item da base de conhecimento
   */
  async toggleActive(id: string, active: boolean): Promise<KnowledgeBase> {
    return this.update(id, { active });
  },
};
