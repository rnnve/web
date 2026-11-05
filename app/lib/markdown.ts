import TurndownService from "turndown";
import { createDocument } from "@mixmark-io/domino";

// Only an explicit Markdown preference opts in; browsers and */* keep HTML.
export function prefersMarkdown(accept: string | null): boolean {
  const preferences = (accept ?? "").split(",").map((entry) => {
    const [type, ...parameters] = entry.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) =>
      parameter.trim().startsWith("q="),
    );
    const value = quality ? Number(quality.trim().slice(2)) : 1;
    return {
      type: type.trim(),
      quality: Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0,
    };
  });
  const markdown = Math.max(
    0,
    ...preferences
      .filter(({ type }) => type === "text/markdown")
      .map(({ quality }) => quality),
  );
  const html = Math.max(
    0,
    ...preferences
      .filter(
        ({ type }) => type === "text/html" || type === "application/xhtml+xml",
      )
      .map(({ quality }) => quality),
  );
  return markdown > 0 && markdown >= html;
}

export function htmlToMarkdown(html: string, pageUrl: string): string {
  const document = createDocument(html);
  const content = document.querySelector("main") ?? document.body;
  // Use the actual document tree so head metadata and hydration payloads cannot leak into prose.
  content
    .querySelectorAll("[aria-hidden='true']")
    .forEach((node) => node.remove());
  const converter = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  const excludedTags = new Set([
    "HEAD",
    "SCRIPT",
    "STYLE",
    "NAV",
    "FOOTER",
    "FORM",
    "BUTTON",
    "SVG",
    "CANVAS",
    "VIDEO",
    "AUDIO",
    "NOSCRIPT",
    "TEMPLATE",
  ]);
  converter.addRule("omitInterface", {
    filter: (node) =>
      excludedTags.has(node.nodeName.toUpperCase()) ||
      node.classList.contains("global-loader") ||
      node.hasAttribute("data-loading-overlay") ||
      node.getAttribute("role") === "tooltip" ||
      (node.getAttribute("aria-hidden") === "true" &&
        !node.classList.contains("page-transition-content")),
    replacement: () => "",
  });
  converter.addRule("absoluteLinks", {
    filter: (node) => node.nodeName === "A" && node.hasAttribute("href"),
    replacement: (content, node) => {
      try {
        const href = new URL(node.getAttribute("href")!, pageUrl);
        if (!["https:", "http:", "mailto:", "tel:"].includes(href.protocol))
          return content;
        return `[${content || href.href}](<${href.href}>)`;
      } catch {
        return content;
      }
    },
  });
  const metadata = [
    document.title && `title: ${JSON.stringify(document.title)}`,
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") &&
      `description: ${JSON.stringify(document.querySelector('meta[name="description"]')!.getAttribute("content"))}`,
  ].filter(Boolean);
  const frontmatter = metadata.length
    ? `---\n${metadata.join("\n")}\n---\n\n`
    : "";
  return `${frontmatter}${converter.turndown(content).trim()}\n`;
}

export async function readHtml(response: Response): Promise<string> {
  const limit = 6 * 1024 * 1024;
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error("HTML conversion limit exceeded");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}
