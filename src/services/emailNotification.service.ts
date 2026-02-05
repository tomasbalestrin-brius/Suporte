// Email notification service usando Resend API diretamente via fetch
// Não usa o SDK do Resend para evitar problemas de compatibilidade com browser

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = import.meta.env.VITE_FROM_NAME || 'Suporte Bethel Educação';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export interface TicketResolvedEmailData {
  ticketId: string;
  ticketTitle: string;
  customerName: string;
  customerEmail: string;
  resolvedAt: string;
  resolution?: string;
}

export const emailNotificationService = {
  /**
   * Envia email notificando que o ticket foi resolvido
   */
  async sendTicketResolvedEmail(data: TicketResolvedEmailData): Promise<void> {
    try {
      const { ticketId, ticketTitle, customerName, customerEmail, resolvedAt, resolution } = data;

      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Resolvido</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ✅ Ticket Resolvido
              </h1>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Olá <strong>${customerName}</strong>,
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Temos boas notícias! Seu ticket foi resolvido com sucesso. 🎉
              </p>

              <!-- Card do Ticket -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; border: 1px solid #e9ecef;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6c757d; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                      Detalhes do Ticket
                    </p>

                    <p style="margin: 0 0 15px; font-size: 18px; color: #212529; font-weight: 600;">
                      ${ticketTitle}
                    </p>

                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6c757d;">
                          <strong>ID do Ticket:</strong>
                        </td>
                        <td style="padding: 5px 0; font-size: 14px; color: #212529; text-align: right;">
                          #${ticketId.substring(0, 8).toUpperCase()}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #6c757d;">
                          <strong>Resolvido em:</strong>
                        </td>
                        <td style="padding: 5px 0; font-size: 14px; color: #212529; text-align: right;">
                          ${new Date(resolvedAt).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${resolution ? `
              <!-- Resolução -->
              <div style="background-color: #e7f5ff; border-left: 4px solid #1971c2; padding: 15px 20px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #1864ab; font-weight: 600;">
                  📝 Resolução:
                </p>
                <p style="margin: 0; font-size: 14px; color: #1864ab; line-height: 1.6;">
                  ${resolution}
                </p>
              </div>
              ` : ''}

              <p style="margin: 30px 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Se você tiver mais dúvidas ou precisar de assistência adicional, não hesite em nos contatar. Estamos sempre aqui para ajudar!
              </p>

              <!-- Botão CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/tickets/${ticketId}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Ver Detalhes do Ticket
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.5; color: #333333;">
                Atenciosamente,<br>
                <strong>Equipe Bethel Educação</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6c757d;">
                Este é um email automático. Por favor, não responda diretamente.
              </p>
              <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                © ${new Date().getFullYear()} Bethel Educação. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const textContent = `
Olá ${customerName},

Temos boas notícias! Seu ticket foi resolvido com sucesso.

Detalhes do Ticket:
- Título: ${ticketTitle}
- ID: #${ticketId.substring(0, 8).toUpperCase()}
- Resolvido em: ${new Date(resolvedAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })}

${resolution ? `Resolução:\n${resolution}\n\n` : ''}

Se você tiver mais dúvidas ou precisar de assistência adicional, não hesite em nos contatar.

Atenciosamente,
Equipe Bethel Educação

---
Este é um email automático. Por favor, não responda diretamente.
© ${new Date().getFullYear()} Bethel Educação. Todos os direitos reservados.
      `;

      // Chamada direta à API REST do Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [customerEmail],
          subject: `✅ Seu ticket "${ticketTitle}" foi resolvido`,
          html: htmlContent,
          text: textContent,
          tags: [
            { name: 'category', value: 'ticket-resolved' },
            { name: 'ticket-id', value: ticketId },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Email enviado com sucesso:', result);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  },

  /**
   * Valida se o serviço está configurado corretamente
   */
  isConfigured(): boolean {
    const apiKey = RESEND_API_KEY;
    return !!apiKey && apiKey !== 'your_resend_api_key_here';
  },

  /**
   * Retorna informações sobre a configuração
   */
  getConfig() {
    return {
      isConfigured: this.isConfigured(),
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
      apiKeyPresent: !!RESEND_API_KEY,
    };
  },
};
