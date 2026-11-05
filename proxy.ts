import { NextResponse, type NextRequest } from "next/server";
import { htmlToMarkdown, prefersMarkdown, readHtml } from "./app/lib/markdown";

export async function proxy(request: NextRequest) {
  const next = () => {
    const response = NextResponse.next();
    response.headers.set("Vary", "Accept");
    return response;
  };

  if (
    !["GET", "HEAD"].includes(request.method) ||
    request.headers.has("rsc") ||
    request.headers.has("next-router-prefetch") ||
    request.nextUrl.searchParams.has("_rsc") ||
    !prefersMarkdown(request.headers.get("accept"))
  )
    return next();

  try {
    // Request the same public page as HTML. The explicit Accept header prevents recursion.
    // Do not forward router, conditional-cache, or user-supplied internal headers.
    const source = await fetch(request.url, {
      headers: { Accept: "text/html" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if (
      !source.ok ||
      !source.headers.get("content-type")?.includes("text/html")
    ) {
      await source.body?.cancel();
      return next();
    }
    const publicUrl = request.nextUrl.clone();
    publicUrl.host = request.headers.get("host") ?? publicUrl.host;
    const markdown = htmlToMarkdown(await readHtml(source), publicUrl.href);
    const headers = new Headers({
      "Content-Type": "text/markdown; charset=utf-8",
      // Keep negotiated responses out of shared caches that may ignore custom Vary values.
      "Cache-Control": "private, no-store",
      Vary: [
        ...new Set([
          ...(source.headers.get("vary") ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          "Accept",
        ]),
      ].join(", "),
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of [
      "content-language",
      "content-security-policy",
      "strict-transport-security",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
    ]) {
      const value = source.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(request.method === "HEAD" ? null : markdown, {
      headers,
    });
  } catch {
    // If conversion is unavailable, preserve the page rather than failing browser navigation.
    return next();
  }
}

export const config = {
  matcher: ["/", "/birthday", "/listen", "/ask", "/newtab"],
};
