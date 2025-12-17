# Edge Function: sync-emails

Sincroniza automaticamente emails do Gmail/Webmail com tickets do sistema.

## Funcionalidades

- ✅ Busca emails não lidos de todas as integrações ativas
- ✅ Cria tickets automaticamente a partir de emails
- ✅ Adiciona respostas a tickets existentes (mesmo thread)
- ✅ Marca emails como lidos após processamento
- ✅ Renova tokens OAuth automaticamente
- ✅ Suporta múltiplas integrações simultaneamente

## Deploy

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

### 3. Link ao projeto

```bash
supabase link --project-ref seu-project-id
```

### 4. Deploy da função

```bash
supabase functions deploy sync-emails
```

### 5. Configurar variáveis de ambiente

No dashboard do Supabase:
1. Vá em **Edge Functions** → **sync-emails** → **Settings**
2. Adicione as variáveis:
   - `SUPABASE_URL` (já configurado automaticamente)
   - `SUPABASE_SERVICE_ROLE_KEY` (já configurado automaticamente)

## Agendar Execução Automática

### Opção 1: Supabase Cron (Recomendado)

```bash
# A cada 5 minutos
supabase functions schedule sync-emails --cron "*/5 * * * *"

# A cada 10 minutos
supabase functions schedule sync-emails --cron "*/10 * * * *"

# A cada hora
supabase functions schedule sync-emails --cron "0 * * * *"
```

### Opção 2: Webhook Externo

Configure um serviço como **cron-job.org** ou **GitHub Actions** para chamar:

```bash
curl -X POST https://seu-project-id.supabase.co/functions/v1/sync-emails \
  -H "Authorization: Bearer SEU_ANON_KEY"
```

### Opção 3: Trigger no Banco de Dados

Crie um trigger que executa a função quando uma integração é criada/atualizada.

## Testar Manualmente

```bash
# Via CLI
supabase functions invoke sync-emails --no-verify-jwt

# Via cURL
curl -X POST https://seu-project-id.supabase.co/functions/v1/sync-emails \
  -H "Authorization: Bearer SEU_ANON_KEY"
```

## Resposta de Sucesso

```json
{
  "success": true,
  "total_integrations": 1,
  "total_processed": 5,
  "total_created": 3,
  "total_errors": 0,
  "results": [
    {
      "integration_id": "uuid-123",
      "email": "suporte@betheleducacao.com.br",
      "processed": 5,
      "created": 3,
      "errors": 0
    }
  ]
}
```

## Monitoramento

### Ver logs em tempo real:

```bash
supabase functions logs sync-emails --follow
```

### Ver logs recentes:

```bash
supabase functions logs sync-emails
```

## Troubleshooting

### Erro: "Failed to refresh access token"

**Causa:** Refresh token inválido ou expirado

**Solução:**
1. Remova a integração no sistema
2. Reconecte via OAuth (botão "Conectar Gmail")

### Erro: "Failed to fetch messages from Gmail"

**Causa:** Permissões OAuth insuficientes

**Solução:**
Verifique se os escopos OAuth incluem:
- `gmail.readonly`
- `gmail.send`
- `gmail.modify`

### Nenhum email sendo sincronizado

**Verificações:**
1. Integração está ativa? (`active = true`)
2. Sync está habilitado? (`sync_enabled = true`)
3. Há emails não lidos na caixa de entrada?
4. Token OAuth está válido?

## Fluxo de Execução

```
1. Busca integrações (active = true, sync_enabled = true)
   ↓
2. Para cada integração:
   ↓
3. Renova token se necessário
   ↓
4. Busca emails não lidos (máx 50)
   ↓
5. Para cada email:
   ↓
6. Verifica se já existe ticket (via thread ID)
   ↓
7a. Se existe → Adiciona mensagem ao ticket
7b. Se não existe → Cria novo ticket
   ↓
8. Marca email como lido
   ↓
9. Atualiza last_sync_at da integração
   ↓
10. Retorna relatório de sincronização
```

## Limites e Considerações

- **Gmail API:** 250 quotas/segundo, 1 bilhão quotas/dia
- **Emails por sync:** Máximo 50 emails não lidos por execução
- **Frequência recomendada:** A cada 5-10 minutos
- **Timeout:** Edge Functions têm limite de 2 minutos de execução

## Próximas Melhorias

- [ ] Suporte para filtros personalizados (labels, palavras-chave)
- [ ] Notificações em caso de erro persistente
- [ ] Dashboard de métricas de sincronização
- [ ] Suporte para Gmail Push Notifications
- [ ] Retry automático em caso de falha temporária
