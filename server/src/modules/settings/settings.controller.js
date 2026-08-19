const settingsService = require('./settings.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const getPublic = catchAsync(async (req, res) => {
  const settings = await settingsService.getAll();
  return ApiResponse.success(res, settings);
});

const update = catchAsync(async (req, res) => {
  const settings = await settingsService.setMany(req.body);
  return ApiResponse.success(res, settings, 'Settings updated');
});

module.exports = { getPublic, update };
