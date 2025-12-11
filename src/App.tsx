import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/dashboard/Dashboard';
import { TicketListPage } from './pages/tickets/TicketList';
import { NewTicketPage } from './pages/tickets/NewTicket';
import { TicketDetailPage } from './pages/tickets/TicketDetail';
import { KnowledgeBasePage } from './pages/admin/KnowledgeBase';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Authentication */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/new" element={<NewTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />

          {/* Admin Routes */}
          <Route path="admin/knowledge" element={<KnowledgeBasePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
