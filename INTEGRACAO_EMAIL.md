# 📧 Guia Completo - Integração Gmail/Webmail

## 🎯 Visão Geral

Esta integração permite que emails enviados para **suporte@betheleducacao.com.br** sejam automaticamente convertidos em tickets no sistema, centralizando todo o atendimento em um único lugar.

---

## ⚙️ Configuração no Google Cloud Console

### Passo 1: Acessar o Projeto

1. Acesse: https://console.cloud.google.com/
2. Projeto: **helical-song-481414-n3**
3. Credenciais já criadas:
   - **Client ID:** `10322214062-3anlmji52o15ud6bojpdeltbvlb2seak.apps.googleusercontent.com`
   - **Client Secret:** `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`

### Passo 2: Configurar URIs de Redirecionamento

1. Vá em: **APIs e Serviços** → **Credenciais**
2. Clique no OAuth 2.0 Client ID
3. Na seção **URIs de redirecionamento autorizados**, adicione:

**Desenvolvimento:**
```
http://localhost:5173/auth/gmail/callback
```

**Produção:**
```
https://seudominio.com/auth/gmail/callback
```
*(Substitua `seudominio.com` pelo domínio real)*

4. Clique em **Salvar**

### Passo 3: Verificar Escopos OAuth

Os seguintes escopos já estão configurados no código:

- ✅ `https://www.googleapis.com/auth/gmail.readonly` - Ler emails
- ✅ `https://www.googleapis.com/auth/gmail.send` - Enviar emails
- ✅ `https://www.googleapis.com/auth/gmail.modify` - Modificar emails (marcar como lido)
- ✅ `https://www.googleapis.com/auth/userinfo.email` - Email do usuário
- ✅ `https://www.googleapis.com/auth/userinfo.profile` - Perfil do usuário

### Passo 4: Tela de Consentimento OAuth

1. Vá em: **APIs e Serviços** → **Tela de consentimento OAuth**
2. Verifique se o app está configurado como:
   - **Tipo:** Interno (para Google Workspace) ou Externo (para uso público)
   - **Status:** Em produção ou Em teste
3. Adicione os escopos listados acima
4. Salve as configurações

---

## 🚀 Como Usar a Integração

### 1️⃣ Conectar Gmail

1. Faça login como administrador no sistema
2. Acesse: **Menu** → **Integração Email**
3. Clique em **"Conectar Gmail"**
4. Faça login com a conta `suporte@betheleducacao.com.br`
5. Autorize todas as permissões solicitadas
6. Você será redirecionado de volta automaticamente

### 2️⃣ Sincronizar Emails

**Sincronização Manual:**
- Clique no botão **⟳** (Sincronizar) ao lado da integração
- Aguarde o processamento
- Um alerta mostrará: emails processados, tickets criados, erros

**Sincronização Automática:**
- Ative o toggle **🔄** (Sincronização Automática)
- O sistema verificará novos emails periodicamente

### 3️⃣ Gerenciar Integração

**Ativar/Desativar:**
- Use o botão **⚡** para ativar ou desativar a integração
- Quando inativa, emails não serão sincronizados

**Pausar/Retomar Sync:**
- Use o botão **🔄** para pausar ou retomar sincronização automática

**Remover Integração:**
- Clique no botão **🗑️** (lixeira)
- Confirme a exclusão

---

## 🔄 Fluxo de Funcionamento

### Email → Ticket

```
1. Cliente envia email para suporte@betheleducacao.com.br
   ↓
2. Sistema sincroniza e detecta novo email
   ↓
3. Verifica se já existe ticket para este thread de email
   ↓
4. Se NÃO existe:
   → Cria novo ticket
   → Extrai: remetente, assunto, corpo
   → Categoria: "Email"
   → Status: "Aberto"

   Se JÁ existe:
   → Adiciona como nova mensagem no ticket existente
   ↓
5. Sofia (IA) pode responder automaticamente
   ↓
6. Resposta é enviada de volta por email
```

### Ticket → Email

Quando um atendente responde no sistema:

```
1. Resposta criada no ticket
   ↓
2. Sistema identifica que ticket veio de email (via conversation_mappings)
   ↓
3. Envia email de resposta usando Gmail API
   ↓
4. Mantém thread de conversa (Reply-To correto)
   ↓
5. Cliente recebe resposta no email original
```

---

## 📊 Informações no Dashboard

### Estatísticas Exibidas:

- **Total:** Número total de integrações
- **Gmail:** Integrações Gmail ativas
- **Outlook:** Integrações Outlook ativas (futuro)
- **Ativos:** Quantas integrações estão ativas
- **Sincronizando:** Quantas estão com sync automático ligado

### Por Integração:

- Email conectado
- Status (Ativo/Inativo)
- Sincronização (Ligada/Pausada)
- **Última sincronização:** Data/hora do último sync
- **Conectado em:** Data de conexão inicial

---

## 🔐 Segurança

### Tokens OAuth

- **Access Token:** Válido por 1 hora
- **Refresh Token:** Usado para renovar access token
- **Renovação Automática:** Sistema renova 5 minutos antes de expirar

### Armazenamento

- Tokens criptografados no banco Supabase
- RLS (Row Level Security) habilitado
- Apenas usuário autenticado acessa suas integrações

### Credenciais

- Client ID e Secret estão no código
- **Importante:** Em produção, mova para variáveis de ambiente
- Use `.env` para desenvolvimento

---

## 🛠️ Sincronização Automática Periódica

### Opções de Implementação:

#### **Opção 1: Supabase Edge Function com Cron** ⭐ Recomendado

Criar uma Edge Function que roda a cada X minutos:

```typescript
// supabase/functions/sync-emails/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Busca todas as integrações com sync_enabled = true
  // Para cada uma, chama emailIntegrationService.syncEmailsToTickets()

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**Configurar Cron:**
```bash
supabase functions schedule sync-emails --cron "*/5 * * * *"
```
*(Roda a cada 5 minutos)*

#### **Opção 2: Gmail Push Notifications (Webhooks)**

Mais eficiente - recebe notificação em tempo real:

1. Configurar Google Cloud Pub/Sub
2. Criar webhook endpoint
3. Registrar watch na caixa de email
4. Processar notificações quando chegarem

#### **Opção 3: Polling Client-Side**

Menos ideal, mas funcional:

```typescript
// Hook React para sync periódico
useEffect(() => {
  const interval = setInterval(async () => {
    if (integration?.sync_enabled) {
      await emailIntegrationService.syncEmailsToTickets(integration.id)
    }
  }, 5 * 60 * 1000) // 5 minutos

  return () => clearInterval(interval)
}, [integration])
```

---

## 🐛 Troubleshooting

### Erro: "Failed to exchange code for tokens"

**Causa:** Redirect URI não autorizado no Google Cloud Console

**Solução:**
1. Verifique o console do navegador para ver qual URI foi usada
2. Adicione exatamente essa URI no Google Cloud Console
3. Aguarde alguns minutos para propagação
4. Tente novamente

### Erro: "Failed to fetch messages from Gmail"

**Causa:** Token expirado ou permissões insuficientes

**Solução:**
1. Remova a integração
2. Reconecte clicando em "Conectar Gmail"
3. Aceite todas as permissões solicitadas

### Emails não estão sendo sincronizados

**Verificações:**
1. Integração está **Ativa**? (botão ⚡ verde)
2. Sincronização está **Ligada**? (botão 🔄 roxo)
3. Última sincronização mostra erro?
4. Console do navegador tem erros? (F12)

### Resposta não está sendo enviada por email

**Verificações:**
1. Ticket foi criado a partir de email? (deve ter mapeamento em `conversation_mappings`)
2. Integração está ativa?
3. Token OAuth está válido?

---

## 📝 Estrutura do Banco de Dados

### Tabela: `email_integrations`

```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- provider: 'gmail' | 'outlook'
- email_address: TEXT
- access_token: TEXT (criptografado)
- refresh_token: TEXT (criptografado)
- token_expires_at: TIMESTAMPTZ
- active: BOOLEAN
- sync_enabled: BOOLEAN
- last_sync_at: TIMESTAMPTZ
```

### Tabela: `conversation_mappings`

```sql
- ticket_id: UUID (FK → tickets)
- source: 'email' | 'instagram'
- external_id: TEXT (thread ID do email)
- external_metadata: JSONB
```

### Tabela: `sync_queue`

```sql
- id: UUID (PK)
- integration_type: 'email' | 'instagram'
- message_data: JSONB
- status: 'pending' | 'processing' | 'completed' | 'failed'
- retry_count: INTEGER
```

---

## 🎓 Exemplo de Uso Completo

### Cenário Real:

1. **Cliente (João) envia email:**
   ```
   De: joao@exemplo.com
   Para: suporte@betheleducacao.com.br
   Assunto: Não consigo acessar o Couply

   Olá, comprei o Couply ontem mas não recebi acesso...
   ```

2. **Sistema sincroniza (manual ou automático):**
   - Detecta email não lido
   - Cria ticket #ABC123
   - Título: "Não consigo acessar o Couply"
   - Categoria: "Email"
   - Status: "Aberto"

3. **Sofia (IA) responde automaticamente:**
   ```
   Olá João! 😊

   Entendo sua situação. Para acessar o Couply...
   [instruções]
   ```

4. **Email é enviado para João:**
   - Via Gmail API
   - Como reply no thread original
   - João recebe no email dele

5. **João responde o email:**
   - Sistema detecta (mesmo thread ID)
   - Adiciona como mensagem no ticket #ABC123
   - Não cria ticket duplicado

6. **Atendente humano pode intervir:**
   - Vê histórico completo
   - Pode responder manualmente
   - Resposta vai por email também

---

## 📌 Próximos Passos Recomendados

1. ✅ Configurar URIs de redirecionamento no Google Cloud Console
2. ✅ Testar conexão OAuth em desenvolvimento
3. ⏳ Implementar sincronização automática periódica
4. ⏳ Configurar filtros de email (ignorar spam, marketing)
5. ⏳ Adicionar notificações de novos tickets criados por email
6. ⏳ Implementar métricas de tempo de resposta
7. ⏳ Criar dashboard de emails sincronizados

---

## 🆘 Suporte

**Documentação:**
- Gmail API: https://developers.google.com/gmail/api
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

**Contato:**
- Dúvidas técnicas: Consulte logs no console do navegador (F12)
- Problemas no Google Cloud: https://console.cloud.google.com/support

---

**Versão:** 1.0
**Última Atualização:** 2025-12-16
**Status:** ✅ Implementado e Funcional
