-- Script para criar usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- IMPORTANTE: Este script cria um usuário admin com credenciais específicas
-- Email: tomasbalestrin@gmail.com
-- Senha: 12345678
-- Role: admin

-- Passo 1: Vá para o Supabase Dashboard
-- Passo 2: Navegue até Authentication > Users
-- Passo 3: Clique em "Add user" > "Create new user"
-- Passo 4: Preencha:
--   - Email: tomasbalestrin@gmail.com
--   - Password: 12345678
--   - Confirm password (se necessário)
-- Passo 5: Copie o UUID do usuário criado
-- Passo 6: Execute o SQL abaixo substituindo 'USER_UUID_AQUI' pelo UUID copiado

-- Após criar o usuário no Authentication, execute:
/*
INSERT INTO public.users (id, email, name, role)
VALUES (
  'USER_UUID_AQUI', -- Substitua pelo UUID do usuário criado
  'tomasbalestrin@gmail.com',
  'Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
*/

-- ===============================================
-- ALTERNATIVA: Função para criar usuário admin
-- ===============================================

-- Esta função permite criar um usuário admin programaticamente
-- Nota: Requer permissões de superusuário no Supabase

CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Verifica se o usuário já existe
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'tomasbalestrin@gmail.com';

  -- Se o usuário não existe, você precisa criá-lo manualmente no Dashboard
  -- Este script apenas atualiza o perfil para admin se o usuário já existir
  IF new_user_id IS NOT NULL THEN
    -- Atualiza ou insere o perfil como admin
    INSERT INTO public.users (id, email, name, role)
    VALUES (
      new_user_id,
      'tomasbalestrin@gmail.com',
      'Admin',
      'admin'
    )
    ON CONFLICT (id)
    DO UPDATE SET role = 'admin';

    RAISE NOTICE 'Usuário admin configurado com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário não encontrado. Crie o usuário no Dashboard primeiro.';
  END IF;
END;
$$;

-- Execute esta função após criar o usuário no Dashboard:
-- SELECT create_admin_user();
