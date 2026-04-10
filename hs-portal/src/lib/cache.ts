// hs-portal/src/lib/cache.ts
// In-memory cache with per-slug TTL and manual invalidation.
// Designed to be replaced with a Redis adapter by swapping get/set/delete.

import type { HydratedBrandData, CacheEntry } from "../types/index.js";
import { logger } from "./logger.js";

const DEFAULT_TTL_MS = (parseInt(process.env.CACHE_TTL_SECONDS ?? "300", 10)) * 1000;

// Slug → CacheEntry map
const store = new Map<string, CacheEntry>();

// ─── Internals ────────────────────────────────────────────────────────────────

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.cachedAt > entry.ttl;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a cached HydratedBrandData for a slug.
 * Returns null on miss or expiry.
 */
export function cacheGet(slug: string): HydratedBrandData | null {
  const entry = store.get(slug);
  if (!entry) return null;
  if (isExpired(entry)) {
    store.delete(slug);
    logger.info(`[cache] Expired entry evicted: ${slug}`);
    return null;
  }
  logger.info(`[cache] HIT: ${slug}`);
  return entry.data;
}

/**
 * Store a HydratedBrandData under slug.
 * Optional ttlMs overrides the environment default.
 */
export function cacheSet(slug: string, data: HydratedBrandData, ttlMs = DEFAULT_TTL_MS): void {
  store.set(slug, { data, cachedAt: Date.now(), ttl: ttlMs });
  logger.info(`[cache] SET: ${slug} (ttl=${ttlMs / 1000}s)`);
}

/**
 * Forcibly remove a slug from the cache.
 * Called by the invalidation endpoint when Studio saves.
 */
export function cacheInvalidate(slug: string): boolean {
  const existed = store.has(slug);
  store.delete(slug);
  logger.info(`[cache] INVALIDATED: ${slug} (existed=${existed})`);
  return existed;
}

/**
 * Invalidate ALL slugs — useful after a template re-deploy.
 */
export function cacheFlushAll(): number {
  const count = store.size;
  store.clear();
  logger.info(`[cache] FLUSH ALL — cleared ${count} entries`);
  return count;
}

/**
 * Return cache statistics for the Hub admin panel.
 */
export function cacheStats(): { size: number; slugs: string[]; defaultTtlMs: number } {
  return {
    size: store.size,
    slugs: Array.from(store.keys()),
    defaultTtlMs: DEFAULT_TTL_MS,
  };
}
