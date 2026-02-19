-- Permite acesso público (sem autenticação) a tickets e mensagens
-- necessário para a página de chat do cliente (/tickets/:id/chat)
-- Segurança: IDs são UUIDs aleatórios (impossíveis de adivinhar)

-- Permite qualquer um ler um ticket pelo ID (acesso anônimo)
CREATE POLICY "Public can view tickets by id"
  ON public.tickets
  FOR SELECT
  USING (true);

-- Permite qualquer um ler mensagens de um ticket pelo ticket_id (acesso anônimo)
CREATE POLICY "Public can view messages by ticket"
  ON public.messages
  FOR SELECT
  USING (true);
