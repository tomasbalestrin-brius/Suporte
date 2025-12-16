-- ============================================
-- TABELAS DE INTEGRAÇÕES - EMAIL E INSTAGRAM
-- ============================================

-- Tabela de configurações de integração Email
CREATE TABLE IF NOT EXISTS public.email_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, email_address)
);

-- Tabela de configurações de integração Instagram
CREATE TABLE IF NOT EXISTS public.instagram_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  page_id TEXT,
  page_access_token TEXT,
  active BOOLEAN DEFAULT TRUE,
  webhook_verified BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, instagram_account_id)
);

-- Tabela para mapear conversas externas para tickets
CREATE TABLE IF NOT EXISTS public.conversation_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('email', 'instagram')),
  external_id TEXT NOT NULL, -- Thread ID do email ou Conversation ID do Instagram
  external_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- Tabela para armazenar mensagens pendentes de sincronização
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  integration_type VARCHAR(20) NOT NULL CHECK (integration_type IN ('email', 'instagram')),
  integration_id UUID NOT NULL,
  message_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_email_integrations_user ON public.email_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_integrations_active ON public.email_integrations(active);
CREATE INDEX IF NOT EXISTS idx_instagram_integrations_user ON public.instagram_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_integrations_active ON public.instagram_integrations(active);
CREATE INDEX IF NOT EXISTS idx_conversation_mappings_ticket ON public.conversation_mappings(ticket_id);
CREATE INDEX IF NOT EXISTS idx_conversation_mappings_source_external ON public.conversation_mappings(source, external_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_integration ON public.sync_queue(integration_type, integration_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_email_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_instagram_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_integrations_updated_at ON public.email_integrations;
CREATE TRIGGER update_email_integrations_updated_at
  BEFORE UPDATE ON public.email_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_email_integrations_updated_at();

DROP TRIGGER IF EXISTS update_instagram_integrations_updated_at ON public.instagram_integrations;
CREATE TRIGGER update_instagram_integrations_updated_at
  BEFORE UPDATE ON public.instagram_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_instagram_integrations_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para email_integrations
DROP POLICY IF EXISTS "Users can manage own email integrations" ON public.email_integrations;
CREATE POLICY "Users can manage own email integrations"
ON public.email_integrations
FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all email integrations" ON public.email_integrations;
CREATE POLICY "Admins can view all email integrations"
ON public.email_integrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Políticas de acesso para instagram_integrations
DROP POLICY IF EXISTS "Users can manage own instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Users can manage own instagram integrations"
ON public.instagram_integrations
FOR ALL
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all instagram integrations" ON public.instagram_integrations;
CREATE POLICY "Admins can view all instagram integrations"
ON public.instagram_integrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Políticas de acesso para conversation_mappings
DROP POLICY IF EXISTS "Anyone can view conversation mappings" ON public.conversation_mappings;
CREATE POLICY "Anyone can view conversation mappings"
ON public.conversation_mappings
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "System can insert conversation mappings" ON public.conversation_mappings;
CREATE POLICY "System can insert conversation mappings"
ON public.conversation_mappings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Políticas de acesso para sync_queue
DROP POLICY IF EXISTS "Admins can manage sync queue" ON public.sync_queue;
CREATE POLICY "Admins can manage sync queue"
ON public.sync_queue
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verificar tabelas criadas
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('email_integrations', 'instagram_integrations', 'conversation_mappings', 'sync_queue')
ORDER BY table_name, ordinal_position;
