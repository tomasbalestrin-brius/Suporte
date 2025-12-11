-- Desabilita RLS temporariamente em todas as tabelas
-- Execute este script no SQL Editor do Supabase

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Remove todas as policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their tickets" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can create messages in any ticket" ON public.messages;
