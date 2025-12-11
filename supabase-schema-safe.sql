-- ============================================
-- SCHEMA COMPLETO - VERSÃO SEGURA (SEM ERROS)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'HelpCircle',
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  product TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  product TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CRIAR ÍNDICES (SE NÃO EXISTIREM)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON public.tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON public.messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON public.knowledge_base(title);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON public.knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_product ON public.knowledge_base(product);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON public.knowledge_base(active);

-- ============================================
-- 3. CRIAR FUNÇÃO (SE NÃO EXISTIR)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. REMOVER TRIGGERS ANTIGOS E RECRIAR
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
DROP TRIGGER IF EXISTS update_knowledge_updated_at ON public.knowledge_base;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. DESABILITAR RLS
-- ============================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. INSERIR DADOS (SE NÃO EXISTIREM)
-- ============================================

INSERT INTO public.categories (name, description, icon, color) VALUES
  ('Técnico', 'Problemas técnicos e bugs', 'Bug', 'red'),
  ('Dúvida', 'Dúvidas sobre o conteúdo', 'HelpCircle', 'blue'),
  ('Acesso', 'Problemas de acesso e login', 'Lock', 'yellow'),
  ('Financeiro', 'Questões de pagamento e cobrança', 'DollarSign', 'green'),
  ('Sugestão', 'Sugestões e melhorias', 'Lightbulb', 'purple'),
  ('Outro', 'Outros assuntos', 'MoreHorizontal', 'gray')
ON CONFLICT DO NOTHING;

INSERT INTO public.knowledge_base (title, category, content, keywords, product) VALUES
(
  'Como acessar o produto após a compra',
  'Acesso',
  'Após a compra, você receberá um e-mail com as instruções de acesso. Verifique sua caixa de entrada e spam. O acesso é liberado automaticamente em até 5 minutos após a confirmação do pagamento.',
  ARRAY['acesso', 'login', 'entrar', 'não consigo acessar', 'email'],
  NULL
),
(
  'Não recebi o e-mail de acesso',
  'Acesso',
  'Se você não recebeu o e-mail de acesso: 1) Verifique sua caixa de spam/lixo eletrônico 2) Confirme se o e-mail usado na compra está correto 3) Aguarde até 10 minutos após a confirmação do pagamento 4) Se o problema persistir, entre em contato informando seu e-mail de compra.',
  ARRAY['email', 'não recebi', 'spam', 'acesso'],
  NULL
),
(
  'Como recuperar minha senha',
  'Acesso',
  'Para recuperar sua senha: 1) Acesse a página de login 2) Clique em "Esqueci minha senha" 3) Digite o e-mail usado na compra 4) Verifique sua caixa de entrada (e spam) 5) Clique no link recebido e crie uma nova senha.',
  ARRAY['senha', 'recuperar', 'esqueci', 'redefinir'],
  NULL
),
(
  'Problemas com pagamento',
  'Financeiro',
  'Se você teve problemas com o pagamento: 1) Verifique se o cartão tem limite disponível 2) Confirme se os dados estão corretos 3) Tente usar outro método de pagamento 4) Entre em contato com seu banco 5) Se o problema persistir, entre em contato conosco com o comprovante.',
  ARRAY['pagamento', 'cartão', 'pix', 'boleto', 'erro', 'recusado'],
  NULL
),
(
  'Como solicitar reembolso',
  'Financeiro',
  'Para solicitar reembolso: 1) O reembolso pode ser solicitado em até 7 dias após a compra 2) Entre em contato informando: e-mail de compra, CPF e motivo 3) O prazo para análise é de até 5 dias úteis 4) Se aprovado, o estorno ocorre em até 30 dias conforme meio de pagamento.',
  ARRAY['reembolso', 'estorno', 'devolução', 'cancelar'],
  NULL
),
(
  'Certificado de conclusão',
  'Dúvida',
  'O certificado de conclusão é emitido automaticamente após você completar 100% do conteúdo do curso. Você pode acessá-lo na área de certificados da plataforma. O certificado é digital e possui QR Code para validação.',
  ARRAY['certificado', 'conclusão', 'diploma', 'concluir'],
  NULL
),
(
  'Prazo de acesso ao conteúdo',
  'Dúvida',
  'O acesso ao conteúdo é vitalício! Você pode assistir as aulas quantas vezes quiser, no seu próprio ritmo, sem prazo para terminar. Todas as atualizações futuras do curso também estarão disponíveis sem custo adicional.',
  ARRAY['prazo', 'acesso', 'vitalício', 'validade', 'quanto tempo'],
  NULL
)
ON CONFLICT DO NOTHING;
