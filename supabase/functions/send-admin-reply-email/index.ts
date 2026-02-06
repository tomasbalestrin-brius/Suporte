import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS') || 'https://suporte-eight.vercel.app,http://localhost:5173'

// Function to get CORS headers based on request origin
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOriginsList = ALLOWED_ORIGINS.split(',')
  const allowedOrigin = origin && allowedOriginsList.includes(origin) ? origin : allowedOriginsList[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }
}

interface SendAdminReplyEmailRequest {
  ticketId: string
  ticketTitle: string
  customerName: string
  customerEmail: string
  replyContent: string
  adminName: string
  appUrl: string
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const data: SendAdminReplyEmailRequest = await req.json()
    const { ticketId, ticketTitle, customerName, customerEmail, replyContent, adminName, appUrl } = data

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Resposta no Seu Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                💬 Nova Resposta
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Olá <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Você recebeu uma nova resposta no seu ticket de suporte! 📩
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; border: 1px solid #e9ecef;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6c757d; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                      Ticket
                    </p>
                    <p style="margin: 0 0 5px; font-size: 18px; color: #212529; font-weight: 600;">
                      ${ticketTitle}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6c757d;">
                      ID: #${ticketId.substring(0, 8).toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <span style="color: white; font-weight: 600; font-size: 16px;">${adminName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #212529;">
                      ${adminName}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6c757d;">
                      Equipe de Suporte
                    </p>
                  </div>
                </div>
                <div style="background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin-top: 15px;">
                  <p style="margin: 0; font-size: 14px; color: #212529; line-height: 1.6; white-space: pre-wrap;">
${replyContent}
                  </p>
                </div>
              </div>
              <p style="margin: 30px 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                Para continuar a conversa ou ver mais detalhes, clique no botão abaixo:
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/tickets/${ticketId}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Ver Ticket Completo
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
                Este é um email automático. Para responder, acesse o ticket através do link acima.
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

Você recebeu uma nova resposta no seu ticket de suporte!

Ticket: ${ticketTitle}
ID: #${ticketId.substring(0, 8).toUpperCase()}

Resposta de ${adminName} (Equipe de Suporte):
${replyContent}

Para continuar a conversa ou ver mais detalhes, acesse: ${appUrl}/tickets/${ticketId}

Atenciosamente,
Equipe Bethel Educação

---
Este é um email automático. Para responder, acesse o ticket através do link acima.
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
        subject: `💬 Nova resposta no ticket "${ticketTitle}"`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: 'category', value: 'admin-reply' },
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
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error sending admin reply email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})
