-- Atualização do Schema: Adiciona novos campos e tabela de conhecimento

-- 1. Adicionar novos campos na tabela tickets
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_cpf TEXT,
ADD COLUMN IF NOT EXISTS product TEXT;

-- 2. Criar tabela de Base de Conhecimento
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[], -- Array de palavras-chave para busca
  product TEXT, -- Produto relacionado (opcional)
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para melhor performance na busca
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON public.knowledge_base(title);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON public.knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_product ON public.knowledge_base(product);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON public.knowledge_base(active);

-- 4. Criar trigger para atualizar updated_at
CREATE TRIGGER update_knowledge_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Desabilitar RLS na tabela knowledge_base (já que removemos auth)
ALTER TABLE public.knowledge_base DISABLE ROW LEVEL SECURITY;

-- 6. Inserir exemplos de base de conhecimento
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
)
ON CONFLICT DO NOTHING;

-- 7. Comentários nas tabelas
COMMENT ON TABLE public.knowledge_base IS 'Base de conhecimento para respostas automáticas da IA';
COMMENT ON COLUMN public.knowledge_base.keywords IS 'Palavras-chave para busca semântica';
COMMENT ON COLUMN public.knowledge_base.active IS 'Indica se o conhecimento está ativo para uso da IA';
