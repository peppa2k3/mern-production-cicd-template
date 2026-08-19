const userService = require('./user.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const list = catchAsync(async (req, res) => {
  const { items, meta } = await userService.list(req.query);
  return ApiResponse.success(res, items.map((u) => u.toSafeJSON()), 'OK', 200, meta);
});

const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  return ApiResponse.success(res, user.toSafeJSON());
});

const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.body, req.user);
  return ApiResponse.created(res, user.toSafeJSON());
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body, req.user);
  return ApiResponse.success(res, user.toSafeJSON(), 'Updated');
});

const updateOwnProfile = catchAsync(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user, req.body);
  return ApiResponse.success(res, user.toSafeJSON(), 'Profile updated');
});

const remove = catchAsync(async (req, res) => {
  await userService.remove(req.params.id, req.user);
  return ApiResponse.success(res, null, 'Deleted');
});

const setActive = catchAsync(async (req, res) => {
  const user = await userService.setActive(req.params.id, req.body.isActive, req.user);
  return ApiResponse.success(res, user.toSafeJSON(), 'Status updated');
});

module.exports = { list, getById, create, update, updateOwnProfile, remove, setActive };
