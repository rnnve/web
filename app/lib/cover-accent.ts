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
  const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
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
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        cache: "force-cache",
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) return DEFAULT_SITE_ACCENT;
      bitmap = await createImageBitmap(await response.blob());
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 48;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return DEFAULT_SITE_ACCENT;
      context.drawImage(bitmap, 0, 0, 48, 48);
      return accentFromPixels(context.getImageData(0, 0, 48, 48).data);
    } catch {
      return DEFAULT_SITE_ACCENT;
    } finally {
      bitmap?.close();
    }
  })();
  covers.set(url, result);
  if (covers.size > 24) covers.delete(covers.keys().next().value!);
  return result;
}
