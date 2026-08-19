const kolService = require('./kol.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const listPublic = catchAsync(async (req, res) => {
  const { items, meta } = await kolService.listPublic(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const getByRoute = catchAsync(async (req, res) => {
  const data = await kolService.getByRoute(req.params.route);
  return ApiResponse.success(res, data);
});

const listAdmin = catchAsync(async (req, res) => {
  const { items, meta } = await kolService.listAdmin(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const getOwnProfile = catchAsync(async (req, res) => {
  const kol = await kolService.getOwnProfile(req.user._id);
  return ApiResponse.success(res, kol);
});

const create = catchAsync(async (req, res) => {
  const kol = await kolService.create(req.body, req.user);
  return ApiResponse.created(res, kol);
});

const update = catchAsync(async (req, res) => {
  const kol = await kolService.update(req.params.id, req.body, req.user);
  return ApiResponse.success(res, kol, 'Updated');
});

const remove = catchAsync(async (req, res) => {
  await kolService.remove(req.params.id, req.user);
  return ApiResponse.success(res, null, 'Deleted');
});

const addProduct = catchAsync(async (req, res) => {
  const link = await kolService.addProduct(req.params.id, req.body.productId);
  return ApiResponse.created(res, link, 'Product added to KOL page');
});

const removeProduct = catchAsync(async (req, res) => {
  await kolService.removeProduct(req.params.id, req.params.productId);
  return ApiResponse.success(res, null, 'Product removed from KOL page');
});

const setPin = catchAsync(async (req, res) => {
  const link = await kolService.setPin(req.params.id, req.params.productId, req.body.isPinned);
  return ApiResponse.success(res, link, 'Pin status updated');
});

const reorder = catchAsync(async (req, res) => {
  await kolService.reorder(req.params.id, req.body.productIds);
  return ApiResponse.success(res, null, 'Order updated');
});

const trackClick = catchAsync(async (req, res) => {
  await kolService.trackKolProductClick(req.params.id, req.params.productId);
  return ApiResponse.success(res, null, 'Click tracked');
});

module.exports = {
  listPublic,
  getByRoute,
  listAdmin,
  getOwnProfile,
  create,
  update,
  remove,
  addProduct,
  removeProduct,
  setPin,
  reorder,
  trackClick,
};
