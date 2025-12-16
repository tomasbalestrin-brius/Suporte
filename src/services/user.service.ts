import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'agent' | 'user';
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  /**
   * Busca todos os usuários (admin only)
   */
  async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca um usuário por ID
   */
  async getUserById(id: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Cria um novo usuário (apenas os dados do usuário na tabela users)
   * Nota: Para criar autenticação completa, use Supabase Auth Admin API
   */
  async createUser(user: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, updates: Partial<AdminUser>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deleta um usuário
   */
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle ativo/inativo
   */
  async toggleActive(id: string, active: boolean): Promise<void> {
    await this.updateUser(id, { active });
  },

  /**
   * Atualiza role do usuário
   */
  async updateRole(id: string, role: 'admin' | 'agent' | 'user'): Promise<void> {
    await this.updateUser(id, { role });
  },

  /**
   * Busca estatísticas de usuários
   */
  async getStats(): Promise<{
    total: number;
    admins: number;
    agents: number;
    active: number;
    inactive: number;
  }> {
    const users = await this.getAllUsers();

    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      agents: users.filter(u => u.role === 'agent').length,
      active: users.filter(u => u.active).length,
      inactive: users.filter(u => !u.active).length,
    };
  },
};
