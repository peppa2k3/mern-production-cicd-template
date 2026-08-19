import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageSpinner } from '@/components/ui/Spinner';

export default function ProtectedRoute() {
  const { user, isAuthLoaded } = useAuthStore();
  const location = useLocation();

  if (!isAuthLoaded) return <PageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
