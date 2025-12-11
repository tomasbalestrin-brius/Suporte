-- Policy para permitir que usuários criem seu próprio perfil durante o registro
CREATE POLICY "Users can create their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
