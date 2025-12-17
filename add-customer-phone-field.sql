-- Adiciona campo de telefone do cliente à tabela tickets
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Adiciona comentário no campo
COMMENT ON COLUMN public.tickets.customer_phone IS 'Telefone de contato do cliente';
