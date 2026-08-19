// Mirrors backend/src/common/constants/roles.js PERMISSIONS keys so the
// frontend can conditionally render nav items/buttons. The backend is the
// actual source of truth/enforcement; this only controls UI visibility.
export const PERMISSIONS = {
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  CATEGORY_MANAGE: 'category:manage',
  KOL_MANAGE: 'kol:manage',
  KOL_MANAGE_OWN: 'kol:manage_own',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_READ_OWN: 'notification:read_own',
  CONTACT_MANAGE: 'contact:manage',
  SETTINGS_MANAGE: 'settings:manage',
  DASHBOARD_VIEW: 'dashboard:view',
};

export function can(user, permission) {
  if (!user) return false;
  if (user.role?.name === 'super_admin') return true;
  return (user.role?.permissions || []).includes(permission);
}
