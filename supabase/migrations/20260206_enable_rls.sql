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

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Prevent role escalation
  );

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
  );

-- ============================================
-- TICKETS TABLE POLICIES
-- ============================================

-- Students can view their own tickets
CREATE POLICY "Students can view own tickets"
  ON public.tickets
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can create tickets
CREATE POLICY "Students can create tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Students can update their own tickets (limited fields)
CREATE POLICY "Students can update own tickets"
  ON public.tickets
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can do everything with tickets
CREATE POLICY "Admins can manage all tickets"
  ON public.tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages from tickets they have access to
CREATE POLICY "Users can view messages from their tickets"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = messages.ticket_id
      AND (
        tickets.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Users can create messages on their tickets
CREATE POLICY "Users can create messages on their tickets"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = messages.ticket_id
      AND (
        tickets.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Admins can delete messages
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
  );

-- ============================================
-- AI FEEDBACK POLICIES
-- ============================================

-- Users can view feedback from their tickets
CREATE POLICY "Users can view ai feedback from their tickets"
  ON public.ai_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.tickets t ON t.id = m.ticket_id
      WHERE m.id = ai_feedback.message_id
      AND (
        t.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Users can create feedback on their tickets
CREATE POLICY "Users can create ai feedback on their tickets"
  ON public.ai_feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.tickets t ON t.id = m.ticket_id
      WHERE m.id = ai_feedback.message_id
      AND (
        t.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
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
  );
