const { parsePagination, buildMeta } = require('./pagination');

// Generic repository wrapping a Mongoose model. Feature repositories extend
// this to inherit standard CRUD + pagination, and add domain-specific query
// methods on top (see modules/products/product.repository.js for example).
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  findById(id, populate = []) {
    let q = this.model.findById(id);
    populate.forEach((p) => (q = q.populate(p)));
    return q;
  }

  findOne(filter, populate = []) {
    let q = this.model.findOne(filter);
    populate.forEach((p) => (q = q.populate(p)));
    return q;
  }

  async paginate(filter = {}, query = {}, populate = []) {
    const { page, limit, skip, sort } = parsePagination(query);

    let q = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    populate.forEach((p) => (q = q.populate(p)));

    const [items, total] = await Promise.all([
      q.exec(),
      this.model.countDocuments(filter),
    ]);

    return { items, meta: buildMeta({ page, limit, total }) };
  }

  updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
