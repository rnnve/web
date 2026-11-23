const KEY = "ryn:docs-return";

function isSafeReturnPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    path !== "/docs" &&
    !path.startsWith("/docs/")
  );
}

/** Remember where the visitor was before opening docs. */
export function rememberDocsReturn(path: string) {
  if (!isSafeReturnPath(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // Navigation still works when storage is unavailable.
  }
}

/** Path to leave docs for; falls back to home when unknown. */
export function readDocsReturn(fallback = "/"): string {
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved && isSafeReturnPath(saved)) return saved;
  } catch {
    // Fall through to the default.
  }
  return fallback;
}

/** Prefer a same-origin referrer when no saved return path exists. */
export function resolveDocsReturn(
  referrer: string,
  origin: string,
  fallback = "/",
): string {
  const saved = readDocsReturn("");
  if (saved) return saved;
  if (!referrer) return fallback;
  try {
    const url = new URL(referrer);
    if (url.origin !== origin) return fallback;
    const path = `${url.pathname}${url.search}`;
    if (!isSafeReturnPath(path)) return fallback;
    rememberDocsReturn(path);
    return path;
  } catch {
    return fallback;
  }
}
