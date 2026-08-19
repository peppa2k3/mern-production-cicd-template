const BaseRepository = require('../../common/utils/BaseRepository');
const Category = require('./category.model');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  findBySlug(slug) {
    return this.model.findOne({ slug });
  }

  findActiveTree() {
    return this.model.find({ isActive: true }).sort({ order: 1, name: 1 });
  }
}

module.exports = new CategoryRepository();
