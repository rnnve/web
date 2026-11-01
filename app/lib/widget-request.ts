import { isRecord } from "./json";

const REQUEST_TIMEOUT_MS = 6_000;
const SNAPSHOT_MAX_AGE_MS = 5 * 60_000;
const pendingRequests = new Map<string, Promise<unknown>>();

function storageKey(url: string) {
  return `ryn:widget:${url}`;
}

export function readWidgetSnapshot<T>(url: string): T | null {
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(storageKey(url)) ?? "null",
    );
    if (!isRecord(saved) || typeof saved.savedAt !== "number") return null;
    const age = Date.now() - saved.savedAt;
    if (age < 0 || age > SNAPSHOT_MAX_AGE_MS) return null;
    return saved.data as T;
  } catch {
    return null;
  }
}

function saveWidgetSnapshot(url: string, data: unknown) {
  // Keep the last useful snapshot when an upstream service is unavailable.
  if (isRecord(data) && data.error) return;
  try {
    sessionStorage.setItem(
      storageKey(url),
      JSON.stringify({ data, savedAt: Date.now() }),
    );
  } catch {
    // Requests still work when browser storage is unavailable.
  }
}

// Reuse an outstanding request when visibility changes or polling overlaps.
export function requestWidget<T>(
  url: string,
  options: Pick<RequestInit, "cache"> = {},
): Promise<T> {
  const requestKey = `${options.cache ?? "default"}:${url}`;
  let request = pendingRequests.get(requestKey);
  if (!request) {
    request = fetch(url, {
      ...options,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Widget request failed: ${response.status}`);
        const data: unknown = await response.json();
        saveWidgetSnapshot(url, data);
        return data;
      })
      .finally(() => pendingRequests.delete(requestKey));
    pendingRequests.set(requestKey, request);
  }
  return request as Promise<T>;
}
