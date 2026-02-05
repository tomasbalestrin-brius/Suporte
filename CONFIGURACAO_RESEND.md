# 📧 Configuração do Resend - Notificações por Email

## 🎯 O que foi Implementado

O sistema agora envia automaticamente um email de notificação para o cliente quando um ticket é marcado como **"Resolvido"**.

### ✨ Funcionalidades:
- ✅ Email automático ao resolver ticket
- ✅ Template HTML profissional e responsivo
- ✅ Versão texto alternativa (fallback)
- ✅ Informações do ticket (ID, título, data de resolução)
- ✅ Última mensagem como "resolução" (opcional)
- ✅ Link para visualizar detalhes do ticket
- ✅ Branding Bethel Educação

---

## 🚀 Como Configurar

### 1️⃣ Criar Conta no Resend

1. Acesse: https://resend.com/
2. Clique em **"Start Building"** ou **"Sign Up"**
3. Crie sua conta (pode usar GitHub ou email)
4. Plano gratuito inclui:
   - ✅ 3.000 emails por mês
   - ✅ 100 emails por dia
   - ✅ Perfeito para começar!

### 2️⃣ Obter API Key

1. Após fazer login, vá em: **API Keys**
2. Clique em **"Create API Key"**
3. Dê um nome (ex: "Sistema Suporte - Produção")
4. Copie a chave (formato: `re_...`)
5. **⚠️ IMPORTANTE:** Salve a chave em local seguro - ela só é exibida uma vez!

### 3️⃣ Configurar no Sistema

Abra o arquivo `.env` e configure:

```env
# Resend Email Configuration
VITE_RESEND_API_KEY=re_SuaChaveAquiCopiadadoResend

# Para TESTES (funciona imediatamente, sem configuração)
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_FROM_NAME=Suporte Bethel Educação

# Para PRODUÇÃO (após verificar domínio - veja Passo 4)
# VITE_FROM_EMAIL=suporte@betheleducacao.com.br
# VITE_FROM_NAME=Suporte Bethel Educação
```

### 4️⃣ (Opcional) Verificar Domínio Próprio

**Para Produção**, recomendado verificar seu próprio domínio:

#### 4.1 Adicionar Domínio no Resend

1. No Resend, vá em: **Domains**
2. Clique em **"Add Domain"**
3. Digite: `betheleducacao.com.br`
4. Clique em **"Add"**

#### 4.2 Configurar DNS

O Resend mostrará registros DNS para adicionar:

**Exemplo de registros:**
```
Tipo: TXT
Nome: @
Valor: resend-domain-verify=xxxxxxxxxxxxx

Tipo: MX
Nome: @
Valor: feedback-smtp.us-east-1.amazonses.com
Prioridade: 10

Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none;

Tipo: TXT
Nome: resend._domainkey
Valor: p=MIGfMA0GCS...
```

**Como adicionar (depende do seu provedor DNS):**

- **Registro.br:** Painel → Gerenciar DNS → Adicionar Registros
- **Cloudflare:** Dashboard → DNS → Add Record
- **GoDaddy:** My Products → DNS → Add Record
- **Hostgator:** cPanel → Zone Editor

⏱️ **Aguarde 24-48h** para propagação DNS completa

#### 4.3 Verificar Status

1. No Resend, clique em **"Verify DNS Records"**
2. Quando todos ficarem ✅ verdes, está pronto!
3. Agora pode usar: `suporte@betheleducacao.com.br`

---

## 🎨 Template do Email

O email enviado contém:

### Header
- Gradiente roxo com ícone ✅
- Título "Ticket Resolvido"

### Corpo
- Saudação personalizada com nome do cliente
- Card com detalhes do ticket:
  - Título
  - ID (8 primeiros caracteres)
  - Data/hora de resolução
- Mensagem de resolução (última mensagem do ticket)
- Botão para visualizar ticket

### Footer
- Aviso que é email automático
- Copyright Bethel Educação

---

## 🔄 Fluxo de Funcionamento

```
1. Atendente marca ticket como "Resolvido"
   ↓
2. Sistema verifica:
   ✓ Status mudou para "resolved"?
   ✓ Tem customer_email?
   ✓ Resend está configurado?
   ↓
3. Se SIM → Envia email via Resend API
   ↓
4. Mostra toast de sucesso/erro
   ↓
5. Cliente recebe email na caixa de entrada
```

**Importante:** Se o envio do email falhar, o ticket ainda é atualizado normalmente. Não bloqueia o sistema.

---

## 🧪 Como Testar

### Teste 1: Com Email de Teste (onboarding@resend.dev)

1. Configure `.env` com API Key e `VITE_FROM_EMAIL=onboarding@resend.dev`
2. Reinicie o servidor: `npm run dev`
3. Crie um ticket de teste com **seu email** em `customer_email`
4. Abra o ticket e mude status para **"Resolvido"**
5. Verifique seu email (chegará em segundos!)

### Teste 2: Com Domínio Próprio

1. Verifique domínio no Resend (Passo 4)
2. Configure `.env` com `VITE_FROM_EMAIL=suporte@betheleducacao.com.br`
3. Reinicie servidor
4. Repita teste 1

---

## 🐛 Troubleshooting

### ❌ "Email não foi enviado"

**Verificações:**

1. **API Key correta?**
   - Verifique no console do navegador (F12) se há erros
   - Teste API key: https://resend.com/docs/api-reference/introduction

2. **Variáveis no .env?**
   ```bash
   # Reinicie o servidor após alterar .env
   npm run dev
   ```

3. **Email do cliente cadastrado?**
   - Ticket precisa ter `customer_email` preenchido

4. **Quota excedida?**
   - Plano gratuito: 100 emails/dia
   - Verifique em: https://resend.com/dashboard

### ⚠️ "Email vai para spam"

**Soluções:**

1. **Verifique domínio próprio** (Passo 4)
2. **Configure SPF, DKIM, DMARC** corretamente
3. **Evite palavras spam** no assunto/corpo
4. **Use domínio com boa reputação**

### 📨 "Email não chegou"

1. **Verifique spam/lixo eletrônico**
2. **Logs do Resend:**
   - Vá em: https://resend.com/emails
   - Veja status de cada email enviado
3. **Console do navegador:**
   - Abra F12 → Console
   - Procure por erros ao resolver ticket

---

## 📊 Monitoramento

### Dashboard do Resend

Acesse: https://resend.com/emails

**Informações disponíveis:**
- ✉️ Total de emails enviados
- ✅ Emails entregues
- ❌ Emails com erro
- 📈 Taxa de abertura (planos pagos)
- 🔗 Cliques em links (planos pagos)

### Logs do Sistema

No console do navegador ao resolver ticket:
```
✅ Email enviado com sucesso: { id: '...' }
```

Se houver erro:
```
❌ Erro ao enviar email: [detalhes do erro]
```

---

## 💰 Planos do Resend

### Gratuito (Free)
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Todos os recursos básicos
- ✅ Perfeito para começar

### Pro ($20/mês)
- ✅ 50.000 emails/mês
- ✅ 1.000 emails/dia
- ✅ Analytics de abertura/cliques
- ✅ Suporte prioritário

### Empresarial (Custom)
- ✅ Volume ilimitado
- ✅ IP dedicado
- ✅ SLA garantido

---

## 🔐 Segurança

### Boas Práticas:

1. **Nunca commite a API Key**
   - Está no `.env` que já está no `.gitignore`
   - ✅ Seguro

2. **Use variáveis de ambiente diferentes**
   - Desenvolvimento: API Key de teste
   - Produção: API Key de produção

3. **Rotacione keys periodicamente**
   - A cada 6 meses, crie nova API Key
   - Delete a antiga no Resend

4. **Configure CORS** (se necessário)
   - Resend API funciona server-side
   - Não expõe keys no frontend

---

## 📝 Personalização

### Alterar Template do Email

Edite o arquivo:
```
/home/user/Suporte/src/services/emailNotification.service.ts
```

**Seções para personalizar:**
- `htmlContent`: HTML do email
- `textContent`: Versão texto
- `subject`: Assunto do email

### Adicionar Mais Notificações

Você pode adicionar emails para outros eventos:

```typescript
// Novo ticket criado
async sendTicketCreatedEmail(...)

// Ticket atribuído
async sendTicketAssignedEmail(...)

// Nova mensagem recebida
async sendNewMessageEmail(...)
```

---

## ✅ Checklist de Configuração

- [ ] Criar conta no Resend
- [ ] Obter API Key
- [ ] Adicionar `VITE_RESEND_API_KEY` no `.env`
- [ ] Configurar `VITE_FROM_EMAIL` (usar `onboarding@resend.dev` para teste)
- [ ] Reiniciar servidor (`npm run dev`)
- [ ] Testar envio resolvendo um ticket
- [ ] Verificar email na caixa de entrada
- [ ] (Opcional) Verificar domínio próprio no Resend
- [ ] (Opcional) Atualizar `VITE_FROM_EMAIL` para domínio próprio

---

## 🆘 Suporte

**Documentação Resend:**
- API Reference: https://resend.com/docs
- Guides: https://resend.com/docs/send-with-nodejs
- Status: https://status.resend.com/

**Comunidade:**
- Discord: https://resend.com/discord
- GitHub: https://github.com/resendlabs/resend-node

---

**Versão:** 1.0
**Última Atualização:** 2026-02-05
**Status:** ✅ Implementado e Pronto para Uso
