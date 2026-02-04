import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Public Pages - Keep these eager loaded for faster initial load
import { WelcomePage } from './pages/public/Welcome';
import { LoginPage } from './pages/auth/Login';

// Lazy load all other pages for better performance
const NewTicketPage = lazy(() => import('./pages/tickets/NewTicket'));
const TicketSuccessPage = lazy(() => import('./pages/tickets/TicketSuccess'));
const DashboardPage = lazy(() => import('./pages/dashboard/Dashboard'));
const TicketListPage = lazy(() => import('./pages/tickets/TicketList'));
const TicketDetailPage = lazy(() => import('./pages/tickets/TicketDetail'));
const KnowledgeBasePage = lazy(() => import('./pages/admin/KnowledgeBase'));
const WebhooksPage = lazy(() => import('./pages/admin/Webhooks'));
const QuickRepliesPage = lazy(() => import('./pages/admin/QuickReplies'));
const AIFeedbackPage = lazy(() => import('./pages/admin/AIFeedback'));
const UsersPage = lazy(() => import('./pages/admin/Users'));
const EmailIntegrationPage = lazy(() => import('./pages/admin/EmailIntegration'));
const InstagramIntegrationPage = lazy(() => import('./pages/admin/InstagramIntegration'));
const GmailCallbackPage = lazy(() => import('./pages/auth/GmailCallback'));

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route index element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:ticketId/success" element={<TicketSuccessPage />} />
          <Route path="/auth/gmail/callback" element={<GmailCallbackPage />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketListPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="admin/knowledge" element={<KnowledgeBasePage />} />
            <Route path="admin/webhooks" element={<WebhooksPage />} />
            <Route path="admin/quick-replies" element={<QuickRepliesPage />} />
            <Route path="admin/ai-feedback" element={<AIFeedbackPage />} />
            <Route path="admin/users" element={<UsersPage />} />
            <Route path="admin/email-integration" element={<EmailIntegrationPage />} />
            <Route path="admin/instagram-integration" element={<InstagramIntegrationPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
