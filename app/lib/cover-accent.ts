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

function paletteCandidate(pixels: ArrayLike<number>) {
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
  if (!dominant) return null;
  return {
    rgb: dominant.sum.map((value) => value / dominant.count),
    coverage: dominant.count / total,
    saturation: saturation(dominant),
  };
}

function readableAccent(rgb: number[] | undefined): string {
  if (!rgb || Math.max(...rgb) < 48) return DEFAULT_SITE_ACCENT;

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

export function accentFromPixels(pixels: ArrayLike<number>): string {
  return readableAccent(paletteCandidate(pixels)?.rgb);
}

export function accentFromArtwork(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
): string {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    pixels.length < width * height * 4
  )
    return DEFAULT_SITE_ACCENT;

  // Sample patches rather than single pixels, so borders and noise do not win.
  const patchWidth = Math.max(1, Math.floor(width / 3));
  const patchHeight = Math.max(1, Math.floor(height / 3));
  const positions = [
    [width - patchWidth, 0],
    [0, 0],
    [0, height - patchHeight],
    [width - patchWidth, height - patchHeight],
    [
      Math.floor((width - patchWidth) / 2),
      Math.floor((height - patchHeight) / 2),
    ],
  ];
  let best: number[] | undefined;
  let bestScore = -1;
  const background = luminance([18, 18, 18]);
  for (const [left, top] of positions) {
    const region: number[] = [];
    for (let y = top; y < top + patchHeight; y++) {
      for (let x = left; x < left + patchWidth; x++) {
        const index = (y * width + x) * 4;
        region.push(
          pixels[index],
          pixels[index + 1],
          pixels[index + 2],
          pixels[index + 3],
        );
      }
    }
    const candidate = paletteCandidate(region);
    if (!candidate || Math.max(...candidate.rgb) < 48) continue;
    const contrast = (luminance(candidate.rgb) + 0.05) / (background + 0.05);
    // Prefer a vivid, representative patch that needs less brightening to read.
    const score =
      candidate.saturation * 0.5 +
      candidate.coverage * 0.3 +
      Math.min(1, contrast / 4.8) * 0.2;
    if (score > bestScore) {
      bestScore = score;
      best = candidate.rgb;
    }
  }
  return readableAccent(best);
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
      return accentFromArtwork(context.getImageData(0, 0, 48, 48).data, 48, 48);
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
