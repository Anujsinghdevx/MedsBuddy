/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formats across all API endpoints.
 * Ensures frontend can reliably parse responses regardless of success/failure.
 * 
 * All responses follow this pattern:
 * - Success: { success: true, data: T, message?, meta? }
 * - Error: { success: false, error: { code, message, details? }, timestamp, path }
 * 
 * @module api-response
 * @see RFC 7807 - Problem Details for HTTP APIs
 */

import { NextResponse } from "next/server"
import { AppError } from "@/lib/errors"

/**
 * Standard success response structure
 * 
 * Generic type T represents the shape of returned data.
 * Pagination info goes in optional meta field.
 * 
 * @template T - Type of data being returned
 */
export interface SuccessResponse<T = unknown> {
  /** Always true for success responses */
  success: true
  
  /** Actual response data */
  data: T
  
  /** Optional success message for user display */
  message?: string
  
  /** Optional metadata (pagination, totals, etc.) */
  meta?: {
    /** Current page number (for pagination) */
    page?: number
    
    /** Items per page (for pagination) */
    limit?: number
    
    /** Total items available (for pagination) */
    total?: number
    
    /** Additional custom metadata */
    [key: string]: unknown
  }
}

/**
 * Standard error response structure
 * 
 * Includes machine-readable error code, human message,
 * optional debugging details, and request context.
 */
export interface ErrorResponse {
  /** Always false for error responses */
  success: false
  
  /** Error details */
  error: {
    /** Machine-readable error code from ErrorCode enum */
    code: string
    
    /** Human-readable error message */
    message: string
    
    /** Optional debugging details (field errors, stack trace, etc.) */
    details?: Record<string, unknown>
  }
  
  /** ISO timestamp when error occurred */
  timestamp?: string
  
  /** Request path that caused the error */
  path?: string
}

/**
 * API Response Builder
 * 
 * Factory class for creating standardized API responses.
 * Use these methods instead of manually creating NextResponse objects.
 * 
 * Benefits:
 * - Consistent response format across all endpoints
 * - Type-safe response data
 * - Automatic status code handling
 * - Built-in error normalization
 * 
 * @example Success response
 * ```typescript
 * return ApiResponse.success(
 *   { id: 1, name: "Aspirin" },
 *   "Medication created"
 * )
 * ```
 * 
 * @example Error response
 * ```typescript
 * return ApiResponse.error(
 *   new ValidationError("Invalid email"),
 *   req.nextUrl.pathname
 * )
 * ```
 */
export class ApiResponse {
  /**
   * Creates a success response (HTTP 200)
   * 
   * Use this for all successful API operations.
   * Data type is inferred from the first parameter.
   * 
   * @template T - Type of data being returned
   * @param data - Response payload (automatically typed)
   * @param message - Optional success message for user display
   * @param statusCode - HTTP status code (default: 200 OK)
   * @param meta - Optional metadata (pagination, totals, etc.)
   * @returns NextResponse with standardized success format
   * 
   * @example Basic usage
   * ```typescript
   * return ApiResponse.success({ id: 1, name: "John" })
   * ```
   * 
   * @example With message and metadata
   * ```typescript
   * return ApiResponse.success(
   *   medications,
   *   "Medications retrieved",
   *   200,
   *   { page: 1, limit: 10, total: 45 }
   * )
   * ```
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: Record<string, unknown>
  ): NextResponse<SuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        // Conditionally include optional fields (cleaner JSON)
        ...(message && { message }),
        ...(meta && { meta }),
      },
      { status: statusCode }
    )
  }

  /**
   * Creates a resource created response (HTTP 201)
   * 
   * Use this when a new resource is successfully created.
   * Returns 201 Created status code per REST conventions.
   * 
   * @template T - Type of created resource
   * @param data - The newly created resource
   * @param message - Success message (default: "Resource created successfully")
   * @returns NextResponse with 201 status
   * 
   * @example
   * ```typescript
   * return ApiResponse.created(newMedication, "Medication added")
   * ```
   */
  static created<T>(
    data: T,
    message: string = "Resource created successfully"
  ): NextResponse<SuccessResponse<T>> {
    return this.success(data, message, 201)
  }

  /**
   * Creates a no content response (HTTP 204)
   * 
   * Use this for successful operations that don't return data.
   * Common use cases: DELETE operations, bulk updates
   * 
   * Note: 204 responses MUST NOT include a body (per HTTP spec)
   * 
   * @returns Empty NextResponse with 204 status
   * 
   * @example
   * ```typescript
   * await deleteMedication(id)
   * return ApiResponse.noContent()
   * ```
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  /**
   * Creates an error response with appropriate HTTP status
   * 
   * Handles both AppError (typed) and generic Error objects.
   * Automatically includes timestamp and request path for debugging.
   * 
   * Error message behavior:
   * - Production: Generic "An unexpected error occurred" for unknown errors
   * - Development: Actual error message for debugging
   * 
   * @param error - AppError or generic Error
   * @param path - Request path (optional, for debugging)
   * @returns NextResponse with error details and appropriate status code
   * 
   * @example With AppError
   * ```typescript
   * catch (error) {
   *   return ApiResponse.error(
   *     new ValidationError("Invalid input"),
   *     req.nextUrl.pathname
   *   )
   * }
   * ```
   * 
   * @example With generic Error
   * ```typescript
   * catch (error) {
   *   return ApiResponse.error(error as Error, req.nextUrl.pathname)
   * }
   * ```
   */
  static error(error: AppError | Error, path?: string): NextResponse<ErrorResponse> {
    // Handle typed application errors
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            // Only include details if they exist (field errors, etc.)
            ...(error.details && { details: error.details }),
          },
          timestamp: new Date().toISOString(),
          ...(path && { path }),
        },
        { status: error.statusCode }
      )
    }

    // Handle unknown/unexpected errors
    // These should be logged to error monitoring service (Sentry, etc.)
    console.error("Unhandled error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          // Hide error details in production for security
          message:
            process.env.NODE_ENV === "production" 
              ? "An unexpected error occurred" 
              : error.message,
        },
        timestamp: new Date().toISOString(),
        ...(path && { path }),
      },
      { status: 500 }
    )
  }
}
