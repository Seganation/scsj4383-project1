/**
 * Check if we're in build time (Docker build phase)
 * Returns true if DATABASE_URL is the placeholder value
 */
export function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return dbUrl.includes("placeholder") || dbUrl === "";
}

/**
 * Safe database query wrapper that returns empty results during build
 */
export async function safeDbQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (isBuildTime()) {
    return fallback;
  }
  try {
    return await query();
  } catch (error) {
    console.error("Database query failed:", error);
    return fallback;
  }
}
