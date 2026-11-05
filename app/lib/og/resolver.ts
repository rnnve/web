export const SITE_URL = "https://rynni.cc";
export const SITE_NAME = "Rynnie";

export type PageContent = {
  title: string;
  description: string;
  category?: string;
  type?: "website" | "article";
  tags?: readonly string[];
};

export type PublicPageRoute = {
  pattern: string;
  // Dynamic routes should reuse their existing public content loader here.
  load: (
    params: Record<string, string>,
  ) => PageContent | null | Promise<PageContent | null>;
};

export const HOME_CONTENT: PageContent = {
  title: "rynnie",
  description: "Ryn's personal site.",
};

// One source for the existing page metadata and the generated images.
// Only explicitly registered public content is accessible to the image endpoint.
export const PUBLIC_PAGES: readonly PublicPageRoute[] = [
  { pattern: "/", load: () => HOME_CONTENT },
  {
    pattern: "/birthday",
    load: () => ({
      title: "Birthday · Rynnie",
      description: "Counting down to Rynnie’s next birthday on December 31.",
    }),
  },
  {
    pattern: "/listen",
    load: () => ({
      title: "Listening · Rynnie",
      description: "A little look at what Rynnie has been listening to.",
    }),
  },
  {
    pattern: "/ask",
    load: () => ({
      title: "Ask · Rynnie",
      description: "Send Rynnie an anonymous question.",
    }),
  },
  {
    pattern: "/newtab",
    load: () => ({
      title: "New tab",
      description:
        "A quiet place to start. Your time, search, and favorite links.",
    }),
  },
];

export function normalizePagePath(value: string): string | null {
  if (value.length > 1024 || !value.startsWith("/") || value.startsWith("//"))
    return null;
  let path: string;
  try {
    path = decodeURIComponent(value);
  } catch {
    return null;
  }
  // Reject URLs, queries, traversal, backslashes, control characters, and double encoding.
  if (/[%?#\\\u0000-\u0020\u007f]/u.test(path) || path.includes("//"))
    return null;
  if (path.split("/").some((segment) => segment === "." || segment === ".."))
    return null;
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function matchRoute(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const expected = pattern.split("/");
  const actual = path.split("/");
  if (expected.length !== actual.length) return null;
  const params: Record<string, string> = Object.create(null);
  for (let index = 0; index < expected.length; index++) {
    const segment = expected[index];
    const parameter = /^\[([a-zA-Z][a-zA-Z0-9_]*)\]$/.exec(segment);
    if (parameter) {
      if (!actual[index]) return null;
      params[parameter[1]] = actual[index];
    } else if (segment !== actual[index]) return null;
  }
  return params;
}

export async function resolvePageContent(
  pathname: string,
  routes: readonly PublicPageRoute[] = PUBLIC_PAGES,
): Promise<{ path: string; content: PageContent; found: boolean }> {
  const path = normalizePagePath(pathname);
  if (path) {
    // Exact routes win over parameterized routes, independent of registration order.
    const candidates = [...routes].sort(
      (a, b) =>
        Number(a.pattern.includes("[")) - Number(b.pattern.includes("[")),
    );
    for (const route of candidates) {
      const params = matchRoute(route.pattern, path);
      if (!params) continue;
      try {
        const content = await route.load(params);
        if (content) return { path, content, found: true };
      } catch {
        // A failed public content source must not break metadata or expose its error.
        break;
      }
    }
  }
  // Never echo unknown paths or query values into the fallback image.
  return { path: "/", content: HOME_CONTENT, found: false };
}
