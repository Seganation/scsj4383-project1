/**
 * Lightweight in-memory rate limiter for Docker/VPS environments
 * No external dependencies (Redis, etc.) - uses simple Map with automatic cleanup
 * Memory-efficient with LRU eviction and automatic pruning
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private readonly maxEntries = 10000; // Prevent memory leaks
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup every 5 minutes to prevent memory bloat
    this.startCleanup();
  }

  private startCleanup() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let removed = 0;

      // Remove expired entries
      for (const [key, entry] of this.cache.entries()) {
        if (entry.resetAt < now) {
          this.cache.delete(key);
          removed++;
        }
      }

      // If still too many entries, remove oldest ones (LRU)
      if (this.cache.size > this.maxEntries) {
        const entriesToRemove = this.cache.size - this.maxEntries;
        const keys = Array.from(this.cache.keys());
        for (let i = 0; i < entriesToRemove; i++) {
          this.cache.delete(keys[i]);
          removed++;
        }
      }

      if (process.env.NODE_ENV === "development" && removed > 0) {
        console.log(`Rate limiter cleanup: removed ${removed} expired entries`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.cache.get(identifier);

    if (!entry || entry.resetAt < now) {
      // First request or expired window - allow and reset
      this.cache.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    entry.count++;
    this.cache.set(identifier, entry);
    return true;
  }

  /**
   * Get remaining requests and reset time
   */
  getInfo(identifier: string, maxRequests: number): {
    remaining: number;
    resetAt: number | null
  } {
    const entry = this.cache.get(identifier);
    if (!entry) {
      return { remaining: maxRequests, resetAt: null };
    }

    const now = Date.now();
    if (entry.resetAt < now) {
      return { remaining: maxRequests, resetAt: null };
    }

    return {
      remaining: Math.max(0, maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clear all rate limit data (useful for tests)
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get current cache size (for monitoring)
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  // Checkout endpoint - prevent spam orders
  checkout: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },
  // Webhook endpoint - protect against floods
  webhook: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute (Stripe can send bursts)
  },
  // Admin endpoints - prevent brute force
  admin: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },
  // Auth endpoints - prevent credential stuffing
  auth: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  // Contact form - prevent spam
  contact: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 3 requests per minute
  },
  // General API - catch-all
  api: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },
} as const;

/**
 * Rate limit middleware for Next.js API routes
 */
export async function rateLimit(
  request: Request,
  config: { maxRequests: number; windowMs: number },
  identifier?: string
): Promise<{ success: boolean; headers: Record<string, string> }> {
  // Get identifier (IP address or custom)
  const ip = identifier || getClientIP(request);

  // Check rate limit
  const allowed = rateLimiter.check(ip, config.maxRequests, config.windowMs);
  const info = rateLimiter.getInfo(ip, config.maxRequests);

  // Return headers for client
  const headers = {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": info.remaining.toString(),
    ...(info.resetAt && {
      "X-RateLimit-Reset": new Date(info.resetAt).toISOString(),
    }),
  };

  return {
    success: allowed,
    headers,
  };
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  // Try various headers for IP (works with proxies, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }

  // Fallback to a placeholder (shouldn't happen in production)
  return "unknown";
}

export { rateLimiter };
