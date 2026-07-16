import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer' | string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;

  /** Derived: true when both user and token are set */
  isAuthenticated: boolean;

  /** Set auth data after login / token refresh */
  setAuth: (user: AuthUser, token: string) => void;

  /** Clear auth data on logout */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Also mirror token to localStorage so the axios interceptor can pick it up
        if (typeof window !== 'undefined') {
          localStorage.setItem('sl_token', token);
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sl_token');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'sl-auth',
      // Only persist what's needed; avoid persisting sensitive data longer than necessary
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
