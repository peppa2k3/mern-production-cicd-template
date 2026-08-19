const kolRepository = require('./kol.repository');
const AppError = require('../../common/errors/AppError');
const activityLogService = require('../activity-logs/activityLog.service');

class KOLService {
  listAdmin(query) {
    return kolRepository.paginate({}, query, ['user']);
  }

  listPublic(query) {
    return kolRepository.listActive(query);
  }

  async getByRoute(route) {
    const kol = await kolRepository.findByRoute(route);
    if (!kol) throw AppError.notFound('KOL page not found');

    const [pinned, all] = await Promise.all([
      kolRepository.findKolProducts(kol._id, { pinnedOnly: true }),
      kolRepository.findKolProducts(kol._id),
    ]);

    return { kol, pinnedProducts: pinned, products: all };
  }

  async getOwnProfile(userId) {
    const kol = await kolRepository.findByUser(userId);
    if (!kol) throw AppError.notFound('KOL profile not found for this account');
    return kol;
  }

  async create(data, actor) {
    const routeTaken = await kolRepository.findOne({ route: data.route });
    if (routeTaken) throw AppError.conflict('Route already taken');
    const userTaken = await kolRepository.findByUser(data.user);
    if (userTaken) throw AppError.conflict('This user already has a KOL profile');

    const kol = await kolRepository.create(data);

    await activityLogService.log({
      user: actor._id,
      action: 'kol.create',
      resource: 'KOLProfile',
      resourceId: kol._id,
    });

    return kol;
  }

  async update(id, data, actor) {
    const kol = await kolRepository.updateById(id, data);
    if (!kol) throw AppError.notFound('KOL profile not found');

    await activityLogService.log({
      user: actor._id,
      action: 'kol.update',
      resource: 'KOLProfile',
      resourceId: id,
    });

    return kol;
  }

  async remove(id, actor) {
    const kol = await kolRepository.deleteById(id);
    if (!kol) throw AppError.notFound('KOL profile not found');
    await activityLogService.log({
      user: actor._id,
      action: 'kol.delete',
      resource: 'KOLProfile',
      resourceId: id,
    });
  }

  // --- self-service product curation (KOL or Admin) ---
  async addProduct(kolId, productId) {
    return kolRepository.addProduct(kolId, productId);
  }

  async removeProduct(kolId, productId) {
    const removed = await kolRepository.removeProduct(kolId, productId);
    if (!removed) throw AppError.notFound('Product is not linked to this KOL');
  }

  async setPin(kolId, productId, isPinned) {
    const link = await kolRepository.setPin(kolId, productId, isPinned);
    if (!link) throw AppError.notFound('Product is not linked to this KOL');
    return link;
  }

  async reorder(kolId, productIds) {
    await kolRepository.reorder(kolId, productIds);
  }

  async trackKolProductClick(kolId, productId) {
    await kolRepository.incrementKolProductClick(kolId, productId);
  }

  // Ownership check used by rbac.requireOwnership - resolves the KOLProfile
  // owner's user id from the :id route param.
  async resolveOwnerUserId(kolProfileId) {
    const kol = await kolRepository.findById(kolProfileId);
    return kol?.user;
  }
}

module.exports = new KOLService();
