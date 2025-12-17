import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Configuração do cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Credenciais OAuth do Google
const GOOGLE_CLIENT_ID = '10322214062-3anlmji52o15ud6bojpdeltbvlb2seak.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'

interface EmailIntegration {
  id: string
  email_address: string
  access_token: string
  refresh_token: string
  token_expires_at: string
  active: boolean
  sync_enabled: boolean
}

interface EmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  body: string
  receivedAt: string
}

/**
 * Renova access token usando refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  }
}

/**
 * Garante que o token está válido
 */
async function ensureValidToken(integration: EmailIntegration): Promise<string> {
  if (!integration.token_expires_at || !integration.refresh_token) {
    return integration.access_token
  }

  const expiresAt = new Date(integration.token_expires_at)
  const now = new Date()

  // Se o token expira em menos de 5 minutos, renova
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const { access_token, expires_in } = await refreshAccessToken(integration.refresh_token)

    // Atualiza no banco
    await supabase
      .from('email_integrations')
      .update({
        access_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      })
      .eq('id', integration.id)

    return access_token
  }

  return integration.access_token
}

/**
 * Busca emails não lidos do Gmail
 */
async function fetchUnreadEmails(integration: EmailIntegration): Promise<EmailMessage[]> {
  const accessToken = await ensureValidToken(integration)

  // Busca mensagens não lidas
  const messagesResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=50',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!messagesResponse.ok) {
    throw new Error('Failed to fetch messages from Gmail')
  }

  const messagesData = await messagesResponse.json()
  const messages = messagesData.messages || []

  // Busca detalhes de cada mensagem
  const emailMessages: EmailMessage[] = []

  for (const msg of messages) {
    const detailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!detailResponse.ok) continue

    const detail = await detailResponse.json()
    const headers = detail.payload.headers

    const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || ''
    const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || ''
    const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || ''
    const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || ''

    // Extrai corpo do email
    let body = ''
    if (detail.payload.parts) {
      const textPart = detail.payload.parts.find((p: any) => p.mimeType === 'text/plain')
      if (textPart && textPart.body.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
    } else if (detail.payload.body.data) {
      body = atob(detail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    }

    emailMessages.push({
      id: detail.id,
      threadId: detail.threadId,
      from,
      to,
      subject,
      body,
      receivedAt: date,
    })
  }

  return emailMessages
}

/**
 * Marca email como lido
 */
async function markEmailAsRead(integration: EmailIntegration, messageId: string): Promise<void> {
  const accessToken = await ensureValidToken(integration)

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
  )
}

/**
 * Cria ticket a partir de email
 */
async function createTicketFromEmail(email: EmailMessage, integrationId: string): Promise<string> {
  // Extrai nome e email do remetente
  const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/)
  let customerName = ''
  let customerEmail = ''

  if (fromMatch) {
    customerName = fromMatch[1].trim().replace(/['"]/g, '')
    customerEmail = fromMatch[2].trim()
  } else {
    customerEmail = email.from.trim()
    customerName = customerEmail.split('@')[0]
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
    .single()

  if (ticketError) throw ticketError

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
    })

  if (mappingError) throw mappingError

  return ticket.id
}

/**
 * Sincroniza emails de uma integração
 */
async function syncIntegration(integration: EmailIntegration): Promise<{
  processed: number
  created: number
  errors: number
}> {
  try {
    const emails = await fetchUnreadEmails(integration)
    let created = 0
    let errors = 0

    for (const email of emails) {
      try {
        // Verifica se já existe ticket para este thread
        const { data: existingMapping } = await supabase
          .from('conversation_mappings')
          .select('ticket_id')
          .eq('source', 'email')
          .eq('external_id', email.threadId)
          .single()

        if (existingMapping) {
          // Adiciona como mensagem ao ticket existente
          const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/)
          const senderName = fromMatch ? fromMatch[1].trim().replace(/['"]/g, '') : email.from.split('@')[0]
          const senderEmail = fromMatch ? fromMatch[2].trim() : email.from.trim()

          await supabase.from('messages').insert({
            ticket_id: existingMapping.ticket_id,
            content: email.body,
            sender_name: senderName,
            sender_email: senderEmail,
            is_internal: false,
          })

          await markEmailAsRead(integration, email.id)
        } else {
          // Cria novo ticket
          await createTicketFromEmail(email, integration.id)
          created++
          await markEmailAsRead(integration, email.id)
        }
      } catch (error) {
        console.error('Error processing email:', error)
        errors++
      }
    }

    // Atualiza última sincronização
    await supabase
      .from('email_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integration.id)

    return {
      processed: emails.length,
      created,
      errors,
    }
  } catch (error) {
    console.error('Sync error for integration:', integration.id, error)
    throw error
  }
}

/**
 * Handler principal
 */
serve(async (req) => {
  try {
    // Busca todas as integrações ativas com sync habilitado
    const { data: integrations, error } = await supabase
      .from('email_integrations')
      .select('*')
      .eq('active', true)
      .eq('sync_enabled', true)
      .eq('provider', 'gmail')

    if (error) {
      throw error
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active integrations to sync',
          total: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Sincroniza cada integração
    const results = []
    for (const integration of integrations) {
      try {
        const result = await syncIntegration(integration)
        results.push({
          integration_id: integration.id,
          email: integration.email_address,
          ...result,
        })
      } catch (error) {
        results.push({
          integration_id: integration.id,
          email: integration.email_address,
          error: error.message,
        })
      }
    }

    const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0)
    const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0)
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0)

    return new Response(
      JSON.stringify({
        success: true,
        total_integrations: integrations.length,
        total_processed: totalProcessed,
        total_created: totalCreated,
        total_errors: totalErrors,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
