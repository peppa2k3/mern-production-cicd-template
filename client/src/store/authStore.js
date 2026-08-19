import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Access token lives only in memory (never persisted) for XSS safety; the
// refresh token is an httpOnly cookie the browser handles automatically.
// Only `user` is persisted so a page refresh can show a logged-out flash
// briefly instead of a wrong cached role, while /auth/refresh re-hydrates
// the real access token on app boot (see AuthProvider).
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthLoaded: false,

      setSession: ({ user, accessToken }) => set({ user, accessToken, isAuthLoaded: true }),
      setAuthLoaded: () => set({ isAuthLoaded: true }),
      clearSession: () => set({ user: null, accessToken: null, isAuthLoaded: true }),
    }),
    {
      name: 'affiliate-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  KOL: 'kol',
  STAFF: 'staff',
};

export const hasRole = (user, ...roles) => !!user && roles.includes(user.role?.name);
