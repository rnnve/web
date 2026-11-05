import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import OGTemplate from "../../components/og/og-template";
import {
  HOME_CONTENT,
  normalizePagePath,
  resolvePageContent,
} from "../../lib/og/resolver";

export const runtime = "nodejs";

// Local fonts are read once per server instance; no request can choose a file or URL.
const fonts = Promise.all([
  readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf",
    ),
  ),
  readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf",
    ),
  ),
])
  .then(([regular, bold]) => [
    {
      name: "Geist",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ])
  .catch(() => []);

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const requestedPath = query.get("path") ?? "/";
  const valid =
    query.getAll("path").length <= 1 &&
    [...query.keys()].every((key) => key === "path") &&
    normalizePagePath(requestedPath) !== null;

  try {
    const resolved = valid
      ? await resolvePageContent(requestedPath)
      : { path: "/", content: HOME_CONTENT, found: false };
    const image = new ImageResponse(
      <OGTemplate content={resolved.content} path={resolved.path} />,
      {
        width: 1200,
        height: 630,
        fonts: await fonts,
      },
    );
    // Consume the stream here so rendering failures reach the fallback instead of returning a broken PNG.
    const png = await image.arrayBuffer();
    return new Response(png, {
      status: valid ? 200 : 400,
      headers: {
        "Content-Type": "image/png",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": !valid
          ? "no-store"
          : resolved.found
            ? "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
            : "public, max-age=0, s-maxage=60",
      },
    });
  } catch {
    // Keep a branded PNG available even if a content loader or custom font fails.
    const fallback = new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#121212",
          color: "#eeeeee",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700 }}>
          Rynnie.
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 24 }}>
          {HOME_CONTENT.description}
        </div>
      </div>,
      { width: 1200, height: 630 },
    );
    return new Response(await fallback.arrayBuffer(), {
      status: valid ? 200 : 400,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
