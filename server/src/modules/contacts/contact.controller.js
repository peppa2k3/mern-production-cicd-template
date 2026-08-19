const contactService = require('./contact.service');
const ApiResponse = require('../../common/utils/ApiResponse');
const { catchAsync } = require('../../common/middleware/errorHandler');

const submit = catchAsync(async (req, res) => {
  const contact = await contactService.submit(req.body);
  return ApiResponse.created(res, contact, 'Thank you, we will get back to you soon.');
});

const list = catchAsync(async (req, res) => {
  const { items, meta } = await contactService.list(req.query);
  return ApiResponse.success(res, items, 'OK', 200, meta);
});

const update = catchAsync(async (req, res) => {
  const contact = await contactService.update(req.params.id, req.body, req.user);
  return ApiResponse.success(res, contact, 'Updated');
});

const remove = catchAsync(async (req, res) => {
  await contactService.remove(req.params.id, req.user);
  return ApiResponse.success(res, null, 'Deleted');
});

module.exports = { submit, list, update, remove };
