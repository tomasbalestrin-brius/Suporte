import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types';

export interface WebhookEvent {
  event_type: 'ticket_created' | 'ticket_updated' | 'status_changed' | 'message_sent';
  ticket_id: string;
  ticket_data?: Partial<Ticket>;
  old_status?: string;
  new_status?: string;
  message?: string;
  timestamp: string;
}

export interface WebhookConfig {
  id?: string;
  name: string;
  url: string;
  events: string[]; // ['ticket_created', 'status_changed', etc]
  active: boolean;
  secret?: string;
}

export const webhookService = {
  /**
   * Dispara um webhook para um evento específico
   */
  async triggerWebhook(event: WebhookEvent): Promise<void> {
    try {
      // Busca webhooks ativos configurados para este tipo de evento
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('*')
        .eq('active', true)
        .contains('events', [event.event_type]);

      if (!webhooks || webhooks.length === 0) {
        console.log('No active webhooks configured for event:', event.event_type);
        return;
      }

      // Dispara cada webhook configurado
      const promises = webhooks.map(async (webhook) => {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': webhook.secret || '',
              'X-Event-Type': event.event_type,
            },
            body: JSON.stringify(event),
          });

          // Registra o resultado do webhook
          await this.logWebhookExecution({
            webhook_id: webhook.id,
            event_type: event.event_type,
            ticket_id: event.ticket_id,
            status_code: response.status,
            success: response.ok,
            response_body: await response.text().catch(() => null),
          });

          if (!response.ok) {
            console.error(`Webhook ${webhook.name} failed:`, response.status);
          }
        } catch (error) {
          console.error(`Error triggering webhook ${webhook.name}:`, error);

          // Registra o erro
          await this.logWebhookExecution({
            webhook_id: webhook.id,
            event_type: event.event_type,
            ticket_id: event.ticket_id,
            status_code: 0,
            success: false,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error in webhook service:', error);
    }
  },

  /**
   * Registra a execução de um webhook para auditoria
   */
  async logWebhookExecution(log: {
    webhook_id: string;
    event_type: string;
    ticket_id: string;
    status_code: number;
    success: boolean;
    response_body?: string | null;
    error_message?: string;
  }): Promise<void> {
    try {
      await supabase.from('webhook_logs').insert({
        ...log,
        executed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging webhook execution:', error);
    }
  },

  /**
   * Dispara webhook quando status do ticket muda
   */
  async notifyStatusChange(
    ticketId: string,
    oldStatus: string,
    newStatus: string,
    ticketData: Partial<Ticket>
  ): Promise<void> {
    await this.triggerWebhook({
      event_type: 'status_changed',
      ticket_id: ticketId,
      ticket_data: ticketData,
      old_status: oldStatus,
      new_status: newStatus,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Dispara webhook quando ticket é criado
   */
  async notifyTicketCreated(ticketId: string, ticketData: Partial<Ticket>): Promise<void> {
    await this.triggerWebhook({
      event_type: 'ticket_created',
      ticket_id: ticketId,
      ticket_data: ticketData,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Dispara webhook quando mensagem é enviada
   */
  async notifyMessageSent(ticketId: string, message: string, isAI: boolean): Promise<void> {
    await this.triggerWebhook({
      event_type: 'message_sent',
      ticket_id: ticketId,
      message: message,
      ticket_data: { is_ai_message: isAI } as any,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * CRUD para gerenciar webhooks
   */
  async createWebhook(webhook: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWebhooks(): Promise<WebhookConfig[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleWebhook(id: string, active: boolean): Promise<void> {
    await this.updateWebhook(id, { active });
  },
};
