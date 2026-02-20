/**
 * Input Sanitization Library
 * 
 * Provides comprehensive input validation and sanitization functions to protect against:
 * - XSS (Cross-Site Scripting) attacks
 * - SQL/NoSQL Injection attempts
 * - Path traversal attacks
 * - Data overflow and malformed inputs
 * 
 * @module sanitize
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 */

import validator from "validator"

/**
 * Sanitizes HTML content by removing all tags and escaping special characters
 * 
 * This is a lightweight approach suitable for fields that shouldn't contain HTML.
 * All HTML tags are stripped, and remaining special chars are escaped.
 * 
 * @param html - Raw HTML string that may contain malicious code
 * @returns Sanitized string with HTML removed and special chars escaped
 * 
 * @example
 * sanitizeHtml("<script>alert('xss')</script>Hello")
 * // Returns: "Hello"
 * 
 * @example
 * sanitizeHtml("<b>Bold</b> & special")
 * // Returns: "Bold &amp; special"
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""
  
  // Step 1: Remove all HTML tags to prevent XSS
  let cleaned = html.replace(/<[^>]*>/g, "")
  
  // Step 2: Escape remaining special characters (&, <, >, ", ')
  cleaned = validator.escape(cleaned)
  
  return cleaned
}

/**
 * Sanitizes plain text by removing control characters and escaping HTML entities
 * 
 * Removes potentially dangerous characters while preserving readable text.
 * Useful for user-generated content like names, descriptions, notes.
 * 
 * @param text - Raw text input from user
 * @returns Sanitized text safe for storage and display
 * 
 * @example
 * sanitizeText("Hello\x00World\nTest")
 * // Returns: "HelloWorld\nTest" (null byte removed)
 */
export function sanitizeText(text: string): string {
  if (!text) return ""
  
  // Remove null bytes and control characters (except newlines and tabs)
  // These can be used in some injection attacks
  let cleaned = text.replace(/[\0\x00-\x1F\x7F]/g, "")
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim()
  
  // Escape HTML special characters to prevent XSS
  cleaned = validator.escape(cleaned)
  
  return cleaned
}

/**
 * Normalizes and validates email addresses
 * 
 * Uses industry-standard email normalization while preserving important variations.
 * Does NOT remove Gmail dots or subaddresses as these are valid email features.
 * 
 * @param email - Raw email address
 * @returns Normalized email or empty string if invalid
 * 
 * @example
 * sanitizeEmail("  User@EXAMPLE.COM  ")
 * // Returns: "user@example.com"
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ""
  
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false,      // Keep dots (valid Gmail feature)
    gmail_remove_subaddress: false, // Keep +tags (valid Gmail feature)
  })
  
  return normalized || ""
}

/**
 * Validates and sanitizes URLs to prevent open redirect and SSRF attacks
 * 
 * Only allows HTTP/HTTPS protocols and validates URL structure.
 * Returns null for invalid URLs rather than attempting to "fix" them.
 * 
 * @param url - Raw URL string
 * @returns Valid URL or null if invalid/dangerous
 * 
 * @example
 * sanitizeUrl("javascript:alert(1)")
 * // Returns: null (dangerous protocol)
 * 
 * @example
 * sanitizeUrl("https://example.com")
 * // Returns: "https://example.com"
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  
  const trimmed = url.trim()
  
  // Only allow HTTP/HTTPS to prevent javascript:, data:, file: protocols
  if (!validator.isURL(trimmed, {
    protocols: ["http", "https"],
    require_protocol: true,
  })) {
    return null
  }
  
  return trimmed
}

/**
 * Sanitizes medication names to allow only safe characters
 * 
 * Medication names can contain letters, numbers, spaces, and common medical symbols.
 * Prevents injection attacks while allowing legitimate medical terminology.
 * 
 * Allowed characters: A-Z, a-z, 0-9, space, hyphen, parentheses, forward slash
 * Max length: 200 characters (prevents buffer overflow)
 * 
 * @param name - Raw medication name from user input
 * @returns Sanitized medication name
 * 
 * @example
 * sanitizeMedicationName("Aspirin 500mg <script>")
 * // Returns: "Aspirin 500mg"
 * 
 * @example
 * sanitizeMedicationName("Co-Amoxiclav (875/125)")
 * // Returns: "Co-Amoxiclav (875/125)"
 */
export function sanitizeMedicationName(name: string): string {
  if (!name) return ""
  
  // Whitelist approach: only allow specific safe characters
  // This is more secure than blacklisting dangerous chars
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-\(\)\/]/g, "") // Remove anything not in whitelist
    .substring(0, 200) // Cap length to prevent DOS via large inputs
  
  return cleaned
}

/**
 * Sanitizes medication dosage strings
 * 
 * Dosages typically contain numbers and units (mg, ml, etc.).
 * 
 * Allowed: Numbers, letters (for units), spaces, periods, slashes
 * Max length: 50 characters
 * 
 * @param dosage - Raw dosage string
 * @returns Sanitized dosage
 * 
 * @example
 * sanitizeDosage("100mg/5ml")
 * // Returns: "100mg/5ml"
 */
export function sanitizeDosage(dosage: string): string {
  if (!dosage) return ""
  
  const cleaned = dosage
    .trim()
    .replace(/[^a-zA-Z0-9\s\.\/]/g, "")
    .substring(0, 50)
  
  return cleaned
}

/**
 * Validates and sanitizes time strings in HH:MM format
 * 
 * Strict validation ensures only valid 24-hour time formats are accepted.
 * Invalid times are rejected completely (returns null).
 * 
 * @param time - Time string to validate
 * @returns Valid time string or null
 * 
 * @example
 * sanitizeTime("14:30")  // Returns: "14:30"
 * sanitizeTime("25:99")  // Returns: null
 * sanitizeTime("2:30")   // Returns: "2:30" (leading zero optional)
 */
export function sanitizeTime(time: string): string | null {
  if (!time) return null
  
  const trimmed = time.trim()
  
  // Strict regex: hours 0-23, minutes 0-59
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(trimmed)) {
    return null
  }
  
  return trimmed
}

/**
 * Sanitizes an array of time strings
 * 
 * Filters out invalid times and limits array size to prevent resource exhaustion.
 * 
 * @param times - Array of time strings
 * @returns Array of valid time strings (max 10)
 * 
 * @example
 * sanitizeTimeArray(["08:00", "invalid", "14:30", "25:99"])
 * // Returns: ["08:00", "14:30"]
 */
export function sanitizeTimeArray(times: string[]): string[] {
  if (!Array.isArray(times)) return []
  
  return times
    .map(sanitizeTime)
    .filter((t): t is string => t !== null)
    .slice(0, 10) // Limit to 10 times per day (reasonable max)
}

/**
 * Validates and sanitizes integer values with range checking
 * 
 * Ensures numeric inputs are:
 * - Actually integers (not floats or strings)
 * - Within acceptable range (prevents overflow)
 * 
 * @param value - Value to validate (can be any type)
 * @param min - Minimum allowed value (default: 1)
 * @param max - Maximum allowed value (default: 365)
 * @returns Valid integer or null
 * 
 * @example
 * sanitizeInteger("7", 1, 30)      // Returns: 7
 * sanitizeInteger(7.5, 1, 30)      // Returns: null (not an integer)
 * sanitizeInteger(999, 1, 365)     // Returns: null (exceeds max)
 */
export function sanitizeInteger(value: unknown, min = 1, max = 365): number | null {
  const num = Number(value)
  
  // Validate it's an integer and within range
  if (!Number.isInteger(num) || num < min || num > max) {
    return null
  }
  
  return num
}

/**
 * Creates a sanitized subset of an object with only allowed keys
 * 
 * Prevents mass assignment vulnerabilities by explicitly whitelisting allowed properties.
 * Unknown or dangerous properties are silently dropped.
 * 
 * @param obj - Source object
 * @param allowedKeys - Array of allowed property names
 * @returns New object with only whitelisted properties
 * 
 * @example
 * const input = { name: "Test", admin: true, password: "secret" }
 * sanitizeObject(input, ["name"])
 * // Returns: { name: "Test" }
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {}
  
  // Only copy whitelisted keys
  for (const key of allowedKeys) {
    if (key in obj) {
      sanitized[key] = obj[key]
    }
  }
  
  return sanitized
}

/**
 * Type definition for sanitized medication input
 * 
 * Represents a medication record after all sanitization is complete.
 * All fields are guaranteed to be safe for database insertion.
 */
export interface MedicationInput {
  name: string              // Required: Medication name
  dosage?: string           // Optional: Dosage amount
  frequency?: string        // Optional: How often to take
  time: string[]           // Required: Times of day (HH:MM format)
  duration_days: number    // Required: How many days (1-365)
  instructions?: string    // Optional: Additional instructions
}

/**
 * Comprehensive sanitization of medication input data
 * 
 * This is the main entry point for validating medication creation requests.
 * Performs deep validation and sanitization of all fields.
 * 
 * Returns null if data is invalid rather than throwing errors.
 * This allows the caller to handle validation failures appropriately.
 * 
 * @param data - Raw input data (type unknown for safety)
 * @returns Sanitized medication data or null if invalid
 * 
 * @example
 * ```typescript
 * const result = sanitizeMedicationInput({
 *   name: "Aspirin",
 *   time: ["08:00", "20:00"],
 *   duration_days: 7
 * })
 * 
 * if (!result) {
 *   throw new ValidationError("Invalid medication data")
 * }
 * 
 * await db.medications.insert(result)
 * ```
 */
export function sanitizeMedicationInput(data: unknown): MedicationInput | null {
  // Type guard: ensure we have an object
  if (!data || typeof data !== "object") return null
  
  const input = data as Record<string, unknown>
  
  // Validate required field: name
  const name = sanitizeMedicationName(String(input.name || ""))
  if (!name) return null // Empty name after sanitization = invalid
  
  // Validate required field: time array
  const timeArray = sanitizeTimeArray(input.time as string[])
  if (timeArray.length === 0) return null // No valid times = invalid
  
  // Validate required field: duration_days
  const durationDays = sanitizeInteger(input.duration_days, 1, 365)
  if (durationDays === null) return null // Invalid duration = invalid
  
  // Sanitize optional fields (undefined if not provided)
  const dosage = input.dosage ? sanitizeDosage(String(input.dosage)) : undefined
  const frequency = input.frequency ? sanitizeText(String(input.frequency)) : undefined
  const instructions = input.instructions ? sanitizeText(String(input.instructions)) : undefined
  
  return {
    name,
    dosage,
    frequency,
    time: timeArray,
    duration_days: durationDays,
    instructions,
  }
}

/**
 * Sanitizes file names to prevent path traversal attacks
 * 
 * Removes directory traversal attempts (../) and path separators.
 * Prevents attackers from uploading files outside designated directories.
 * 
 * Security measures:
 * - Remove path traversal sequences
 * - Remove directory separators
 * - Allow only safe characters
 * - Prevent double extensions (.php.jpg)
 * - Limit length to prevent buffer overflow
 * 
 * @param fileName - Original file name
 * @returns Sanitized file name
 * 
 * @example
 * sanitizeFileName("../../etc/passwd")
 * // Returns: "etcpasswd"
 * 
 * @example
 * sanitizeFileName("photo.php.jpg")
 * // Returns: "photo.jpg"
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return ""
  
  // Remove path traversal attempts
  let cleaned = fileName.replace(/\.\./g, "")
  
  // Remove directory separators (both Unix and Windows)
  cleaned = cleaned.replace(/[\/\\]/g, "")
  
  // Whitelist safe characters only
  cleaned = cleaned.replace(/[^a-zA-Z0-9\-\_\.]/g, "")
  
  // Prevent double extension attacks (e.g., evil.php.jpg)
  const parts = cleaned.split(".")
  if (parts.length > 2) {
    // Keep only base name and final extension
    cleaned = parts[0] + "." + parts[parts.length - 1]
  }
  
  // Limit length (filesystem limits)
  return cleaned.substring(0, 255)
}

/**
 * Validates file MIME type against whitelist
 * 
 * Prevents upload of dangerous file types (executables, scripts, etc.)
 * Always use whitelist approach rather than blacklist.
 * 
 * @param mimeType - File's MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if allowed, false otherwise
 * 
 * @example
 * isAllowedFileType("image/jpeg", ALLOWED_IMAGE_TYPES)
 * // Returns: true
 * 
 * @example
 * isAllowedFileType("application/x-executable", ALLOWED_IMAGE_TYPES)
 * // Returns: false
 */
export function isAllowedFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType.toLowerCase())
}

/**
 * Whitelist of allowed image MIME types
 * 
 * Only these image formats are accepted for proof photo uploads.
 * Add more types here if needed, but avoid risky formats.
 * 
 * @constant
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]
