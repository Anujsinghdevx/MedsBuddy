/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting requests per IP address.
 * Uses in-memory storage with automatic cleanup of expired entries.
 * 
 * Features:
 * - Per-IP + per-path tracking (prevents cross-endpoint abuse)
 * - Configurable time windows and request limits
 * - Standard HTTP 429 responses with Retry-After headers
 * - Automatic cleanup of expired entries
 * 
 * ⚠️ IMPORTANT: In-memory store only works for single-server deployments.
 * For production with multiple servers, use Redis or similar distributed store.
 * 
 * @module rate-limit
 * @see https://tools.ietf.org/html/rfc6585#section-4 - HTTP 429 Too Many Requests
 * 
 * @example Basic usage
 * ```typescript
 * // In your API route
 * const limiter = rateLimit({ interval: 60000, maxRequests: 10 })
 * 
 * export async function POST(req: NextRequest) {
 *   const limitResponse = limiter(req)
 *   if (limitResponse) return limitResponse  // Rate limited!
 *   
 *   // Process request normally
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"

/**
 * Rate limit tracking data for a specific IP + path combination
 * 
 * @internal
 */
interface RateLimitStore {
  /** Number of requests made in current window */
  count: number
  
  /** Timestamp when the rate limit window resets (ms since epoch) */
  resetTime: number
}

/**
 * In-memory store for rate limit data
 * 
 * Key format: `{ip}-{path}` (e.g., "192.168.1.1-/api/medication/create")
 * This prevents users from bypassing limits by hitting different endpoints.
 * 
 * @internal
 */
const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Rate limit configuration options
 */
export interface RateLimitConfig {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  interval: number
  
  /** Maximum requests allowed per interval (default: 60) */
  maxRequests: number
}

/**
 * Default rate limit configuration
 * 
 * Conservative defaults suitable for most endpoints:
 * - 60 requests per minute
 * - 1 request per second average
 * 
 * Override these for specific endpoints (e.g., stricter for sensitive operations)
 */
const defaultConfig: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

/**
 * Creates a rate limiter middleware with custom configuration
 * 
 * Returns a function that checks if a request should be rate limited.
 * Call this function before processing the request.
 * 
 * How it works:
 * 1. Extracts client IP from request headers
 * 2. Creates unique key from IP + pathname
 * 3. Checks request count against limit
 * 4. Returns 429 if limit exceeded, null otherwise
 * 
 * @param config - Partial rate limit configuration (merged with defaults)
 * @returns Middleware function that returns NextResponse if rate limited, null otherwise
 * 
 * @example Strict rate limiting for sensitive endpoint
 * ```typescript
 * const strictLimiter = rateLimit({
 *   interval: 60 * 1000,  // 1 minute
 *   maxRequests: 5        // Only 5 requests per minute
 * })
 * 
 * export async function POST(req: NextRequest) {
 *   const limitResponse = strictLimiter(req)
 *   if (limitResponse) return limitResponse
 *   
 *   // Process sensitive operation
 * }
 * ```
 * 
 * @example Relaxed rate limiting for public endpoint
 * ```typescript
 * const relaxedLimiter = rateLimit({
 *   interval: 60 * 1000,  // 1 minute
 *   maxRequests: 100      // 100 requests per minute
 * })
 * ```
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  // Merge with defaults
  const { interval, maxRequests } = { ...defaultConfig, ...config }

  /**
   * Middleware function that checks rate limit
   * 
   * @param req - Next.js request object
   * @returns NextResponse with 429 status if rate limited, null if allowed
   */
  return (req: NextRequest): NextResponse | null => {
    // ==================== Extract Client IP ====================
    // Try multiple headers in order of reliability:
    // 1. x-forwarded-for: Set by proxies (Vercel, Cloudflare, etc.)
    // 2. x-real-ip: Alternative header used by some proxies
    // 3. "unknown": Fallback if no IP found
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // Take first IP if multiple
      req.headers.get("x-real-ip") ||
      "unknown"

    const now = Date.now()
    
    // Create unique key: IP + path combination
    // This prevents users from bypassing limits by hitting different endpoints
    const key = `${ip}-${req.nextUrl.pathname}`

    // ==================== Get or Create Rate Limit Entry ====================
    let limitEntry = rateLimitStore.get(key)

    // Reset counter if time window has passed
    if (!limitEntry || now > limitEntry.resetTime) {
      limitEntry = {
        count: 0,
        resetTime: now + interval, // Set next reset time
      }
      rateLimitStore.set(key, limitEntry)
    }

    // ==================== Increment Request Counter ====================
    limitEntry.count++

    // ==================== Check Rate Limit ====================
    if (limitEntry.count > maxRequests) {
      // Calculate seconds until rate limit resets
      const retryAfter = Math.ceil((limitEntry.resetTime - now) / 1000)

      // Return HTTP 429 with standard rate limit headers
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            // Standard HTTP rate limit headers (RFC 6585)
            "Retry-After": retryAfter.toString(), // Seconds until retry
            "X-RateLimit-Limit": maxRequests.toString(), // Max requests allowed
            "X-RateLimit-Remaining": "0", // No requests remaining
            "X-RateLimit-Reset": new Date(limitEntry.resetTime).toISOString(), // ISO timestamp
          },
        }
      )
    }

    // Request allowed - no rate limit exceeded
    return null
  }
}

// ==================== Automatic Cleanup ====================
/**
 * Periodically clean up expired rate limit entries
 * 
 * Runs every 10 minutes to prevent memory leaks.
 * Only runs server-side (not in browser/build).
 * 
 * Without cleanup, the Map would grow indefinitely as new IPs are seen.
 * This is especially important for public APIs with many users.
 */
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now()
    
    // Remove all expired entries
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
    
    // Optional: Log cleanup stats for monitoring
    // console.log(`Rate limit cleanup: ${deletedCount} entries removed`)
  }, 10 * 60 * 1000) // Every 10 minutes
}
