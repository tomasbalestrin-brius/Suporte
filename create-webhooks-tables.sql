-- Tabela de configuração de webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['ticket_created', 'status_changed', 'message_sent']
  active BOOLEAN DEFAULT TRUE,
  secret TEXT, -- Chave secreta para assinatura dos webhooks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at em webhooks
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_webhooks_updated_at ON public.webhooks;
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Tabela de logs de webhooks (para auditoria e debug)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  status_code INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  response_body TEXT,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks(active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_ticket_id ON public.webhook_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_executed_at ON public.webhook_logs(executed_at DESC);

-- RLS (Row Level Security) para webhooks - apenas admins podem gerenciar
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhooks;
CREATE POLICY "Admins can manage webhooks"
ON public.webhooks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs"
ON public.webhook_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Permite que o sistema insira logs (para service role)
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;
CREATE POLICY "System can insert webhook logs"
ON public.webhook_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Webhook de exemplo para email (Zapier, Make, n8n, etc)
-- Descomente e ajuste conforme necessário
/*
INSERT INTO public.webhooks (name, url, events, active, secret) VALUES
(
  'Email Notifications',
  'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/',
  ARRAY['ticket_created', 'status_changed'],
  true,
  'your-secret-key-here'
);
*/

-- Verificar webhooks criados
SELECT * FROM public.webhooks;
