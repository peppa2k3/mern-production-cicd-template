const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const summary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary();
  return ApiResponse.success(res, data);
});

module.exports = { summary };
