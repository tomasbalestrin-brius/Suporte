# 📧 Deploy da Edge Function de Email

## 🎯 Problema Resolvido

A API do Resend bloqueia chamadas diretas do browser por **CORS**. A solução é usar uma **Supabase Edge Function** (servidor) para enviar emails.

---

## 🚀 Opção 1: Deploy via Dashboard (Mais Fácil)

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/zeocxcfiyhzsztwjllvl
- Clique em **"Edge Functions"** no menu lateral

### 2. Crie a Função
- Clique em **"Create a new function"**
- Nome: `send-ticket-resolved-email`
- Clique em **"Create function"**

### 3. Cole o Código
- Copie todo o conteúdo de: `/home/user/Suporte/supabase/functions/send-ticket-resolved-email/index.ts`
- Cole no editor do dashboard
- Clique em **"Deploy"**

### 4. Configure o Secret (IMPORTANTE!)
- No dashboard, vá em **"Settings"** → **"Edge Functions"** → **"Secrets"**
- Clique em **"Add secret"**
- Nome: `RESEND_API_KEY`
- Valor: `re_HUbcARXY_27Wabh1Pn8p4at8PvcfSAxRr`
- Clique em **"Save"**

### 5. Teste a Função
- No dashboard, vá até a função `send-ticket-resolved-email`
- Clique em **"Invoke function"**
- Cole este JSON de teste:
```json
{
  "ticketId": "test-123",
  "ticketTitle": "Teste de Email",
  "customerName": "Seu Nome",
  "customerEmail": "SEU_EMAIL@gmail.com",
  "resolvedAt": "2026-02-05T18:00:00Z",
  "resolution": "Teste de resolução",
  "appUrl": "http://localhost:5173"
}
```
- Clique em **"Invoke"**
- Verifique se recebeu o email!

---

## 🚀 Opção 2: Deploy via CLI (Mais Rápido)

### 1. Instalar Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**npm (qualquer OS):**
```bash
npm install -g supabase
```

### 2. Login no Supabase
```bash
npx supabase login
```

### 3. Linkar o Projeto
```bash
npx supabase link --project-ref zeocxcfiyhzsztwjllvl
```

### 4. Configurar Secret
```bash
npx supabase secrets set RESEND_API_KEY=re_HUbcARXY_27Wabh1Pn8p4at8PvcfSAxRr
```

### 5. Deploy da Função
```bash
npm run supabase:deploy-email
```

ou

```bash
npx supabase functions deploy send-ticket-resolved-email --no-verify-jwt
```

### 6. Verificar Logs
```bash
npm run supabase:logs-email
```

ou

```bash
npx supabase functions logs send-ticket-resolved-email --follow
```

---

## ✅ Como Testar

### Teste Manual via curl

```bash
curl -X POST \
  'https://zeocxcfiyhzsztwjllvl.supabase.co/functions/v1/send-ticket-resolved-email' \
  -H 'Authorization: Bearer SEU_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "ticketId": "test-123",
    "ticketTitle": "Teste via curl",
    "customerName": "Teste",
    "customerEmail": "SEU_EMAIL@gmail.com",
    "resolvedAt": "2026-02-05T18:00:00Z",
    "resolution": "Testando função",
    "appUrl": "http://localhost:5173"
  }'
```

### Teste no Sistema

1. Abra o sistema: http://localhost:5173/
2. Abra console (F12)
3. Abra um ticket que tenha email
4. Mude status para "Resolvido"
5. Veja logs no console:
```
📤 Chamando Supabase Edge Function...
✅ Email enviado com sucesso! ID: ...
```
6. Verifique seu email!

---

## 🔍 Troubleshooting

### Erro: "Function not found"
- **Causa:** Função não foi deployada
- **Solução:** Siga os passos de deploy acima

### Erro: "Missing environment variable RESEND_API_KEY"
- **Causa:** Secret não configurado
- **Solução:** Configure o secret no dashboard ou via CLI

### Erro: "Invalid API key"
- **Causa:** API Key do Resend está errada
- **Solução:** Verifique a key em https://resend.com/api-keys

### Emails não chegam
1. Verifique logs da função:
```bash
npm run supabase:logs-email
```
2. Verifique dashboard do Resend: https://resend.com/emails
3. Verifique spam do email

### CORS ainda bloqueia
- **Causa:** Ainda está chamando API direta (código antigo no cache)
- **Solução:**
  - Limpe cache do navegador (Ctrl+Shift+Delete)
  - Recarregue página (Ctrl+Shift+R)
  - Verifique se `emailNotification.service.ts` está importando supabase

---

## 📊 Monitoramento

### Logs em Tempo Real
```bash
npm run supabase:logs-email
```

### Dashboard Resend
https://resend.com/emails

Você verá todos os emails enviados com:
- ✅ Status de entrega
- 📧 Destinatário
- 🕐 Horário
- 🆔 ID do email

---

## 🔒 Segurança

### Secrets
- ✅ API Key do Resend fica no **servidor** (Edge Function)
- ✅ Nunca exposta no frontend
- ✅ Protegida por autenticação Supabase

### CORS
- ✅ Headers configurados para aceitar requisições do frontend
- ✅ Apenas métodos POST permitidos
- ✅ Preflight (OPTIONS) tratado

---

## 📝 Estrutura de Arquivos

```
/home/user/Suporte/
├── supabase/
│   └── functions/
│       └── send-ticket-resolved-email/
│           └── index.ts             # Edge Function
│
├── src/
│   ├── services/
│   │   └── emailNotification.service.ts  # Chama Edge Function
│   └── pages/
│       └── tickets/
│           └── TicketDetail.tsx     # Usa o serviço
│
└── package.json                    # Scripts de deploy
```

---

## ✅ Checklist Final

Após deploy, verifique:

- [ ] Edge Function deployada no Supabase
- [ ] Secret `RESEND_API_KEY` configurado
- [ ] Domínio verificado no Resend (flow.suportebethel.com.br)
- [ ] Frontend atualizado (usa supabase.functions.invoke)
- [ ] Teste manual funcionou (curl)
- [ ] Teste no sistema funcionou (resolveu ticket)
- [ ] Email chegou na caixa de entrada
- [ ] Logs da função sem erros

---

**Versão:** 1.0
**Data:** 2026-02-05
**Status:** ✅ Código Pronto - Aguardando Deploy
