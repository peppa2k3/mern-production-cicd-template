// Role names are fixed system roles. Additional custom roles can be created
// via the Roles module, but these four are seeded by default and drive the
// core RBAC checks used throughout the app.
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  KOL: 'kol',
  STAFF: 'staff',
};

// Permission keys follow "resource:action" convention so new modules can
// register new permissions without touching existing ones.
const PERMISSIONS = {
  // Products
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Categories
  CATEGORY_MANAGE: 'category:manage',

  // KOL
  KOL_MANAGE: 'kol:manage', // admin managing any KOL
  KOL_MANAGE_OWN: 'kol:manage_own', // KOL managing their own page

  // Users
  USER_MANAGE: 'user:manage',

  // Roles/Permissions
  ROLE_MANAGE: 'role:manage',

  // Notifications
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_READ_OWN: 'notification:read_own',

  // Contacts
  CONTACT_MANAGE: 'contact:manage',

  // Settings
  SETTINGS_MANAGE: 'settings:manage',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
};

// Default permission sets per system role. Stored in DB at seed time so
// admins can customize permissions per role afterwards without redeploying.
const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.KOL_MANAGE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.NOTIFICATION_SEND,
    PERMISSIONS.NOTIFICATION_READ_OWN,
    PERMISSIONS.CONTACT_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  [ROLES.KOL]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.KOL_MANAGE_OWN,
    PERMISSIONS.NOTIFICATION_READ_OWN,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.NOTIFICATION_READ_OWN,
    PERMISSIONS.CONTACT_MANAGE,
  ],
};

module.exports = { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS };
