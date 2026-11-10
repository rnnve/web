export const DEFAULT_SITE_ACCENT = "#ededed";

export function interpolateAccent(from: string, to: string, progress: number) {
  const start = /^#[a-f\d]{6}$/i.test(from) ? from : DEFAULT_SITE_ACCENT;
  const amount = Math.max(0, Math.min(1, progress));
  return `#${[1, 3, 5]
    .map((offset) => {
      const a = parseInt(start.slice(offset, offset + 2), 16);
      const b = parseInt(to.slice(offset, offset + 2), 16);
      return Math.round(a + (b - a) * amount)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}

function luminance(rgb: number[]) {
  const linear = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function accentFromPixels(pixels: ArrayLike<number>): string {
  const buckets = new Map<number, { count: number; sum: number[] }>();
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = ((rgb[0] >> 5) << 6) | ((rgb[1] >> 5) << 3) | (rgb[2] >> 5);
    const bucket = buckets.get(key) ?? { count: 0, sum: [0, 0, 0] };
    bucket.count++;
    rgb.forEach((value, channel) => (bucket.sum[channel] += value));
    buckets.set(key, bucket);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.count - a.count);
  const total = ranked.reduce((sum, bucket) => sum + bucket.count, 0);
  const saturation = (bucket: { count: number; sum: number[] }) => {
    const rgb = bucket.sum.map((value) => value / bucket.count);
    const max = Math.max(...rgb);
    return max ? (max - Math.min(...rgb)) / max : 0;
  };
  // Ignore neutral borders and shadows when the cover has a meaningful color.
  const colored = ranked
    .filter(
      (bucket) =>
        bucket.count >= Math.max(1, total * 0.01) &&
        saturation(bucket) >= 0.2 &&
        Math.max(...bucket.sum.map((value) => value / bucket.count)) >= 48,
    )
    .sort((a, b) => b.count * saturation(b) - a.count * saturation(a));
  const dominant = colored[0] ?? ranked[0];
  if (!dominant) return DEFAULT_SITE_ACCENT;
  const rgb = dominant.sum.map((value) => value / dominant.count);
  if (Math.max(...rgb) < 48) return DEFAULT_SITE_ACCENT;

  // Lift dark colors while retaining their hue, for legible ink on the dark site.
  const background = luminance([18, 18, 18]);
  const mix = (amount: number) =>
    rgb.map((value) => Math.round(value + (255 - value) * amount));
  let low = 0;
  let high = 1;
  if ((luminance(rgb) + 0.05) / (background + 0.05) >= 4.8) high = 0;
  else {
    for (let step = 0; step < 12; step++) {
      const middle = (low + high) / 2;
      if ((luminance(mix(middle)) + 0.05) / (background + 0.05) >= 4.8)
        high = middle;
      else low = middle;
    }
  }
  return `#${mix(high)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

const covers = new Map<string, Promise<string>>();

export function coverAccent(url: string): Promise<string> {
  const cached = covers.get(url);
  if (cached) return cached;
  const result = (async () => {
    let bitmap: ImageBitmap | undefined;
    let objectUrl: string | undefined;
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        cache: "force-cache",
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error("Artwork unavailable");
      const blob = await response.blob();
      if (typeof createImageBitmap === "function") {
        try {
          bitmap = await createImageBitmap(blob);
        } catch {
          // Some browsers cannot decode every artwork format as a bitmap.
        }
      }
      let source: CanvasImageSource;
      if (bitmap) source = bitmap;
      else {
        const artwork = new Image();
        objectUrl = URL.createObjectURL(blob);
        artwork.src = objectUrl;
        await artwork.decode();
        source = artwork;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 48;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(source, 0, 0, 48, 48);
      return accentFromPixels(context.getImageData(0, 0, 48, 48).data);
    } catch {
      covers.delete(url);
      return DEFAULT_SITE_ACCENT;
    } finally {
      bitmap?.close();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  })();
  covers.set(url, result);
  if (covers.size > 24) covers.delete(covers.keys().next().value!);
  return result;
}
