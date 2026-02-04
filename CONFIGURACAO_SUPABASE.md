# 🗄️ Configuração do Supabase - CRÍTICO

## ⚠️ ATENÇÃO
**O sistema NÃO FUNCIONA sem o Supabase configurado!** É o banco de dados e autenticação de todo o sistema.

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"** ou **"New Project"**
3. Faça login (pode usar GitHub)
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: Suporte Bethel
   - **Database Password**: Crie uma senha forte (guarde!)
   - **Region**: Brazil (sa-east-1) - mais rápido para você
6. Clique em **"Create new project"**
7. Aguarde 2-3 minutos (ele cria o banco de dados)

### 2. Obter Credenciais

1. No projeto criado, clique em **⚙️ Settings** (menu lateral)
2. Clique em **API** no submenu
3. Você verá duas informações importantes:

   **Project URL** (algo como):
   ```
   https://abcdefghijklmnop.supabase.co
   ```

   **anon public** (key longa, algo como):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
   ```

### 3. Configurar no Projeto

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os placeholders:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
   ```

### 4. Criar Estrutura do Banco de Dados

1. No Supabase, vá em **🗄️ SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. **COPIE E COLE** o conteúdo do arquivo `schema.sql` (na raiz do projeto)
4. Clique em **"Run"**
5. Aguarde finalizar (pode levar 10-20 segundos)

### 5. Configurar Autenticação

1. No Supabase, vá em **🔐 Authentication** > **Providers**
2. Certifique-se que **Email** está habilitado
3. Em **Email Auth**, configure:
   - **Enable Email Confirmations**: OFF (para facilitar testes)
   - Depois você pode habilitar

### 6. Criar Primeiro Usuário Admin

1. Vá em **🔐 Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email**: seu@email.com
   - **Password**: SuaSenhaForte123!
   - **Auto Confirm User**: ✅ ON
4. Clique em **"Create user"**

### 7. Tornar Usuário Admin

1. Vá em **🗄️ Table Editor** (menu lateral)
2. Selecione a tabela **users**
3. Encontre seu usuário e clique nele
4. Mude o campo **role** de `user` para `admin`
5. Salve

### 8. Testar

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```
2. Acesse o sistema
3. Faça login com as credenciais criadas
4. Deve funcionar! 🎉

## 🔒 Segurança

- ✅ A `anon key` é PÚBLICA (pode ficar no `.env`)
- ✅ O `.env` já está no `.gitignore`
- ⚠️ **NUNCA** compartilhe a **service_role key** (essa é privada!)

## 📁 Arquivo schema.sql

Se não encontrar o `schema.sql`, aqui está um básico para começar:

```sql
-- Habilita extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela de usuários
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  role text default 'user',
  created_at timestamp with time zone default now()
);

-- Tabela de tickets
create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  title text not null,
  description text,
  status text default 'open',
  priority text default 'medium',
  category text,
  customer_name text,
  customer_email text,
  customer_cpf text,
  customer_phone text,
  product text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de mensagens
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  user_id uuid references public.users(id),
  content text not null,
  sender_type text not null,
  created_at timestamp with time zone default now()
);

-- Habilita Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.tickets enable row level security;
alter table public.messages enable row level security;

-- Políticas de acesso (básicas)
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create policy "Anyone can read tickets" on public.tickets for select using (true);
create policy "Authenticated users can create tickets" on public.tickets for insert with check (true);
create policy "Authenticated users can update tickets" on public.tickets for update using (true);

create policy "Anyone can read messages" on public.messages for select using (true);
create policy "Authenticated users can create messages" on public.messages for insert with check (true);
```

## ❌ Problemas Comuns

### "Invalid API key"
- Você copiou a key errada
- Copie a **anon public** key, não a service_role

### "Database connection failed"
- Aguarde alguns minutos, o projeto ainda está sendo criado
- Verifique se o Project URL está correto

### Não consigo fazer login
- Certifique-se de criar o usuário no Supabase primeiro
- Verifique se o email está correto
- Confirme que o usuário está criado em Authentication > Users

## 📚 Mais Informações

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
