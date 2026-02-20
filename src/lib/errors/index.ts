export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // Database
  DATABASE_ERROR = "DATABASE_ERROR",
  QUERY_FAILED = "QUERY_FAILED",

  // External Services
  EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED",
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",

  // General
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "AppError"
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(ErrorCode.UNAUTHORIZED, message, 401)
    this.name = "AuthenticationError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(ErrorCode.FORBIDDEN, message, 403)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404)
    this.name = "NotFoundError"
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: Record<string, unknown>) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details)
    this.name = "DatabaseError"
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(ErrorCode.EXTERNAL_SERVICE_ERROR, message || `${service} service error`, 503)
    this.name = "ExternalServiceError"
  }
}
