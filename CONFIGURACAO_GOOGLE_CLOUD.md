# 🔐 Configuração Google Cloud Console - Webmail Integration

## Guia Passo a Passo para Conectar suporte@betheleducacao.com.br

---

## ✅ Pré-requisitos

- [ ] Conta Google do email **suporte@betheleducacao.com.br**
- [ ] Acesso ao Google Cloud Console
- [ ] Projeto já criado: **helical-song-481414-n3**
- [ ] Credenciais OAuth já geradas

---

## 📋 Credenciais Já Configuradas

```
Project ID: helical-song-481414-n3
Client ID: 10322214062-3anlmji52o15ud6bojpdeltbvlb2seak.apps.googleusercontent.com
Client Secret: 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
```

✅ **Estas credenciais já estão no código do sistema!**

---

## 🚀 Passo 1: Acessar Google Cloud Console

1. Abra: https://console.cloud.google.com/
2. Faça login com a conta do Google Workspace/Gmail da Bethel
3. Selecione o projeto: **helical-song-481414-n3**

---

## 🔑 Passo 2: Configurar URIs de Redirecionamento

### 2.1 Navegar para Credenciais

1. No menu lateral, clique em **APIs e Serviços**
2. Clique em **Credenciais**
3. Você verá a credencial OAuth 2.0 Client ID já criada

### 2.2 Editar OAuth 2.0 Client ID

1. Clique no nome da credencial (ou no ícone de lápis ✏️)
2. Role até a seção **URIs de redirecionamento autorizados**

### 2.3 Adicionar URIs

**IMPORTANTE:** Adicione EXATAMENTE estas URIs:

#### Para Desenvolvimento (localhost):
```
http://localhost:5173/auth/gmail/callback
```

#### Para Produção:
```
https://seu-dominio-producao.com/auth/gmail/callback
```

**Substitua `seu-dominio-producao.com` pelo domínio real do sistema em produção!**

### 2.4 Salvar

1. Clique em **SALVAR** no final da página
2. Aguarde alguns minutos para as alterações propagarem

---

## 🎯 Passo 3: Verificar Escopos OAuth (Tela de Consentimento)

### 3.1 Acessar Tela de Consentimento

1. No menu **APIs e Serviços**, clique em **Tela de consentimento OAuth**
2. Você verá o tipo do app (Interno ou Externo)

### 3.2 Configurar Informações do App

Se ainda não configurado, preencha:

- **Nome do app:** Sistema de Suporte Bethel
- **Email de suporte do usuário:** suporte@betheleducacao.com.br
- **Logo do app:** (opcional)
- **Domínio da página inicial:** seu-dominio.com
- **Links de política de privacidade:** (se aplicável)
- **Email do desenvolvedor:** seu-email@betheleducacao.com.br

### 3.3 Adicionar Escopos

Clique em **ADICIONAR OU REMOVER ESCOPOS** e adicione:

| Escopo | Descrição | Obrigatório |
|--------|-----------|-------------|
| `https://www.googleapis.com/auth/gmail.readonly` | Ler emails | ✅ Sim |
| `https://www.googleapis.com/auth/gmail.send` | Enviar emails | ✅ Sim |
| `https://www.googleapis.com/auth/gmail.modify` | Modificar emails (marcar como lido) | ✅ Sim |
| `https://www.googleapis.com/auth/userinfo.email` | Email do usuário | ✅ Sim |
| `https://www.googleapis.com/auth/userinfo.profile` | Perfil do usuário | ✅ Sim |

### 3.4 Usuários de Teste (se app estiver em teste)

Se o status for **Em teste**:

1. Vá na aba **Usuários de teste**
2. Adicione: **suporte@betheleducacao.com.br**
3. Adicione outros emails de teste se necessário

### 3.5 Publicar App (Opcional)

Para uso em produção com qualquer usuário:

1. Clique em **PUBLICAR APP**
2. Siga o processo de verificação do Google (pode levar dias)

**Nota:** Para uso interno do Bethel, não precisa publicar!

---

## 🔓 Passo 4: Habilitar Gmail API

### 4.1 Ativar API

1. No menu, vá em **APIs e Serviços** → **Biblioteca**
2. Busque por **Gmail API**
3. Clique em **Gmail API**
4. Clique em **ATIVAR** (se ainda não estiver ativada)

### 4.2 Verificar Cota

1. Vá em **APIs e Serviços** → **Painel**
2. Clique em **Gmail API**
3. Veja as quotas disponíveis:
   - **Consultas por dia:** 1 bilhão
   - **Consultas por segundo por usuário:** 250

✅ Quotas padrão são suficientes para o uso do sistema!

---

## 🌐 Passo 5: Configurar Domínio Autorizado (se aplicável)

Se o sistema rodar em um domínio customizado:

### 5.1 Adicionar Domínio

1. Em **Tela de consentimento OAuth**
2. Seção **Domínios autorizados**
3. Adicione: `betheleducacao.com.br` (ou seu domínio)
4. Salve

### 5.2 Verificar Propriedade do Domínio

1. Vá em **Google Search Console**: https://search.google.com/search-console
2. Adicione e verifique seu domínio
3. Isso permite usar o domínio no OAuth

---

## ✅ Passo 6: Testar Configuração

### 6.1 No Sistema

1. Acesse o sistema: `http://localhost:5173` (dev) ou URL de produção
2. Faça login como admin
3. Vá em **Menu** → **Integração Email**
4. Clique em **Conectar Gmail**

### 6.2 Fluxo OAuth

Você será redirecionado para:

```
https://accounts.google.com/o/oauth2/v2/auth?...
```

### 6.3 Autorização

1. Selecione a conta: **suporte@betheleducacao.com.br**
2. Revise as permissões solicitadas:
   - ✅ Ver, editar e excluir mensagens de email
   - ✅ Enviar email em seu nome
   - ✅ Ver suas informações pessoais
3. Clique em **Continuar** ou **Permitir**

### 6.4 Redirecionamento

Após autorização, você será redirecionado para:

```
http://localhost:5173/auth/gmail/callback?code=...
```

O sistema automaticamente:
1. Troca o código por tokens
2. Salva a integração no banco
3. Redireciona para página de integrações
4. Mostra "Conectado com sucesso!"

---

## 🔧 Troubleshooting

### ❌ Erro: "redirect_uri_mismatch"

**Causa:** URI de redirecionamento não autorizada

**Solução:**
1. Copie exatamente a URI que aparece no erro
2. Adicione no Google Cloud Console (Passo 2)
3. Aguarde 5 minutos
4. Tente novamente

### ❌ Erro: "access_denied"

**Causa:** Usuário não autorizou ou app não está configurado

**Solução:**
1. Verifique se o email está nos usuários de teste (se app em teste)
2. Verifique se os escopos estão corretos
3. Tente fazer login novamente

### ❌ Erro: "invalid_client"

**Causa:** Client ID ou Secret inválidos

**Solução:**
1. Verifique se as credenciais no código estão corretas
2. Confirme no Google Cloud Console
3. Regenere as credenciais se necessário

### ❌ App mostra "Não verificado"

**Normal!** Para uso interno, pode clicar em **Avançado** → **Ir para [app] (não seguro)**

Para remover este aviso:
1. Publique o app no Google Cloud Console
2. Complete o processo de verificação do Google

---

## 📊 Monitoramento

### Ver Requisições à API

1. Google Cloud Console → **APIs e Serviços** → **Painel**
2. Clique em **Gmail API**
3. Veja gráficos de:
   - Tráfego
   - Erros
   - Latência

### Revogar Acesso (se necessário)

1. Acesse: https://myaccount.google.com/permissions
2. Faça login com **suporte@betheleducacao.com.br**
3. Encontre "Sistema de Suporte Bethel"
4. Clique em **Remover acesso**

---

## 🔐 Segurança

### Boas Práticas:

✅ **Client Secret deve ser mantido em segredo**
- Nunca commitar em repositórios públicos
- Usar variáveis de ambiente em produção
- Rotacionar periodicamente

✅ **Limitar escopos ao mínimo necessário**
- Só solicitar permissões realmente usadas
- Revisar escopos periodicamente

✅ **Monitorar uso da API**
- Verificar logs regularmente
- Configurar alertas de quota
- Detectar uso anormal

✅ **Renovar tokens automaticamente**
- Sistema já faz isso!
- Refresh tokens têm validade longa

---

## 📝 Checklist Final

Antes de ir para produção, verifique:

- [ ] URIs de redirecionamento configuradas (dev + prod)
- [ ] Escopos OAuth corretos adicionados
- [ ] Gmail API habilitada
- [ ] Tela de consentimento configurada
- [ ] Teste de conexão realizado com sucesso
- [ ] Email sincronizando corretamente
- [ ] Tokens sendo renovados automaticamente
- [ ] Domínio de produção adicionado (se aplicável)
- [ ] Credenciais OAuth em variáveis de ambiente (produção)
- [ ] Monitoramento configurado

---

## 🚀 Próximos Passos Após Configuração

1. ✅ Conectar Gmail no sistema
2. ✅ Fazer sincronização manual (botão ⟳)
3. ✅ Verificar se ticket foi criado
4. ✅ Ativar sincronização automática
5. ✅ Deploy da Edge Function (supabase/functions/sync-emails)
6. ✅ Configurar cron job (a cada 5-10 minutos)
7. ✅ Monitorar logs da Edge Function

---

**Configuração Completa!** 🎉

O webmail **suporte@betheleducacao.com.br** está pronto para ser conectado ao sistema de tickets.
