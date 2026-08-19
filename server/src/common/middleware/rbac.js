const AppError = require('../errors/AppError');
const { ROLES } = require('../constants/roles');

// requirePermissions('product:create') - user must have ALL listed
// permissions on their role. Super Admin always passes.
const requirePermissions = (...permissions) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return next(AppError.unauthorized());

    if (user.role?.name === ROLES.SUPER_ADMIN) return next();

    const userPermissions = new Set(user.role?.permissions || []);
    const hasAll = permissions.every((p) => userPermissions.has(p));

    if (!hasAll) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// requireRoles('admin', 'super_admin') - user's role name must be one of
// the listed roles.
const requireRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return next(AppError.unauthorized());
    if (!roles.includes(user.role?.name)) {
      return next(AppError.forbidden('Insufficient role'));
    }
    next();
  };
};

// Ensures a KOL/staff user can only mutate their own resources. Pass a
// function that extracts the owner id from req (e.g. from params or the
// loaded document set on req by a previous middleware).
const requireOwnership = (getOwnerId) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return next(AppError.unauthorized());

    const privilegedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
    if (privilegedRoles.includes(user.role?.name)) return next();

    const ownerId = getOwnerId(req);
    if (!ownerId || String(ownerId) !== String(user._id)) {
      return next(AppError.forbidden('You can only manage your own resources'));
    }
    next();
  };
};

module.exports = { requirePermissions, requireRoles, requireOwnership };
