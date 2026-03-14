/**
 * Database helper with retry logic and better error handling
 */

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a database operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, delayMs = 500, backoffMultiplier = 2 } = options;

  let lastError: Error | null = null;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on auth errors
      if (
        lastError.message.includes("Invalid login") ||
        lastError.message.includes("already registered")
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        console.warn(
          `⚠️ ${operationName} failed (attempt ${attempt}), retrying in ${currentDelay}ms...`,
        );
        console.warn(`   Error: ${lastError.message}`);
        await sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      } else {
        console.error(
          `❌ ${operationName} failed after ${maxRetries} attempts`,
        );
        console.error(`   Final error: ${lastError.message}`);
      }
    }
  }

  throw (
    lastError ||
    new Error(`${operationName} failed after ${maxRetries} attempts`)
  );
}

/**
 * Validate database connection status
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    // This should be fast - just checks connectivity
    const result = await withRetry(
      async () => {
        // Use a simple HEAD request equivalent
        const { error } = await fetch(import.meta.env.VITE_SUPABASE_URL || "", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        })
          .then((r) => ({
            error: !r.ok ? { message: "Connection failed" } : null,
          }))
          .catch((e) => ({ error: { message: e.message } }));

        return !error;
      },
      "Database connectivity check",
      { maxRetries: 2, delayMs: 300 },
    );

    return result;
  } catch (err) {
    console.warn("Database connection check failed, may be temporary");
    return false;
  }
}

/**
 * Format error messages for user display
 */
export function formatDatabaseError(error: any): string {
  if (!error) return "Unknown database error";

  const message = error.message || String(error);

  // Network errors
  if (message.includes("Failed to fetch") || message.includes("Network")) {
    return "Network connection error. Please check your internet connection.";
  }

  // Timeout errors
  if (message.includes("timeout") || message.includes("timed out")) {
    return "Database connection timed out. Please try again.";
  }

  // Auth errors
  if (message.includes("Invalid login")) {
    return "Invalid email or password";
  }

  if (message.includes("already registered")) {
    return "This email is already registered. Please login instead.";
  }

  // Row not found
  if (message.includes("PGRST116") || message.includes("No rows")) {
    return "Record not found in database";
  }

  // Permission errors
  if (
    message.includes("permission") ||
    message.includes("denied") ||
    message.includes("403") ||
    message.includes("401")
  ) {
    return "Database permission error. Please contact support.";
  }

  // Default
  return message || "An error occurred. Please try again.";
}
