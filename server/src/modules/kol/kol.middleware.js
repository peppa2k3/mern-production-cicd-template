const AppError = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const kolService = require('./kol.service');

// KOL/staff can only manage their own KOL page's products; Admin/Super Admin
// can manage any. Async because it needs to look up the KOLProfile owner.
const requireKolOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    const privileged = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
    if (privileged.includes(user.role?.name)) return next();

    const ownerUserId = await kolService.resolveOwnerUserId(req.params.id);
    if (!ownerUserId || String(ownerUserId) !== String(user._id)) {
      return next(AppError.forbidden('You can only manage your own KOL page'));
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireKolOwnership };
