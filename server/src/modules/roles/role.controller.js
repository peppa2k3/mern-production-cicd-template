const roleService = require('./role.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const list = catchAsync(async (req, res) => {
  const roles = await roleService.list();
  return ApiResponse.success(res, roles);
});

const listPermissions = catchAsync(async (req, res) => {
  return ApiResponse.success(res, roleService.listPermissions());
});

const create = catchAsync(async (req, res) => {
  const role = await roleService.create(req.body);
  return ApiResponse.created(res, role);
});

const update = catchAsync(async (req, res) => {
  const role = await roleService.update(req.params.id, req.body);
  return ApiResponse.success(res, role, 'Updated');
});

const remove = catchAsync(async (req, res) => {
  await roleService.remove(req.params.id);
  return ApiResponse.success(res, null, 'Deleted');
});

module.exports = { list, listPermissions, create, update, remove };
