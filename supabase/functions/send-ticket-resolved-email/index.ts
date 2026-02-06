import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

interface SendEmailRequest {
  ticketId: string
  ticketTitle: string
  customerName: string
  customerEmail: string
  resolvedAt: string
  resolution?: string
  appUrl: string
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const data: SendEmailRequest = await req.json()
    const { ticketId, ticketTitle, customerName, customerEmail, resolvedAt, resolution, appUrl } = data

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
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ✅ Ticket Resolvido
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Olá <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Temos boas notícias! Seu ticket foi resolvido com sucesso. 🎉
              </p>
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
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/tickets/${ticketId}"
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
    `

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
    `

    // Chama API do Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Suporte Bethel Educação <noreply@flow.suportebethel.com.br>',
        to: [customerEmail],
        subject: `✅ Seu ticket "${ticketTitle}" foi resolvido`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: 'category', value: 'ticket-resolved' },
          { name: 'ticket-id', value: ticketId },
        ],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(result)}`)
    }

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
