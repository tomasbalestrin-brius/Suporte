import { create } from 'zustand';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      await authService.signUp(email, password, name);
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  initialize: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user, initialized: true });

      // Listen to auth changes
      authService.onAuthStateChange((user) => {
        set({ user });
      });
    } catch (error) {
      set({ initialized: true });
    }
  },
}));
