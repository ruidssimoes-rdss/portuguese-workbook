/**
 * Post-login redirect targets.
 *
 * Only same-origin relative paths are accepted: they must start with a single
 * "/" and must not be protocol-relative ("//host") or contain a backslash
 * (some browsers treat "/\host" as "//host"). Both the raw value and its
 * percent-decoded form are checked, and the raw value is what gets returned.
 */
function isSafe(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;
  // Never bounce back into the auth screens.
  return value !== "/auth" && !value.startsWith("/auth/");
}

export function safeNextPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || !isSafe(raw)) return fallback;
  try {
    if (!isSafe(decodeURIComponent(raw))) return fallback;
  } catch {
    // A stray "%" (e.g. "?q=100%") is fine: the raw value already passed.
  }
  return raw;
}

/** Cookie that carries `next` across the Google OAuth round trip. */
export const NEXT_COOKIE = "aula_next";
