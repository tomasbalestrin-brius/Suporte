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

// Credenciais OAuth do Google
const GOOGLE_CLIENT_ID = '10322214062-3anlmji52o15ud6bojpdeltbvlb2seak.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
// const GOOGLE_PROJECT_ID = 'helical-song-481414-n3'; // Mantido para referência

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
   */
  getGmailOAuthUrl(): string {
    const redirectUri = `${window.location.origin}/auth/gmail/callback`;
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=gmail_integration`;
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
   * Troca código OAuth por tokens de acesso
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    email: string;
  }> {
    const redirectUri = `${window.location.origin}/auth/gmail/callback`;

    // Troca código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Busca informações do usuário
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await userInfoResponse.json();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      email: userInfo.email,
    };
  },

  /**
   * Atualiza access token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  },

  /**
   * Garante que o token está válido, renovando se necessário
   */
  async ensureValidToken(integration: EmailIntegration): Promise<string> {
    if (!integration.token_expires_at || !integration.refresh_token) {
      return integration.access_token;
    }

    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();

    // Se o token expira em menos de 5 minutos, renova
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const { access_token, expires_in } = await this.refreshAccessToken(integration.refresh_token);

      // Atualiza no banco
      await this.updateIntegration(integration.id!, {
        access_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      });

      return access_token;
    }

    return integration.access_token;
  },

  /**
   * Busca emails não lidos do Gmail
   */
  async fetchUnreadEmails(integrationId: string): Promise<EmailMessage[]> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    if (integration.provider !== 'gmail') {
      throw new Error('Only Gmail is supported for now');
    }

    const accessToken = await this.ensureValidToken(integration);

    // Busca mensagens não lidas
    const messagesResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=50',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to fetch messages from Gmail');
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    // Busca detalhes de cada mensagem
    const emailMessages: EmailMessage[] = [];

    for (const msg of messages) {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!detailResponse.ok) continue;

      const detail = await detailResponse.json();
      const headers = detail.payload.headers;

      const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
      const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
      const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

      // Extrai corpo do email
      let body = '';
      if (detail.payload.parts) {
        const textPart = detail.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      } else if (detail.payload.body.data) {
        body = atob(detail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }

      emailMessages.push({
        id: detail.id,
        threadId: detail.threadId,
        from,
        to,
        subject,
        body,
        receivedAt: date,
      });
    }

    return emailMessages;
  },

  /**
   * Envia um email de resposta via Gmail
   */
  async sendEmail(integrationId: string, to: string, subject: string, body: string, threadId?: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    if (integration.provider !== 'gmail') {
      throw new Error('Only Gmail is supported for now');
    }

    const accessToken = await this.ensureValidToken(integration);

    // Cria o email no formato RFC 2822
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ];

    const email = emailLines.join('\r\n');
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const url = threadId
      ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`
      : `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`;

    const payload: any = {
      raw: encodedEmail,
    };

    if (threadId) {
      payload.threadId = threadId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  },

  /**
   * Marca um email como lido
   */
  async markEmailAsRead(integrationId: string, messageId: string): Promise<void> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');

    const accessToken = await this.ensureValidToken(integration);

    await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD'],
        }),
      }
    );
  },

  /**
   * Sincroniza emails e cria tickets automaticamente
   */
  async syncEmailsToTickets(integrationId: string): Promise<{
    processed: number;
    created: number;
    errors: number;
  }> {
    try {
      const emails = await this.fetchUnreadEmails(integrationId);
      let created = 0;
      let errors = 0;

      for (const email of emails) {
        try {
          // Verifica se já existe um ticket para este email
          const { data: existingMapping } = await supabase
            .from('conversation_mappings')
            .select('ticket_id')
            .eq('source', 'email')
            .eq('external_id', email.threadId)
            .single();

          if (existingMapping) {
            // Já existe ticket para este thread, adiciona como mensagem
            const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/);
            const senderName = fromMatch ? fromMatch[1].trim().replace(/['"]/g, '') : email.from.split('@')[0];
            const senderEmail = fromMatch ? fromMatch[2].trim() : email.from.trim();

            await supabase.from('messages').insert({
              ticket_id: existingMapping.ticket_id,
              content: email.body,
              sender_name: senderName,
              sender_email: senderEmail,
              is_internal: false,
            });

            // Marca email como lido
            await this.markEmailAsRead(integrationId, email.id);
          } else {
            // Cria novo ticket
            await this.createTicketFromEmail(email, integrationId);
            created++;

            // Marca email como lido
            await this.markEmailAsRead(integrationId, email.id);
          }
        } catch (error) {
          console.error('Error processing email:', error);
          errors++;
        }
      }

      // Atualiza última sincronização
      await this.updateIntegration(integrationId, {
        last_sync_at: new Date().toISOString(),
      });

      return {
        processed: emails.length,
        created,
        errors,
      };
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  },

  /**
   * Cria um ticket a partir de um email
   */
  async createTicketFromEmail(email: EmailMessage, integrationId: string): Promise<string> {
    // Extrai nome e email do remetente
    // Formato comum: "Nome Completo <email@exemplo.com>" ou só "email@exemplo.com"
    const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/);
    let customerName = '';
    let customerEmail = '';

    if (fromMatch) {
      customerName = fromMatch[1].trim().replace(/['"]/g, ''); // Remove aspas
      customerEmail = fromMatch[2].trim();
    } else {
      customerEmail = email.from.trim();
      customerName = customerEmail.split('@')[0]; // Usa parte antes do @ como nome
    }

    // Cria o ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        title: email.subject || 'Sem assunto',
        description: email.body || 'Email sem conteúdo',
        category: 'Suporte',
        priority: 'medium',
        status: 'open',
        customer_name: customerName,
        customer_email: customerEmail,
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
          message_id: email.id,
          from: email.from,
          to: email.to,
          subject: email.subject,
          received_at: email.receivedAt,
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
