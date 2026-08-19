import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PermissionRoute from '@/routes/PermissionRoute';
import { PageSpinner } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/lib/permissions';

// Public pages load eagerly (first paint matters most here).
import HomePage from '@/pages/public/HomePage';
import ProductListPage from '@/pages/public/ProductListPage';
import ProductDetailPage from '@/pages/public/ProductDetailPage';
import KOLListPage from '@/pages/public/KOLListPage';
import KOLPage from '@/pages/public/KOLPage';
import ContactPage from '@/pages/public/ContactPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

// Admin pages are code-split; nobody but logged-in staff pays for this bundle.
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const KolManagePage = lazy(() => import('@/pages/admin/KolManagePage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const RolesPage = lazy(() => import('@/pages/admin/RolesPage'));
const NotificationsPage = lazy(() => import('@/pages/admin/NotificationsPage'));
const ContactsAdminPage = lazy(() => import('@/pages/admin/ContactsAdminPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/admin/ProfilePage'));
const KolPortalPage = lazy(() => import('@/pages/admin/KolPortalPage'));

const withSuspense = (el) => <Suspense fallback={<PageSpinner />}>{el}</Suspense>;

export default function App() {
  return (
    <Routes>
      {/* --- Public site --- */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="san-pham" element={<ProductListPage />} />
        <Route path="san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="kol" element={<KOLListPage />} />
        <Route path="kol/:route" element={<KOLPage />} />
        <Route path="kol/:route/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="lien-he" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="dang-ky-cong-tac-vien" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* --- Admin & KOL self-service portal (protected) --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="admin"
            element={<PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW} />}
          >
            <Route index element={withSuspense(<DashboardPage />)} />
          </Route>

          <Route
            path="admin/san-pham"
            element={<PermissionRoute permission={PERMISSIONS.PRODUCT_READ} />}
          >
            <Route index element={withSuspense(<ProductsPage />)} />
          </Route>

          <Route
            path="admin/danh-muc"
            element={<PermissionRoute permission={PERMISSIONS.CATEGORY_MANAGE} />}
          >
            <Route index element={withSuspense(<CategoriesPage />)} />
          </Route>

          <Route path="admin/kol" element={<PermissionRoute permission={PERMISSIONS.KOL_MANAGE} />}>
            <Route index element={withSuspense(<KolManagePage />)} />
          </Route>

          <Route
            path="admin/nguoi-dung"
            element={<PermissionRoute permission={PERMISSIONS.USER_MANAGE} />}
          >
            <Route index element={withSuspense(<UsersPage />)} />
          </Route>

          <Route path="admin/vai-tro" element={<PermissionRoute permission={PERMISSIONS.ROLE_MANAGE} />}>
            <Route index element={withSuspense(<RolesPage />)} />
          </Route>

          <Route
            path="admin/thong-bao"
            element={<PermissionRoute permission={PERMISSIONS.NOTIFICATION_SEND} />}
          >
            <Route index element={withSuspense(<NotificationsPage />)} />
          </Route>

          <Route
            path="admin/lien-he"
            element={<PermissionRoute permission={PERMISSIONS.CONTACT_MANAGE} />}
          >
            <Route index element={withSuspense(<ContactsAdminPage />)} />
          </Route>

          <Route
            path="admin/cai-dat"
            element={<PermissionRoute permission={PERMISSIONS.SETTINGS_MANAGE} />}
          >
            <Route index element={withSuspense(<SettingsPage />)} />
          </Route>

          <Route path="admin/ho-so" element={withSuspense(<ProfilePage />)} />

          <Route
            path="kol-portal"
            element={<PermissionRoute permission={PERMISSIONS.KOL_MANAGE_OWN} />}
          >
            <Route index element={withSuspense(<KolPortalPage />)} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
