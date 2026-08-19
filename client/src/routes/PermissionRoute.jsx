import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';

// Wrap a set of nested <Route> elements with a required permission.
// Renders a 403-style redirect to the admin dashboard when missing.
export default function PermissionRoute({ permission }) {
  const user = useAuthStore((s) => s.user);
  if (!can(user, permission)) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
