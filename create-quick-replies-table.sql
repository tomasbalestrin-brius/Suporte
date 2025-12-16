-- Tabela de templates de respostas rápidas
CREATE TABLE IF NOT EXISTS public.quick_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  shortcut TEXT NOT NULL UNIQUE, -- Ex: "/senha", "/acesso"
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- Ex: "Acesso", "Financeiro", "Técnico"
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_quick_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quick_replies_updated_at ON public.quick_replies;
CREATE TRIGGER update_quick_replies_updated_at
  BEFORE UPDATE ON public.quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_replies_updated_at();

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_quick_replies_shortcut ON public.quick_replies(shortcut);
CREATE INDEX IF NOT EXISTS idx_quick_replies_category ON public.quick_replies(category);
CREATE INDEX IF NOT EXISTS idx_quick_replies_active ON public.quick_replies(active);

-- RLS (Row Level Security)
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - Apenas admins podem gerenciar
DROP POLICY IF EXISTS "Admins can manage quick replies" ON public.quick_replies;
CREATE POLICY "Admins can manage quick replies"
ON public.quick_replies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Templates padrão de exemplo
INSERT INTO public.quick_replies (title, shortcut, content, category) VALUES
(
  'Reset de Senha',
  '/senha',
  'Para resetar sua senha, siga estes passos:

1. Acesse a página de login do seu produto
2. Clique em "Esqueci minha senha"
3. Digite seu email de compra
4. Verifique sua caixa de entrada (e spam!)
5. Aguarde até 15 minutos

Se não receber o email, me avise que eu verifico manualmente.',
  'Acesso'
),
(
  'Credenciais de Acesso',
  '/acesso',
  'Suas credenciais de acesso são:

**Email:** [Digite o email do cliente]
**Senha padrão:** [Veja no FAQ qual senha padrão do produto]
**Link de acesso:** [Link do produto específico]

Por favor, tente acessar e me confirme se funcionou!',
  'Acesso'
),
(
  'Solicitação de Reembolso',
  '/reembolso',
  'Para solicitar reembolso, você precisa fazer direto na plataforma de compra:

**Se comprou na Hotmart:**
- Acesse https://www.hotmart.com/
- Faça login com o email da compra
- Vá em "Minhas Compras"
- Clique no produto e solicite o reembolso

**Se comprou no Pagtrust:**
- Entre em contato pelo email: suporte@pagtrust.com.br

Lembrando que o prazo de garantia é de 7 dias.',
  'Financeiro'
),
(
  'Aguardando Aprovação de Pagamento',
  '/pagamento',
  'Seu pagamento ainda está em análise.

**PIX:** Aprovação instantânea (já deveria estar liberado)
**Cartão:** Até 3 dias úteis para aprovação

Por favor, verifique:
1. Se o pagamento foi aprovado no seu banco/cartão
2. Se o email está correto
3. Se já passou o prazo acima

Me envie o comprovante de pagamento que eu verifico!',
  'Financeiro'
);

-- Verificar templates criados
SELECT * FROM public.quick_replies ORDER BY category, title;
