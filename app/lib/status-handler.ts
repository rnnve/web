const STATUS_TIMEOUT_MS = 3_000;

export const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

// These are public profile widgets. Browsers revalidate, while a CDN can share
// a brief cached response and serve it during a background refresh.
export function statusCacheHeaders(freshSeconds: number) {
  return {
    "Cache-Control": `public, max-age=0, s-maxage=${freshSeconds}, stale-while-revalidate=${freshSeconds}, stale-if-error=60`,
  };
}

type StatusService = {
  name: string;
  key: "discord" | "spotify";
  url: string;
  // Zero disables both the upstream data cache and the response CDN cache.
  freshSeconds: number;
};

type StatusSnapshot = { status: unknown; updatedAt: number };

async function fetchStatus(
  url: string,
  freshSeconds: number,
): Promise<StatusSnapshot> {
  const response = await fetch(url, {
    ...(freshSeconds > 0
      ? { cache: "force-cache" as const, next: { revalidate: freshSeconds } }
      : { cache: "no-store" as const }),
    headers: {
      Accept: "application/json",
      ...(freshSeconds === 0 ? { "Cache-Control": "no-cache" } : {}),
    },
    signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
  });

  if (!response.ok) {
    const diagnostics = [
      `http_${response.status}`,
      `cf_mitigated_${response.headers.get("cf-mitigated") ?? "none"}`,
      `content_type_${response.headers.get("content-type") ?? "unknown"}`,
    ];
    throw new Error(diagnostics.join(";"));
  }

  // A cached Spotify progress value belongs to the upstream response time,
  // rather than the time this route happens to serve the cached body.
  const sourceTime = Date.parse(response.headers.get("date") ?? "");
  return {
    status: (await response.json()) as unknown,
    updatedAt: Number.isFinite(sourceTime)
      ? Math.min(sourceTime, Date.now())
      : Date.now(),
  };
}

// The persistent fetch cache also works across server instances. This local
// promise coalesces simultaneous cache misses; lastStatus covers upstream errors.
export function createStatusHandler({
  name,
  key,
  url,
  freshSeconds,
}: StatusService) {
  let lastStatus: unknown = null;
  let lastUpdatedAt = 0;
  let pending: Promise<StatusSnapshot> | null = null;

  return async function GET() {
    try {
      pending ??= fetchStatus(url, freshSeconds).finally(() => {
        pending = null;
      });
      const { status, updatedAt } = await pending;
      if (status !== null) {
        lastStatus = status;
        lastUpdatedAt = updatedAt;
      }

      return Response.json(
        { [key]: status, error: null, updatedAt },
        {
          headers:
            freshSeconds > 0
              ? statusCacheHeaders(freshSeconds)
              : NO_STORE_HEADERS,
        },
      );
    } catch (error) {
      console.error(`${name} status request failed`, error);
      return Response.json(
        {
          [key]: lastStatus,
          error:
            lastStatus === null
              ? `${name} status is temporarily unavailable`
              : null,
          updatedAt: lastUpdatedAt,
        },
        // Do not let an outage populate the shared cache with an empty widget.
        { headers: NO_STORE_HEADERS },
      );
    }
  };
}
