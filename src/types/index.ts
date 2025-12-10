export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  avatar_url?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: User;
}

export interface Message {
  id: string;
  ticket_id: string;
  user_id?: string;
  content: string;
  is_ai: boolean;
  created_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}
