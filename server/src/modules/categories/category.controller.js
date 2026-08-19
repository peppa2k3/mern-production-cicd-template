const categoryService = require('./category.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const listPublic = catchAsync(async (req, res) => {
  const categories = await categoryService.listPublic();
  return ApiResponse.success(res, categories);
});

const list = catchAsync(async (req, res) => {
  const { items, meta } = await categoryService.list(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const getBySlug = catchAsync(async (req, res) => {
  const category = await categoryService.getBySlug(req.params.slug);
  return ApiResponse.success(res, category);
});

const create = catchAsync(async (req, res) => {
  const category = await categoryService.create(req.body);
  return ApiResponse.created(res, category);
});

const update = catchAsync(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  return ApiResponse.success(res, category, 'Updated');
});

const remove = catchAsync(async (req, res) => {
  await categoryService.remove(req.params.id);
  return ApiResponse.success(res, null, 'Deleted');
});

module.exports = { listPublic, list, getBySlug, create, update, remove };
