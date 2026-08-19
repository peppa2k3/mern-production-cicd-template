const BaseRepository = require('../../common/utils/BaseRepository');
const KOLProfile = require('./kolProfile.model');
const KOLProduct = require('./kolProduct.model');

class KOLRepository extends BaseRepository {
  constructor() {
    super(KOLProfile);
  }

  findByRoute(route) {
    return this.model.findOne({ route, isActive: true }).populate('user', 'name email');
  }

  findByUser(userId) {
    return this.model.findOne({ user: userId });
  }

  listActive(query) {
    return this.paginate({ isActive: true }, query, ['user']);
  }

  // --- KOLProduct (join table) helpers ---
  addProduct(kolId, productId) {
    return KOLProduct.findOneAndUpdate(
      { kol: kolId, product: productId },
      { kol: kolId, product: productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  removeProduct(kolId, productId) {
    return KOLProduct.findOneAndDelete({ kol: kolId, product: productId });
  }

  setPin(kolId, productId, isPinned) {
    return KOLProduct.findOneAndUpdate({ kol: kolId, product: productId }, { isPinned }, { new: true });
  }

  reorder(kolId, orderedProductIds) {
    const ops = orderedProductIds.map((productId, index) => ({
      updateOne: {
        filter: { kol: kolId, product: productId },
        update: { order: index },
      },
    }));
    return KOLProduct.bulkWrite(ops);
  }

  findKolProducts(kolId, { pinnedOnly = false } = {}) {
    const filter = { kol: kolId };
    if (pinnedOnly) filter.isPinned = true;
    return KOLProduct.find(filter)
      .sort({ isPinned: -1, order: 1, createdAt: -1 })
      .populate({ path: 'product', populate: 'category' });
  }

  findKolProductLink(kolId, productId) {
    return KOLProduct.findOne({ kol: kolId, product: productId });
  }

  incrementKolProductClick(kolId, productId) {
    return KOLProduct.findOneAndUpdate({ kol: kolId, product: productId }, { $inc: { clickCount: 1 } });
  }
}

module.exports = new KOLRepository();
