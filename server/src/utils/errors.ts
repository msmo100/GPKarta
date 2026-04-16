export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }
}
