import { NextRequest } from "next/server"
import { AppError, ErrorCode } from "@/lib/errors"
import { ApiResponse } from "@/lib/api/api-response"
import { ZodError } from "zod"

export type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error("API Error:", {
        error,
        path: req.nextUrl.pathname,
        method: req.method,
        timestamp: new Date().toISOString(),
      })

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const appError = new AppError(ErrorCode.VALIDATION_ERROR, "Validation failed", 400, {
          errors: error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        })
        return ApiResponse.error(appError, req.nextUrl.pathname)
      }

      // Handle AppError
      if (error instanceof AppError) {
        return ApiResponse.error(error, req.nextUrl.pathname)
      }

      // Handle unknown errors
      if (error instanceof Error) {
        return ApiResponse.error(error, req.nextUrl.pathname)
      }

      // Fallback
      return ApiResponse.error(new Error("An unexpected error occurred"), req.nextUrl.pathname)
    }
  }
}
