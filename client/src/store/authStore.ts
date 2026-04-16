import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const TOKEN_KEY = 'gpkarta_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
