-- Tabela de Categorias/Produtos
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Nome do ícone lucide-react
  color TEXT, -- Cor hex para UI
  active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0, -- Para ordenação customizada
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Inserir categorias padrão
INSERT INTO public.categories (name, description, icon, color, order_index) VALUES
('Acesso à Plataforma', 'Problemas para acessar cursos e materiais', 'Lock', '#3B82F6', 1),
('Pagamento', 'Dúvidas sobre pagamentos e cobranças', 'CreditCard', '#10B981', 2),
('Certificado', 'Solicitações e problemas com certificados', 'Award', '#F59E0B', 3),
('Conteúdo do Curso', 'Dúvidas sobre o conteúdo das aulas', 'BookOpen', '#8B5CF6', 4),
('Suporte Técnico', 'Problemas técnicos gerais', 'Wrench', '#EF4444', 5),
('Outros', 'Outras solicitações', 'HelpCircle', '#6B7280', 6)
ON CONFLICT (name) DO NOTHING;

-- Verificar categorias criadas
SELECT * FROM public.categories ORDER BY order_index;
