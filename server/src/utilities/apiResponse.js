class ApiResponse {
  constructor(statusCode, data = null, message = 'Success', meta = undefined) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static send(res, statusCode, data, message, meta) {
    const payload = new ApiResponse(statusCode, data, message, meta);
    return res.status(statusCode).json(payload);
  }

  static ok(res, data, message = 'Success', meta) {
    return ApiResponse.send(res, 200, data, message, meta);
  }

  static created(res, data, message = 'Created successfully') {
    return ApiResponse.send(res, 201, data, message);
  }
}

module.exports = ApiResponse;
