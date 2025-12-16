import { supabase } from '@/lib/supabase';

export interface EmailIntegration {
  id?: string;
  user_id?: string;
  provider: 'gmail' | 'outlook';
  email_address: string;
  display_name?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  active?: boolean;
  sync_enabled?: boolean;
  last_sync_at?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    url?: string;
  }>;
}

export const emailIntegrationService = {
  /**
   * Busca todas as integrações do usuário
   */
  async getUserIntegrations(): Promise<EmailIntegration[]> {
    const { data, error } = await supabase
      .from('email_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca uma integração por ID
   */
  async getIntegration(id: string): Promise<EmailIntegration | null> {
    const { data, error } = await supabase
      .from('email_integrations')
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
   * Cria uma nova integração
   */
  async createIntegration(integration: Omit<EmailIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmailIntegration> {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('email_integrations')
      .insert({
        ...integration,
        user_id: user.data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza uma integração
   */
  async updateIntegration(id: string, updates: Partial<EmailIntegration>): Promise<void> {
    const { error } = await supabase
      .from('email_integrations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deleta uma integração
   */
  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle ativo/inativo
   */
  async toggleActive(id: string, active: boolean): Promise<void> {
    await this.updateIntegration(id, { active });
  },

  /**
   * Toggle sincronização
   */
  async toggleSync(id: string, enabled: boolean): Promise<void> {
    await this.updateIntegration(id, { sync_enabled: enabled });
  },

  /**
   * Inicia fluxo OAuth para Gmail
   * NOTA: Esta é uma implementação de referência
   * Em produção, você precisará configurar OAuth no Google Cloud Console
   */
  getGmailOAuthUrl(): string {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = `${window.location.origin}/api/oauth/gmail/callback`;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send');

    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;
  },

  /**
   * Inicia fluxo OAuth para Outlook
   * NOTA: Esta é uma implementação de referência
   * Em produção, você precisará configurar OAuth no Azure AD
   */
  getOutlookOAuthUrl(): string {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = `${window.location.origin}/api/oauth/outlook/callback`;
    const scope = encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send');

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `response_mode=query`;
  },

  /**
   * Busca emails não lidos (simulação - requer implementação backend)
   * Em produção, isso seria feito via webhook ou polling no backend
   */
  async fetchUnreadEmails(integrationId: string): Promise<EmailMessage[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar chamada real para API do Gmail/Outlook
    // Por enquanto, retorna array vazio
    console.log(`Fetching unread emails for ${integration.provider}...`);

    return [];
  },

  /**
   * Envia um email de resposta
   * NOTA: Requer implementação backend com as credenciais OAuth
   */
  async sendEmail(integrationId: string, to: string, subject: string, body: string, threadId?: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar envio real via API do Gmail/Outlook
    console.log(`Sending email via ${integration.provider}...`, {
      to,
      subject,
      body,
      threadId,
    });

    // Em produção, fazer chamada para seu backend que usa as credenciais OAuth
    throw new Error('Email sending not implemented yet - requires backend integration');
  },

  /**
   * Cria um ticket a partir de um email
   */
  async createTicketFromEmail(email: EmailMessage, integrationId: string): Promise<string> {
    // Cria o ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: email.subject,
        description: `Email de: ${email.from}\n\n${email.body}`,
        category: 'Email',
        priority: 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Cria o mapeamento
    const { error: mappingError } = await supabase
      .from('conversation_mappings')
      .insert({
        ticket_id: ticket.id,
        source: 'email',
        external_id: email.threadId,
        external_metadata: {
          from: email.from,
          to: email.to,
          subject: email.subject,
          integration_id: integrationId,
        },
      });

    if (mappingError) throw mappingError;

    return ticket.id;
  },

  /**
   * Busca estatísticas de integração
   */
  async getStats(): Promise<{
    total: number;
    gmail: number;
    outlook: number;
    active: number;
    syncing: number;
  }> {
    const integrations = await this.getUserIntegrations();

    return {
      total: integrations.length,
      gmail: integrations.filter(i => i.provider === 'gmail').length,
      outlook: integrations.filter(i => i.provider === 'outlook').length,
      active: integrations.filter(i => i.active).length,
      syncing: integrations.filter(i => i.sync_enabled).length,
    };
  },
};
