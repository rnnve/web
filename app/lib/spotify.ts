import { isRecord, readNumber, readString } from "./json";
import type { SpotifyView } from "./status-types";

function readArtistName(artist: unknown): string {
  if (typeof artist === "string") return artist;
  if (isRecord(artist)) return readString(artist, "name");
  return "";
}

function firstRecord(...values: unknown[]) {
  return values.find(isRecord);
}

export function normalizeSpotify(value: unknown): SpotifyView {
  const envelope = isRecord(value) ? value : {};
  const root = isRecord(envelope.data) ? envelope.data : envelope;
  const isPlaying =
    (root.isPlaying ?? root.is_playing ?? root.playing) === true;
  if (!isPlaying) {
    return {
      isPlaying: false,
      title: "Nothing is playing",
      artist: "",
      album: "",
      artwork: "",
      progress: 0,
      duration: 0,
      url: "",
      device: null,
    };
  }

  // Providers expose the same track under different keys. Earlier keys win.
  const track = firstRecord(root.track, root.item, root.song) ?? root;
  const album = firstRecord(track.album, root.album);
  const images = Array.isArray(album?.images) ? album.images : [];
  const firstImage = firstRecord(images[0]);
  const trackImages = firstRecord(track.images, root.images);
  const rawArtists = Array.isArray(track.artists)
    ? track.artists
    : Array.isArray(root.artists)
      ? root.artists
      : [];
  const artists = rawArtists.map(readArtistName).filter(Boolean);
  const external = firstRecord(track.external_urls, root.external_urls);
  const rawDevice = firstRecord(root.device, track.device);
  const deviceName = readString(rawDevice, "name");
  const deviceType = readString(rawDevice, "type");

  return {
    isPlaying,
    title: readString(track, "name", "title", "track") || "Nothing playing",
    artist:
      artists.join(", ") ||
      readString(root, "artist", "artists") ||
      readString(track, "artist") ||
      "Spotify is quiet right now",
    album:
      readString(album, "name", "title") ||
      readString(track, "album") ||
      readString(root, "album"),
    artwork:
      readString(root, "albumImageUrl") ||
      readString(firstImage, "url") ||
      readString(root, "albumArt", "albumImage", "artwork", "image", "cover") ||
      readString(
        track,
        "albumImageUrl",
        "albumArt",
        "artwork",
        "image",
        "cover",
      ) ||
      readString(trackImages, "large", "medium", "small"),
    progress: readNumber(root, "progressMs", "progress_ms", "progress"),
    duration:
      readNumber(track, "durationMs", "duration_ms", "duration") ||
      readNumber(root, "durationMs", "duration_ms", "duration"),
    url:
      readString(external, "spotify") ||
      readString(track, "url", "spotifyUrl", "externalUrl") ||
      readString(root, "url", "spotifyUrl", "externalUrl"),
    device:
      deviceName || deviceType
        ? { name: deviceName || deviceType, type: deviceType }
        : null,
  };
}
