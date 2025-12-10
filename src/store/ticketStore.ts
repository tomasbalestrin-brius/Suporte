import { create } from 'zustand';
import type { Ticket, TicketStats } from '@/types';
import { ticketService } from '@/services/ticket.service';

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  stats: TicketStats | null;
  loading: boolean;
  fetchTickets: (userId?: string) => Promise<void>;
  fetchTicketById: (ticketId: string) => Promise<void>;
  createTicket: (ticket: any) => Promise<Ticket>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  fetchStats: (userId?: string) => Promise<void>;
  setCurrentTicket: (ticket: Ticket | null) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  currentTicket: null,
  stats: null,
  loading: false,

  fetchTickets: async (userId?) => {
    set({ loading: true });
    try {
      const tickets = await ticketService.getTickets(userId);
      set({ tickets, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchTicketById: async (ticketId) => {
    set({ loading: true });
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      set({ currentTicket: ticket, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createTicket: async (ticket) => {
    set({ loading: true });
    try {
      const newTicket = await ticketService.createTicket(ticket);
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        loading: false,
      }));
      return newTicket;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateTicket: async (ticketId, updates) => {
    set({ loading: true });
    try {
      const updatedTicket = await ticketService.updateTicket(ticketId, updates);
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? updatedTicket : t
        ),
        currentTicket:
          state.currentTicket?.id === ticketId
            ? updatedTicket
            : state.currentTicket,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteTicket: async (ticketId) => {
    set({ loading: true });
    try {
      await ticketService.deleteTicket(ticketId);
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== ticketId),
        currentTicket:
          state.currentTicket?.id === ticketId ? null : state.currentTicket,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchStats: async (userId?) => {
    try {
      const stats = await ticketService.getTicketStats(userId);
      set({ stats });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
}));
