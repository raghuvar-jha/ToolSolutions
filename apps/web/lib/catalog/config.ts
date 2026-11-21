/** Catalog settings (spec 014). */

/**
 * Show the seeded sample reviews (isSample: true) next to real ones.
 * On in development, off in production. Ask the client before turning it on in production.
 */
export const SHOW_SAMPLE_REVIEWS = process.env.NODE_ENV !== "production";
