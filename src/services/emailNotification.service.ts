// Email notification service usando Supabase Edge Function
// Chama função serverless para evitar problemas de CORS com Resend API

import { supabase } from '@/lib/supabase';

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export interface TicketResolvedEmailData {
  ticketId: string;
  ticketTitle: string;
  customerName: string;
  customerEmail: string;
  resolvedAt: string;
  resolution?: string;
}

export interface AdminReplyEmailData {
  ticketId: string;
  ticketTitle: string;
  customerName: string;
  customerEmail: string;
  replyContent: string;
  adminName: string;
}

export const emailNotificationService = {
  /**
   * Envia email notificando que o ticket foi resolvido
   * Usa Supabase Edge Function para evitar CORS
   */
  async sendTicketResolvedEmail(data: TicketResolvedEmailData): Promise<void> {
    try {
      console.log('📤 Chamando Supabase Edge Function...');

      const { data: result, error } = await supabase.functions.invoke('send-ticket-resolved-email', {
        body: {
          ...data,
          appUrl: APP_URL,
        },
      });

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw error;
      }

      if (!result.success) {
        console.error('❌ Falha no envio:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Email enviado com sucesso! ID:', result.emailId);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  },

  /**
   * Envia email notificando que o admin respondeu o ticket
   * Usa Supabase Edge Function para evitar CORS
   */
  async sendAdminReplyEmail(data: AdminReplyEmailData): Promise<void> {
    try {
      console.log('📤 Enviando email de resposta do admin...');

      const { data: result, error } = await supabase.functions.invoke('send-admin-reply-email', {
        body: {
          ...data,
          appUrl: APP_URL,
        },
      });

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw error;
      }

      if (!result.success) {
        console.error('❌ Falha no envio:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Email de resposta enviado! ID:', result.emailId);
    } catch (error) {
      console.error('❌ Erro ao enviar email de resposta:', error);
      // Don't throw - we don't want to block the reply from being sent
      // Just log the error
    }
  },

  /**
   * Valida se o serviço está configurado corretamente
   */
  isConfigured(): boolean {
    // Edge Function sempre estará disponível se Supabase estiver configurado
    return !!import.meta.env.VITE_SUPABASE_URL;
  },

  /**
   * Retorna informações sobre a configuração
   */
  getConfig() {
    return {
      isConfigured: this.isConfigured(),
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      method: 'Supabase Edge Function',
    };
  },
};
