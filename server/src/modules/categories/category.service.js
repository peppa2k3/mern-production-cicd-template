const slugify = require('slugify');
const categoryRepository = require('./category.repository');
const AppError = require('../../common/errors/AppError');

class CategoryService {
  listPublic() {
    return categoryRepository.findActiveTree();
  }

  list(query) {
    return categoryRepository.paginate({}, { ...query, limit: query.limit || 100 });
  }

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw AppError.notFound('Category not found');
    return category;
  }

  async create(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) throw AppError.conflict('A category with this name already exists');
    return categoryRepository.create({ ...data, slug, parent: data.parent || null });
  }

  async update(id, data) {
    const payload = { ...data };
    if (data.name) payload.slug = slugify(data.name, { lower: true, strict: true });
    const category = await categoryRepository.updateById(id, payload);
    if (!category) throw AppError.notFound('Category not found');
    return category;
  }

  async remove(id) {
    const category = await categoryRepository.deleteById(id);
    if (!category) throw AppError.notFound('Category not found');
  }
}

module.exports = new CategoryService();
