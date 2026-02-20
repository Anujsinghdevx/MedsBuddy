/**
 * Custom Error Classes and Error Codes
 * 
 * Provides standardized error handling with typed error codes and HTTP status codes.
 * All errors extend the base AppError class for consistent error handling across the API.
 * 
 * @module errors
 * @see https://www.rfc-editor.org/rfc/rfc7807.html - Problem Details for HTTP APIs
 * @see https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#7102-error-condition-responses
 */

/**
 * Standardized error codes used throughout the application
 * 
 * These codes provide a machine-readable way to identify error types.
 * Frontend can use these codes to show appropriate user messages or take specific actions.
 * 
 * Pattern: Category_Specific_Error
 * 
 * @enum {string}
 */
export enum ErrorCode {
  // ==================== Authentication & Authorization ====================
  // These errors indicate the user needs to log in or lacks permissions
  
  /** User is not authenticated - requires login */
  UNAUTHORIZED = "UNAUTHORIZED",
  
  /** User is authenticated but lacks required permissions */
  FORBIDDEN = "FORBIDDEN",
  
  /** JWT or session token is invalid or malformed */
  INVALID_TOKEN = "INVALID_TOKEN",
  
  /** User's session has expired - requires re-authentication */
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // ==================== Validation Errors ====================
  // These errors indicate problems with user input
  
  /** One or more input fields failed validation */
  VALIDATION_ERROR = "VALIDATION_ERROR",
  
  /** Request payload is malformed or incorrect type */
  INVALID_INPUT = "INVALID_INPUT",
  
  /** A required field is missing from the request */
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // ==================== Resource Errors ====================
  // These errors relate to resource existence and conflicts
  
  /** Requested resource was not found */
  NOT_FOUND = "NOT_FOUND",
  
  /** Resource already exists (duplicate creation attempt) */
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // ==================== Database Errors ====================
  // These errors indicate database-level failures
  
  /** Generic database operation failure */
  DATABASE_ERROR = "DATABASE_ERROR",
  
  /** Specific database query failed to execute */
  QUERY_FAILED = "QUERY_FAILED",

  // ==================== External Service Errors ====================
  // These errors occur when third-party services fail
  
  /** Email service (SendGrid) failed to send email */
  EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED",
  
  /** File storage service (Supabase Storage) failed to upload */
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  
  /** Generic third-party API failure */
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",

  // ==================== General Errors ====================
  // Catch-all errors and rate limiting
  
  /** Unexpected server error - check logs for details */
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  
  /** Request is malformed (different from validation) */
  BAD_REQUEST = "BAD_REQUEST",
  
  /** Client has exceeded rate limit - try again later */
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

/**
 * Base application error class
 * 
 * All custom errors should extend this class. It provides:
 * - Typed error codes for programmatic handling
 * - HTTP status codes for API responses
 * - Optional details object for debugging
 * - JSON serialization for API responses
 * 
 * @extends Error
 * 
 * @example Basic usage
 * ```typescript
 * throw new AppError(
 *   ErrorCode.DATABASE_ERROR,
 *   "Failed to connect to database",
 *   500
 * )
 * ```
 * 
 * @example With details for debugging
 * ```typescript
 * throw new AppError(
 *   ErrorCode.DATABASE_ERROR,
 *   "Failed to connect to database",
 *   500,
 *   { host: "localhost", port: 5432, timeout: true }
 * )
 * ```
 */
export class AppError extends Error {
  /**
   * Creates a new AppError instance
   * 
   * @param code - Machine-readable error code from ErrorCode enum
   * @param message - Human-readable error message for logging/display
   * @param statusCode - HTTP status code to return (default: 500)
   * @param details - Optional debugging details (not shown to end users in production)
   */
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    // Call parent Error constructor
    super(message)
    
    // Set error name for stack traces
    this.name = "AppError"
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    // This is necessary when extending Error in TypeScript
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Converts error to JSON for API responses
   * 
   * This method is automatically called by JSON.stringify()
   * Ensures consistent error response format across all API endpoints
   * 
   * @returns Structured error object matching API response schema
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        // Only include details if they exist (conditional spread)
        ...(this.details && { details: this.details }),
      },
    }
  }
}

/**
 * Validation error (HTTP 400 Bad Request)
 * 
 * Thrown when user input fails validation rules.
 * Details object should contain field-specific validation errors for frontend to display.
 * 
 * @extends AppError
 * 
 * @example Single field validation
 * ```typescript
 * throw new ValidationError("Invalid email format", {
 *   field: "email",
 *   value: "invalid-email",
 *   expected: "valid@example.com"
 * })
 * ```
 * 
 * @example Multiple field validation (Zod style)
 * ```typescript
 * throw new ValidationError("Validation failed", {
 *   errors: [
 *     { path: "email", message: "Invalid email" },
 *     { path: "age", message: "Must be >= 18" }
 *   ]
 * })
 * ```
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
    this.name = "ValidationError"
  }
}

/**
 * Authentication error (HTTP 401 Unauthorized)
 * 
 * Thrown when user is not authenticated or session is invalid.
 * Frontend should redirect to login page or show login modal.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new AuthenticationError("Please log in to continue")
 * ```
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(ErrorCode.UNAUTHORIZED, message, 401)
    this.name = "AuthenticationError"
  }
}

/**
 * Authorization error (HTTP 403 Forbidden)
 * 
 * Thrown when authenticated user lacks required permissions.
 * Different from AuthenticationError:
 * - 401: User needs to log in (who are you?)
 * - 403: User is logged in but can't access this (you can't do that!)
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new ForbiddenError("Only admins can delete medications")
 * ```
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(ErrorCode.FORBIDDEN, message, 403)
    this.name = "ForbiddenError"
  }
}

/**
 * Resource not found error (HTTP 404 Not Found)
 * 
 * Thrown when requested resource doesn't exist in the database.
 * Resource name is automatically included in the error message.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * const medication = await findMedication(id)
 * if (!medication) {
 *   throw new NotFoundError("Medication")
 *   // Results in message: "Medication not found"
 * }
 * ```
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404)
    this.name = "NotFoundError"
  }
}

/**
 * Database operation error (HTTP 500 Internal Server Error)
 * 
 * Thrown when database queries fail.
 * Details should include database error codes and context for debugging.
 * 
 * Common causes:
 * - Connection failures
 * - Constraint violations
 * - Query timeouts
 * - Invalid SQL
 * 
 * @extends AppError
 * 
 * @example Unique constraint violation
 * ```typescript
 * throw new DatabaseError("Failed to insert record", {
 *   code: "23505",  // PostgreSQL unique violation
 *   constraint: "medications_user_id_name_unique",
 *   table: "medications"
 * })
 * ```
 * 
 * @example Connection failure
 * ```typescript
 * throw new DatabaseError("Database connection failed", {
 *   host: "db.example.com",
 *   timeout: 5000
 * })
 * ```
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: Record<string, unknown>) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details)
    this.name = "DatabaseError"
  }
}

/**
 * External service error (HTTP 503 Service Unavailable)
 * 
 * Thrown when third-party APIs fail (email, storage, payment, etc.)
 * Service name is included to identify which external dependency failed.
 * 
 * Frontend should show user a "try again later" message.
 * 
 * @extends AppError
 * 
 * @example Email service failure
 * ```typescript
 * throw new ExternalServiceError(
 *   "SendGrid",
 *   "API rate limit exceeded - 100 req/min"
 * )
 * ```
 * 
 * @example Storage service failure
 * ```typescript
 * throw new ExternalServiceError(
 *   "Supabase Storage",
 *   "Upload failed: network timeout"
 * )
 * ```
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      message || `${service} service error`,
      503
    )
    this.name = "ExternalServiceError"
  }
}
