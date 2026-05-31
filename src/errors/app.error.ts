export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly errors: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
