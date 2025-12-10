import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { DashboardPage } from './pages/dashboard/Dashboard';
import { TicketListPage } from './pages/tickets/TicketList';
import { NewTicketPage } from './pages/tickets/NewTicket';
import { TicketDetailPage } from './pages/tickets/TicketDetail';
import { AllTicketsPage } from './pages/admin/AllTickets';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/new" element={<NewTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />

          {/* Admin Routes */}
          <Route path="admin/tickets" element={<AllTicketsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
