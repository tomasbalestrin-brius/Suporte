-- Script para criar usuário admin
-- Execute este script no SQL Editor do Supabase

-- IMPORTANTE: Primeiro você precisa criar o usuário no Supabase Auth
-- Vá em Authentication > Users > Add User
-- Email: tomasbalestrin@gmail.com
-- Password: 12345678
-- Copie o UUID gerado

-- Depois, execute este SQL substituindo 'USER_UUID_AQUI' pelo UUID real:

INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES (
  'USER_UUID_AQUI', -- Substitua pelo UUID do usuário criado
  'tomasbalestrin@gmail.com',
  'Tomas Balestrin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = 'admin',
  updated_at = NOW();

-- Verificar se foi criado
SELECT * FROM public.users WHERE email = 'tomasbalestrin@gmail.com';
