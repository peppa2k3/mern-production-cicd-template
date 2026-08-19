const slugify = require('slugify');
const productRepository = require('./product.repository');
const AppError = require('../../common/errors/AppError');
const activityLogService = require('../activity-logs/activityLog.service');

class ProductService {
  buildPublicFilter(query) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.search) filter.$text = { $search: query.search };
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    return filter;
  }

  listPublic(query) {
    const filter = this.buildPublicFilter(query);
    return productRepository.paginatePublic(filter, query);
  }

  listAdmin(query) {
    const filter = this.buildPublicFilter(query);
    if (query.status) filter.status = query.status;
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.isHot !== undefined) filter.isHot = query.isHot === 'true';
    return productRepository.paginateAdmin(filter, query);
  }

  getFeatured(limit) {
    return productRepository.findFeatured(limit);
  }

  getHot(limit) {
    return productRepository.findHot(limit);
  }

  async getBySlugPublic(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product || product.status !== 'published') {
      throw AppError.notFound('Product not found');
    }
    await productRepository.incrementView(product._id);
    const related = await productRepository.findRelated(product);
    return { product, related };
  }

  async getById(id) {
    const product = await productRepository.findById(id, ['category']);
    if (!product) throw AppError.notFound('Product not found');
    return product;
  }

  async create(data, actor) {
    let slug = slugify(data.name, { lower: true, strict: true });
    const existing = await productRepository.findBySlug(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await productRepository.create({
      ...data,
      slug,
      createdBy: actor._id,
    });

    await activityLogService.log({
      user: actor._id,
      action: 'product.create',
      resource: 'Product',
      resourceId: product._id,
    });

    return product;
  }

  async update(id, data, actor) {
    const payload = { ...data };
    if (data.name) {
      payload.slug = slugify(data.name, { lower: true, strict: true });
    }
    const product = await productRepository.updateById(id, payload);
    if (!product) throw AppError.notFound('Product not found');

    await activityLogService.log({
      user: actor._id,
      action: 'product.update',
      resource: 'Product',
      resourceId: id,
    });

    return product;
  }

  async remove(id, actor) {
    const product = await productRepository.deleteById(id);
    if (!product) throw AppError.notFound('Product not found');

    await activityLogService.log({
      user: actor._id,
      action: 'product.delete',
      resource: 'Product',
      resourceId: id,
    });
  }

  async trackClick(id) {
    const product = await productRepository.incrementClick(id);
    if (!product) throw AppError.notFound('Product not found');
    return product;
  }
}

module.exports = new ProductService();
