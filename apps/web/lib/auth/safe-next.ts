/**
 * Redirect targets after login (spec 013): only relative paths inside this site.
 * Anything else (absolute URLs, "//host", "/\host", control characters) gives the fallback.
 */

const BASE = "http://site.invalid";
const AUTH_PAGES = new Set(["/login", "/signup", "/logout"]);

export function safeNext(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return fallback;

  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE || AUTH_PAGES.has(url.pathname)) return fallback;

  const path = `${url.pathname}${url.search}${url.hash}`;
  // Dot segments can collapse to "//host" (e.g. "/.//host"): never return that.
  return path.startsWith("//") ? fallback : path;
}
