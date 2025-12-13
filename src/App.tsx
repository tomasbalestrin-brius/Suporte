import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Public Pages
import { WelcomePage } from './pages/public/Welcome';
import { LoginPage } from './pages/auth/Login';
import { NewTicketPage } from './pages/tickets/NewTicket';
import { TicketSuccessPage } from './pages/tickets/TicketSuccess';

// Protected Pages
import { DashboardPage } from './pages/dashboard/Dashboard';
import { TicketListPage } from './pages/tickets/TicketList';
import { TicketDetailPage } from './pages/tickets/TicketDetail';
import { KnowledgeBasePage } from './pages/admin/KnowledgeBase';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route index element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tickets/new" element={<NewTicketPage />} />
        <Route path="/tickets/:ticketId/success" element={<TicketSuccessPage />} />

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
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
