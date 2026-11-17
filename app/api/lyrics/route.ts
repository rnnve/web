import { isRecord } from "@/app/lib/json";
import { fetchSpicyLyrics } from "@/app/lib/spicy-lyrics";
import { fetchLrcRedLyrics } from "@/app/lib/lrc-red";
import { selectLyricsMatch, titleVariants } from "@/app/lib/lyrics-match";
import { setTimeout as delay } from "node:timers/promises";

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const title = input.get("track_name")?.trim();
  const artist = input.get("artist_name")?.trim();
  const album = input.get("album_name")?.trim();
  const duration = input.get("duration");
  const spotifyId = input.get("spotify_id");
  if (
    (spotifyId !== null && !/^[A-Za-z0-9]{22}$/.test(spotifyId)) ||
    !title ||
    !artist ||
    title.length > 500 ||
    artist.length > 500 ||
    (album && album.length > 500) ||
    (duration !== null &&
      (!Number.isFinite(Number(duration)) ||
        Number(duration) < 1 ||
        Number(duration) > 3600))
  ) {
    return Response.json(
      { error: "Provide a valid track title, artist, and duration." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  });
  if (album) params.set("album_name", album);
  if (duration !== null) params.set("duration", duration);

  try {
    const spicy = spotifyId ? await fetchSpicyLyrics(spotifyId) : null;
    if (spicy)
      return Response.json(
        { lyrics: spicy },
        { headers: { "Cache-Control": "public, max-age=86400" } },
      );
    const lrcRed = await fetchLrcRedLyrics({
      title,
      artist,
      album,
      ...(duration !== null ? { duration: Number(duration) } : {}),
    });
    if (lrcRed)
      return Response.json(
        { lyrics: lrcRed },
        { headers: { "Cache-Control": "public, max-age=86400" } },
      );
    let response = await fetch(`https://lrclib.net/api/get?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RynLyrics/0.1.0 (https://rynni.cc)",
      },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(10_000),
    });
    const exact = response.ok ? await response.clone().json() : null;
    const empty =
      isRecord(exact) &&
      exact.instrumental === false &&
      !(typeof exact.plainLyrics === "string" && exact.plainLyrics.trim()) &&
      !(typeof exact.syncedLyrics === "string" && exact.syncedLyrics.trim());
    if (response.status === 404 || empty) {
      const variants = titleVariants(title);
      const searchTitle = (variants[1] ?? variants[0])
        .normalize("NFKC")
        .replace(/[\u200b-\u200d\ufeff]/g, "");
      const searchParams = new URLSearchParams({
        track_name: searchTitle,
        artist_name: artist.split(",")[0].trim(),
      });
      for (let attempt = 0; attempt < 2; attempt++) {
        await delay(250);
        if (attempt) searchParams.delete("artist_name");
        response = await fetch(
          `https://lrclib.net/api/search?${searchParams}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "RynLyrics/0.1.0 (https://rynni.cc)",
            },
            next: { revalidate: 86_400 },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (!response.ok && response.status !== 404) break;
        const match = response.ok
          ? selectLyricsMatch(await response.json(), {
              title,
              artist,
              album: album ?? undefined,
              ...(duration !== null ? { duration: Number(duration) } : {}),
            })
          : null;
        if (match) {
          response = Response.json(match);
          break;
        }
        response = new Response(null, { status: 404 });
      }
    }
    if (response.status === 404) {
      return Response.json(
        { lyrics: null },
        { headers: { "Cache-Control": "public, max-age=300" } },
      );
    }
    if (response.status === 429 || response.status === 503) {
      const raw = response.headers.get("Retry-After");
      const seconds =
        raw && /^\d+$/.test(raw)
          ? Number(raw)
          : raw
            ? Math.ceil((Date.parse(raw) - Date.now()) / 1000)
            : 60;
      const retryAfter = Number.isFinite(seconds) ? Math.max(1, seconds) : 60;
      return Response.json(
        { error: "Lyrics are temporarily unavailable." },
        {
          status: response.status,
          headers: {
            "Retry-After": String(retryAfter),
            "Cache-Control": "no-store",
          },
        },
      );
    }
    if (!response.ok) throw new Error("Lyrics unavailable");
    const data: unknown = await response.json();
    if (
      !isRecord(data) ||
      typeof data.id !== "number" ||
      typeof data.instrumental !== "boolean"
    )
      throw new Error("Invalid lyrics");
    return Response.json(
      {
        lyrics: {
          id: data.id,
          instrumental: data.instrumental,
          plainLyrics:
            typeof data.plainLyrics === "string" ? data.plainLyrics : null,
          syncedLyrics:
            typeof data.syncedLyrics === "string" ? data.syncedLyrics : null,
        },
      },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch {
    return Response.json(
      { error: "Could not load lyrics. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
