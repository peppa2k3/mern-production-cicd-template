import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api';

export default function AuthProvider({ children }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    authApi
      .refresh()
      .then(({ data }) => setSession({ user: data.user, accessToken: data.accessToken }))
      .catch(() => clearSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
