import { supabase } from '@/lib/supabase';

export interface InstagramIntegration {
  id?: string;
  user_id?: string;
  instagram_account_id: string;
  username: string;
  access_token: string;
  token_expires_at?: string;
  page_id?: string;
  page_access_token?: string;
  active?: boolean;
  webhook_verified?: boolean;
  last_message_at?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface InstagramMessage {
  id: string;
  conversationId: string;
  from: {
    id: string;
    username: string;
  };
  message: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
  }>;
}

export const instagramIntegrationService = {
  /**
   * Busca todas as integrações do usuário
   */
  async getUserIntegrations(): Promise<InstagramIntegration[]> {
    const { data, error } = await supabase
      .from('instagram_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca uma integração por ID
   */
  async getIntegration(id: string): Promise<InstagramIntegration | null> {
    const { data, error } = await supabase
      .from('instagram_integrations')
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
  async createIntegration(integration: Omit<InstagramIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<InstagramIntegration> {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('instagram_integrations')
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
  async updateIntegration(id: string, updates: Partial<InstagramIntegration>): Promise<void> {
    const { error } = await supabase
      .from('instagram_integrations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deleta uma integração
   */
  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('instagram_integrations')
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
   * Inicia fluxo OAuth para Instagram
   * NOTA: Requer Facebook App configurado no Meta Developer Portal
   */
  getInstagramOAuthUrl(): string {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_APP_ID';
    const redirectUri = `${window.location.origin}/api/oauth/instagram/callback`;
    const scope = encodeURIComponent('instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging');

    return `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code`;
  },

  /**
   * Obtém perfil do Instagram após OAuth
   * NOTA: Requer implementação backend
   */
  async getInstagramProfile(accessToken: string): Promise<{
    id: string;
    username: string;
  }> {
    // TODO: Implementar chamada para Instagram Graph API
    // GET https://graph.instagram.com/me?fields=id,username&access_token={access_token}

    console.log('Fetching Instagram profile with token:', accessToken);
    throw new Error('Instagram profile fetching not implemented - requires backend integration');
  },

  /**
   * Subscreve a webhooks do Instagram
   * NOTA: Requer configuração no Meta Developer Portal e endpoint público
   */
  async subscribeToWebhooks(integrationId: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar subscrição via Instagram Graph API
    // POST https://graph.facebook.com/{page-id}/subscribed_apps

    console.log('Subscribing to Instagram webhooks...', integration);
    throw new Error('Webhook subscription not implemented - requires backend integration');
  },

  /**
   * Busca conversas recentes
   * NOTA: Requer implementação backend com credenciais
   */
  async fetchConversations(integrationId: string): Promise<InstagramMessage[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar busca de conversas via Instagram Graph API
    // GET https://graph.instagram.com/me/conversations

    console.log('Fetching Instagram conversations...');
    return [];
  },

  /**
   * Envia uma mensagem DM
   * NOTA: Requer implementação backend com credenciais OAuth
   */
  async sendMessage(integrationId: string, recipientId: string, message: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar envio via Instagram Graph API
    // POST https://graph.instagram.com/me/messages

    console.log('Sending Instagram message...', {
      recipientId,
      message,
    });

    throw new Error('Message sending not implemented - requires backend integration');
  },

  /**
   * Cria um ticket a partir de uma DM do Instagram
   */
  async createTicketFromDM(dm: InstagramMessage, integrationId: string): Promise<string> {
    // Cria o ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: `Instagram DM de @${dm.from.username}`,
        description: dm.message,
        category: 'Instagram',
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
        source: 'instagram',
        external_id: dm.conversationId,
        external_metadata: {
          from_id: dm.from.id,
          from_username: dm.from.username,
          integration_id: integrationId,
        },
      });

    if (mappingError) throw mappingError;

    return ticket.id;
  },

  /**
   * Verifica token de webhook (necessário para Instagram)
   */
  verifyWebhookToken(mode: string, token: string, challenge: string): string | null {
    const verifyToken = import.meta.env.VITE_INSTAGRAM_VERIFY_TOKEN || 'YOUR_VERIFY_TOKEN';

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  },

  /**
   * Processa webhook recebido do Instagram
   * NOTA: Deve ser chamado por um endpoint backend
   */
  async processWebhook(payload: any): Promise<void> {
    // TODO: Processar diferentes tipos de eventos do Instagram
    // - messages: Nova mensagem recebida
    // - message_reactions: Reação a mensagem
    // - messaging_seen: Mensagem visualizada

    console.log('Processing Instagram webhook...', payload);

    // Exemplo de estrutura:
    // {
    //   "object": "instagram",
    //   "entry": [{
    //     "id": "instagram-account-id",
    //     "time": 1569262486134,
    //     "messaging": [{
    //       "sender": { "id": "user-id" },
    //       "recipient": { "id": "page-id" },
    //       "timestamp": 1569262485349,
    //       "message": {
    //         "mid": "message-id",
    //         "text": "Hello!"
    //       }
    //     }]
    //   }]
    // }
  },

  /**
   * Busca estatísticas de integração
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    webhookVerified: number;
    messagesLast24h: number;
  }> {
    const integrations = await this.getUserIntegrations();

    // Calcular mensagens nas últimas 24h (requer tabela de mensagens ou histórico)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      total: integrations.length,
      active: integrations.filter(i => i.active).length,
      webhookVerified: integrations.filter(i => i.webhook_verified).length,
      messagesLast24h: 0, // TODO: Implementar contagem real
    };
  },

  /**
   * Renova access token do Instagram
   * NOTA: Tokens do Instagram expiram e precisam ser renovados
   */
  async refreshAccessToken(integrationId: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    // TODO: Implementar renovação via Instagram Graph API
    // GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={access-token}

    console.log('Refreshing Instagram access token...');
    throw new Error('Token refresh not implemented - requires backend integration');
  },
};
