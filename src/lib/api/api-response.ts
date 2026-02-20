import { NextResponse } from "next/server"
import { AppError } from "@/lib/errors"

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    [key: string]: unknown
  }
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp?: string
  path?: string
}

export class ApiResponse {
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
        ...(message && { message }),
        ...(meta && { meta }),
      },
      { status: statusCode }
    )
  }

  static created<T>(
    data: T,
    message: string = "Resource created successfully"
  ): NextResponse<SuccessResponse<T>> {
    return this.success(data, message, 201)
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  static error(error: AppError | Error, path?: string): NextResponse<ErrorResponse> {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
          },
          timestamp: new Date().toISOString(),
          ...(path && { path }),
        },
        { status: error.statusCode }
      )
    }

    // Unknown errors
    console.error("Unhandled error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "production" ? "An unexpected error occurred" : error.message,
        },
        timestamp: new Date().toISOString(),
        ...(path && { path }),
      },
      { status: 500 }
    )
  }
}
