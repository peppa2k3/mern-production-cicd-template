const productService = require('./product.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const listPublic = catchAsync(async (req, res) => {
  const { items, meta } = await productService.listPublic(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const listAdmin = catchAsync(async (req, res) => {
  const { items, meta } = await productService.listAdmin(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const featured = catchAsync(async (req, res) => {
  const items = await productService.getFeatured(Number(req.query.limit) || 8);
  return ApiResponse.success(res, items);
});

const hot = catchAsync(async (req, res) => {
  const items = await productService.getHot(Number(req.query.limit) || 8);
  return ApiResponse.success(res, items);
});

const getBySlug = catchAsync(async (req, res) => {
  const { product, related } = await productService.getBySlugPublic(req.params.slug);
  return ApiResponse.success(res, { product, related });
});

const getById = catchAsync(async (req, res) => {
  const product = await productService.getById(req.params.id);
  return ApiResponse.success(res, product);
});

const create = catchAsync(async (req, res) => {
  const product = await productService.create(req.body, req.user);
  return ApiResponse.created(res, product);
});

const update = catchAsync(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.user);
  return ApiResponse.success(res, product, 'Updated');
});

const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id, req.user);
  return ApiResponse.success(res, null, 'Deleted');
});

const trackClick = catchAsync(async (req, res) => {
  await productService.trackClick(req.params.id);
  return ApiResponse.success(res, null, 'Click tracked');
});

module.exports = {
  listPublic,
  listAdmin,
  featured,
  hot,
  getBySlug,
  getById,
  create,
  update,
  remove,
  trackClick,
};
