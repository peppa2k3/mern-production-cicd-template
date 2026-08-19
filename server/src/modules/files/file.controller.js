const fileService = require('./file.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');
const AppError = require('../../common/errors/AppError');

const uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');
  const record = await fileService.registerUpload(req.file, req.user._id);
  return ApiResponse.created(res, record, 'File uploaded');
});

const uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) throw AppError.badRequest('No files uploaded');
  const records = await fileService.registerMany(req.files, req.user._id);
  return ApiResponse.created(res, records, 'Files uploaded');
});

module.exports = { uploadSingle, uploadMultiple };
