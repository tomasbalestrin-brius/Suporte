# 🗄️ Executar Migrations do Banco de Dados

## ⚠️ IMPORTANTE
Execute estas migrations **NA ORDEM** listada abaixo no Supabase SQL Editor.

## 📋 Como Executar

### Acesse o SQL Editor
1. Vá para: https://app.supabase.com
2. Selecione seu projeto
3. Clique em **🗄️ SQL Editor** (menu lateral esquerdo)
4. Clique em **"New query"**

---

## 🔢 Migration 1: Schema Completo (BASE)

**Arquivo**: `supabase-schema-complete.sql`

**O que faz**:
- Cria todas as tabelas necessárias (users, tickets, messages, categories, etc.)
- Configura Row Level Security (RLS)
- Cria políticas de acesso
- Adiciona índices para performance

**Como executar**:
1. Abra o arquivo `supabase-schema-complete.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Aguarde mensagem de sucesso

---

## 🔢 Migration 2: Campo de Telefone

**Arquivo**: `add-customer-phone-field.sql`

**O que faz**:
- Adiciona campo `customer_phone` na tabela tickets
- Permite coletar telefone do cliente

**Como executar**:
1. Abra o arquivo `add-customer-phone-field.sql`
2. Copie o conteúdo:
```sql
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

COMMENT ON COLUMN public.tickets.customer_phone IS 'Telefone de contato do cliente';
```
3. Cole no SQL Editor
4. Clique em **"Run"**

---

## 🔢 Migration 3: Criar Usuário Admin (OPCIONAL mas recomendado)

**Arquivo**: `create-admin-user.sql`

**O que faz**:
- Cria um usuário admin para você fazer login

**Como executar**:
1. No Supabase, vá em **🔐 Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email**: seu@email.com
   - **Password**: SuaSenhaForte123!
   - **Auto Confirm User**: ✅ Marque
4. Clique em **"Create user"**
5. **Copie o UUID** do usuário criado (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

6. No SQL Editor, execute:
```sql
-- Insere o usuário na tabela users
INSERT INTO public.users (id, email, name, role)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- Cole o UUID aqui
  'seu@email.com',
  'Seu Nome',
  'admin'
);
```

---

## ✅ Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Ver todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estrutura da tabela tickets
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tickets'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver usuários criados
SELECT id, email, name, role, created_at
FROM public.users;
```

**Você deve ver**:
- Várias tabelas (users, tickets, messages, categories, etc.)
- A coluna `customer_phone` na tabela tickets
- Seu usuário admin listado

---

## 🔒 Desabilitar Email Confirmation (Para Testes)

Se você quiser permitir login sem confirmar email:

1. Vá em **🔐 Authentication** > **Email Templates**
2. Em **"Email confirmations"**, desabilite temporariamente

Ou execute:

```sql
-- Desabilita confirmação de email
UPDATE auth.config
SET email_confirm_enabled = false;
```

**⚠️ ATENÇÃO**: Em produção, mantenha a confirmação de email ativada!

---

## 🚀 Pronto!

Após executar todas as migrations:

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse o sistema

3. Faça login com o usuário admin criado

4. Teste criar um ticket

---

## ❌ Problemas?

### "relation already exists"
- Ignore, significa que a tabela já foi criada

### "permission denied"
- Você não tem permissão
- Verifique se está usando o projeto correto no Supabase

### "syntax error"
- Verifique se copiou o SQL completo
- Certifique-se de não ter caracteres extras

### Não consigo fazer login
- Verifique se criou o usuário no Authentication
- Confirme que adicionou o usuário na tabela `public.users`
- Verifique se o UUID está correto

---

## 📚 Migrations Disponíveis (Opcional)

Outros arquivos SQL no projeto que você pode executar conforme necessário:

- `add-categories-table.sql` - Já incluído no schema completo
- `create-ai-feedback-table.sql` - Para feedback da IA Sofia
- `create-integrations-tables.sql` - Para integrações (email, Instagram)
- `create-quick-replies-table.sql` - Para respostas rápidas
- `create-webhooks-tables.sql` - Para webhooks
- `update-schema-knowledge.sql` - Para base de conhecimento

**Nota**: O `supabase-schema-complete.sql` já inclui a maioria dessas tabelas!
