// Add named redirect destinations here, e.g. /redirect/test.
export const REDIRECT_DESTINATIONS: Readonly<Record<string, string>> = {
  "prsk-bot": "https://prsk-bot.rynni.cc",
};

export const REDIRECT_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export function getRedirectDestination(name: string): string | null {
  if (
    !REDIRECT_NAME_PATTERN.test(name) ||
    !Object.hasOwn(REDIRECT_DESTINATIONS, name)
  )
    return null;
  return REDIRECT_DESTINATIONS[name];
}

export function parseRedirectUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
