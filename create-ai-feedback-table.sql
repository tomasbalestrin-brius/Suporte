-- Tabela para armazenar feedback das respostas da IA
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('positive', 'negative')),
  comment TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ai_feedback_ticket ON public.ai_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_message ON public.ai_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating ON public.ai_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at ON public.ai_feedback(created_at);

-- RLS (Row Level Security)
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Política de leitura - Qualquer usuário autenticado pode ver feedbacks
DROP POLICY IF EXISTS "Anyone can view ai feedback" ON public.ai_feedback;
CREATE POLICY "Anyone can view ai feedback"
ON public.ai_feedback
FOR SELECT
TO authenticated
USING (true);

-- Política de inserção - Qualquer usuário autenticado pode dar feedback
DROP POLICY IF EXISTS "Anyone can insert ai feedback" ON public.ai_feedback;
CREATE POLICY "Anyone can insert ai feedback"
ON public.ai_feedback
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de atualização - Usuários podem atualizar seu próprio feedback
DROP POLICY IF EXISTS "Users can update own feedback" ON public.ai_feedback;
CREATE POLICY "Users can update own feedback"
ON public.ai_feedback
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Política de exclusão - Apenas admins podem excluir
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.ai_feedback;
CREATE POLICY "Admins can delete feedback"
ON public.ai_feedback
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verificar estrutura
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename = 'ai_feedback';
