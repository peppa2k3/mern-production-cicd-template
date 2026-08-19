const BaseRepository = require('../../common/utils/BaseRepository');
const Product = require('./product.model');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  findBySlug(slug) {
    return this.model.findOne({ slug }).populate('category');
  }

  paginatePublic(filter, query) {
    return this.paginate({ ...filter, status: 'published' }, query, ['category']);
  }

  paginateAdmin(filter, query) {
    return this.paginate(filter, query, ['category', 'createdBy']);
  }

  findFeatured(limit = 8) {
    return this.model
      .find({ status: 'published', isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category');
  }

  findHot(limit = 8) {
    return this.model
      .find({ status: 'published', isHot: true })
      .sort({ clickCount: -1 })
      .limit(limit)
      .populate('category');
  }

  findRelated(product, limit = 4) {
    return this.model
      .find({
        _id: { $ne: product._id },
        category: product.category,
        status: 'published',
      })
      .limit(limit)
      .populate('category');
  }

  incrementView(id) {
    return this.model.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  incrementClick(id) {
    return this.model.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
  }
}

module.exports = new ProductRepository();
