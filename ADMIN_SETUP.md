# 🔐 Configuração do Usuário Admin

Este guia explica como configurar o usuário administrador do sistema.

## 📋 Credenciais do Admin

- **Email**: tomasbalestrin@gmail.com
- **Senha**: 12345678
- **Role**: admin

## 🚀 Método 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Criar o usuário no Authentication

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** > **Users**
4. Clique em **"Add user"** > **"Create new user"**
5. Preencha os dados:
   - Email: `tomasbalestrin@gmail.com`
   - Password: `12345678`
   - Auto Confirm User: ✅ **Marque esta opção**
6. Clique em **"Create user"**
7. **Copie o UUID** do usuário criado (aparece na coluna "UID")

### Passo 2: Configurar como Admin no banco

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole e execute o seguinte SQL (substituindo `USER_UUID_AQUI` pelo UUID copiado):

```sql
INSERT INTO public.users (id, email, name, role)
VALUES (
  'USER_UUID_AQUI', -- Cole o UUID aqui
  'tomasbalestrin@gmail.com',
  'Tomas Balestrin',
  'admin'
)
ON CONFLICT (id)
DO UPDATE SET role = 'admin';
```

4. Clique em **"Run"**
5. ✅ Pronto! O usuário admin está configurado

## 🔧 Método 2: Via SQL Script Automático

Se o usuário já foi criado no Authentication, você pode usar a função helper:

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o conteúdo do arquivo `supabase-admin-setup.sql`
3. Depois execute:

```sql
SELECT create_admin_user();
```

## ✅ Verificação

Para verificar se o admin foi criado corretamente:

```sql
SELECT id, email, name, role
FROM public.users
WHERE email = 'tomasbalestrin@gmail.com';
```

Deve retornar:
- **role**: `admin`
- **email**: `tomasbalestrin@gmail.com`

## 🔑 Login

Após a configuração, faça login no sistema:

1. Acesse a página de login da aplicação
2. Use as credenciais:
   - Email: `tomasbalestrin@gmail.com`
   - Senha: `12345678`
3. Você terá acesso completo ao sistema como administrador

## 🛡️ Funcionalidades Admin

Como admin, você terá acesso a:

- ✅ Visualizar **todos os tickets** de todos os usuários
- ✅ Responder e gerenciar **qualquer ticket**
- ✅ Ver estatísticas completas do sistema
- ✅ Gerenciar categorias
- ✅ Administrar usuários (futuro)
- ✅ Dashboard administrativo (futuro)

## 🔒 Segurança

**IMPORTANTE**:
- Após configurar em produção, **altere a senha** imediatamente!
- Use uma senha forte e única
- Nunca compartilhe as credenciais de admin
- Considere implementar autenticação de dois fatores (2FA)

## 🆘 Problemas Comuns

### Erro "User already exists"
O usuário já foi criado. Pule para o Passo 2 do Método 1.

### Erro ao fazer login
- Verifique se marcou "Auto Confirm User" ao criar
- Ou confirme o email manualmente no Dashboard

### Não vê as funcionalidades de admin
- Verifique se o campo `role` está como `'admin'` no banco
- Faça logout e login novamente
