import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  initialized: boolean;
  currentMode: 'owner' | 'sitter';
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
  setMode: (mode: 'owner' | 'sitter') => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  currentMode: 'owner',
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized }),
  setMode: (currentMode) => set({ currentMode }),
}));
