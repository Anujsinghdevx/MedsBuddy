/**
 * Global Error Handler Middleware
 *
 * Wraps API route handlers to provide consistent error handling.
 * Catches all errors and converts them to standardized API responses.
 *
 * Features:
 * - Automatic error type detection (AppError, ZodError, generic Error)
 * - Structured error logging with context
 * - Type-safe route handler wrapper
 * - Zod validation error normalization
 *
 * Usage: Wrap all API route handlers with withErrorHandling()
 *
 * @module error-handler
 *
 * @example
 * ```typescript
 * export const POST = withErrorHandling(async (req: NextRequest) => {
 *   // Your route logic here
 *   // Any thrown errors are automatically caught and formatted
 *
 *   throw new ValidationError("Invalid input")
 *   // Becomes: { success: false, error: { code: "VALIDATION_ERROR", ... } }
 * })
 * ```
 */

import { NextRequest } from "next/server"
import { AppError, ErrorCode } from "@/lib/errors"
import { ApiResponse } from "@/lib/api/api-response"
import { ZodError } from "zod"

/**
 * Type definition for Next.js API route handlers
 *
 * Matches the signature of Next.js 14+ route handlers.
 * Context contains dynamic route parameters (e.g., [id]).
 *
 * @example
 * ```typescript
 * // Route: /api/medications/[id]/route.ts
 * const handler: RouteHandler = async (req, context) => {
 *   const params = await context?.params
 *   const id = params?.id  // Dynamic parameter from URL
 * }
 * ```
 */
export type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>

/**
 * Error handling middleware wrapper
 *
 * Wraps an API route handler to provide automatic error catching and formatting.
 * All errors are logged with context and converted to API responses.
 *
 * Error handling hierarchy:
 * 1. ZodError (validation) → 400 with field-specific errors
 * 2. AppError (typed errors) → Uses error's statusCode
 * 3. Generic Error → 500 Internal Server Error
 *
 * @param handler - The API route handler function to wrap
 * @returns Wrapped handler with error catching
 *
 * @example Basic usage
 * ```typescript
 * export const GET = withErrorHandling(async (req: NextRequest) => {
 *   const data = await fetchData()
 *   return ApiResponse.success(data)
 * })
 * ```
 *
 * @example With manual error throwing
 * ```typescript
 * export const POST = withErrorHandling(async (req: NextRequest) => {
 *   const body = await req.json()
 *
 *   if (!body.name) {
 *     throw new ValidationError("Name is required")
 *   }
 *
 *   const result = await createItem(body)
 *   return ApiResponse.created(result)
 * })
 * ```
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      // Execute the actual route handler
      return await handler(req, context)
    } catch (error) {
      // ==================== Error Logging ====================
      // Log all errors with context for debugging
      // In production, send this to error monitoring (Sentry, Datadog, etc.)
      console.error("API Error:", {
        error,
        path: req.nextUrl.pathname,
        method: req.method,
        timestamp: new Date().toISOString(),
      })

      // ==================== Zod Validation Errors ====================
      // Zod throws ZodError when schema validation fails
      // We normalize it to our AppError format with field-specific errors
      if (error instanceof ZodError) {
        const appError = new AppError(ErrorCode.VALIDATION_ERROR, "Validation failed", 400, {
          // Convert Zod issues to our format: [{ path: "email", message: "Invalid format" }]
          errors: error.issues.map((err) => ({
            path: err.path.join("."), // e.g., "address.city"
            message: err.message,
          })),
        })
        return ApiResponse.error(appError, req.nextUrl.pathname)
      }

      // ==================== Typed Application Errors ====================
      // AppError and its subclasses (ValidationError, AuthenticationError, etc.)
      // Already have proper status codes and error codes
      if (error instanceof AppError) {
        return ApiResponse.error(error, req.nextUrl.pathname)
      }

      // ==================== Generic Errors ====================
      // Unexpected errors (network failures, third-party API errors, etc.)
      // Wrap in generic Error for consistent handling
      if (error instanceof Error) {
        return ApiResponse.error(error, req.nextUrl.pathname)
      }

      // ==================== Unknown Error Types ====================
      // Fallback for non-Error objects (shouldn't happen in TypeScript)
      // Example: throw "string error" or throw { custom: "object" }
      return ApiResponse.error(new Error("An unexpected error occurred"), req.nextUrl.pathname)
    }
  }
}
