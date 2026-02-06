-- Enable Row Level Security (RLS) on all tables
-- This migration adds security policies to protect user data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Admin can view own profile (needed for auth)
CREATE POLICY "Admin can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert users
CREATE POLICY "Admins can create users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TICKETS TABLE POLICIES
-- ============================================

-- Allow anonymous ticket creation (public form)
-- Note: Tickets are created through a service role key or anon key
-- This policy allows INSERT even without authentication
CREATE POLICY "Anyone can create tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (true); -- Allow any insert

-- Only admins can view tickets
CREATE POLICY "Admins can view all tickets"
  ON public.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON public.tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.tickets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Allow message creation (public ticket form + admin responses)
CREATE POLICY "Anyone can create messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (true); -- Allow any insert

-- Only admins can view messages
CREATE POLICY "Admins can view messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update messages
CREATE POLICY "Admins can update messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete messages
CREATE POLICY "Admins can delete messages"
  ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- Everyone can read categories
CREATE POLICY "Anyone authenticated can view categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- KNOWLEDGE BASE POLICIES
-- ============================================

-- Everyone can read knowledge base
CREATE POLICY "Anyone authenticated can view knowledge base"
  ON public.knowledge_base
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage knowledge base
CREATE POLICY "Admins can manage knowledge base"
  ON public.knowledge_base
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- WEBHOOKS TABLE POLICIES
-- ============================================

-- Only admins can manage webhooks
CREATE POLICY "Admins can manage webhooks"
  ON public.webhooks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EMAIL INTEGRATIONS POLICIES
-- ============================================

-- Only admins can manage email integrations
CREATE POLICY "Admins can manage email integrations"
  ON public.email_integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INSTAGRAM INTEGRATIONS POLICIES
-- ============================================

-- Only admins can manage instagram integrations
CREATE POLICY "Admins can manage instagram integrations"
  ON public.instagram_integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- AI FEEDBACK POLICIES
-- ============================================

-- Allow anyone to create AI feedback (including anonymous users)
CREATE POLICY "Anyone can create ai feedback"
  ON public.ai_feedback
  FOR INSERT
  WITH CHECK (true); -- Allow any insert

-- Only admins can view AI feedback
CREATE POLICY "Admins can view ai feedback"
  ON public.ai_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update AI feedback
CREATE POLICY "Admins can update ai feedback"
  ON public.ai_feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete AI feedback
CREATE POLICY "Admins can delete ai feedback"
  ON public.ai_feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- QUICK RESPONSES POLICIES
-- ============================================

-- Everyone can read quick responses
CREATE POLICY "Anyone authenticated can view quick responses"
  ON public.quick_responses
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage quick responses
CREATE POLICY "Admins can manage quick responses"
  ON public.quick_responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
