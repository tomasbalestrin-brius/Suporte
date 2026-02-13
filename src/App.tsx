import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { Loader2 } from 'lucide-react';
import { Toaster } from './components/ui/toaster';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Public Pages - Keep these eager loaded for faster initial load
import { WelcomePage } from './pages/public/Welcome';
import { LoginPage } from './pages/auth/Login';
import { NotFoundPage } from './pages/NotFound';

// Lazy load all other pages for better performance
const NewTicketPage = lazy(() => import('./pages/tickets/NewTicket'));
const TicketSuccessPage = lazy(() => import('./pages/tickets/TicketSuccess'));
const TicketChatPage = lazy(() => import('./pages/tickets/TicketChat'));
const DashboardPage = lazy(() => import('./pages/dashboard/Dashboard'));
const TicketListPage = lazy(() => import('./pages/tickets/TicketList'));
const TicketDetailPage = lazy(() => import('./pages/tickets/TicketDetail'));
const KnowledgeBasePage = lazy(() => import('./pages/admin/KnowledgeBase'));
const WebhooksPage = lazy(() => import('./pages/admin/Webhooks'));
const ErrorLogPage = lazy(() => import('./pages/admin/ErrorLog'));
const UsersPage = lazy(() => import('./pages/admin/Users'));

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Public Routes */}
          <Route index element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:ticketId/success" element={<TicketSuccessPage />} />
          <Route path="/tickets/:ticketId/chat" element={<TicketChatPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketListPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />

            {/* Admin Only Routes */}
            <Route path="admin/knowledge" element={<AdminRoute><KnowledgeBasePage /></AdminRoute>} />
            <Route path="admin/webhooks" element={<AdminRoute><WebhooksPage /></AdminRoute>} />
            <Route path="admin/error-log" element={<AdminRoute><ErrorLogPage /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
