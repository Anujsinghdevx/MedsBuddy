import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://meds-buddy-sigma.vercel.app/",
]

export function corsHeaders(origin: string | null): HeadersInit {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", 
  }
}

export function handleCors(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin")

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    })
  }

  return null
}

export function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  const headers = corsHeaders(origin)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
