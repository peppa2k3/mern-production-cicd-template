// Small helper to keep response shape consistent across every controller.
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = undefined) {
    return res.status(statusCode).json({ success: true, message, data, meta });
  }

  static created(res, data, message = 'Created') {
    return ApiResponse.success(res, data, message, 201);
  }
}

module.exports = ApiResponse;
