"use client"

import DOMPurify from "isomorphic-dompurify"

/**
 * Client-side HTML sanitization
 */
export function sanitizeHtmlClient(html: string): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  })
}

/**
 * Client-side text sanitization
 */
export function sanitizeTextClient(text: string): string {
  if (!text) return ""

  // Remove null bytes and control characters
  let cleaned = text.replace(/[\0\x00-\x1F\x7F]/g, "")

  // Trim whitespace
  cleaned = cleaned.trim()

  // Basic HTML entity escape
  cleaned = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")

  return cleaned
}

/**
 * Sanitize medication name on client
 */
export function sanitizeMedicationNameClient(name: string): string {
  if (!name) return ""

  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-\(\)\/]/g, "")
    .substring(0, 200)
}

/**
 * Sanitize dosage on client
 */
export function sanitizeDosageClient(dosage: string): string {
  if (!dosage) return ""

  return dosage
    .trim()
    .replace(/[^a-zA-Z0-9\s\.\/]/g, "")
    .substring(0, 50)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}
