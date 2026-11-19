"use client";

import { useEffect } from "react";

type Family = "JP" | "SC" | "TC" | "KR";
const loaders = {
  JP: () => import("../../font-cjk-jp.css"),
  SC: () => import("../../font-cjk-sc.css"),
  TC: () => import("../../font-cjk-tc.css"),
  KR: () => import("../../font-cjk-kr.css"),
};
const cjkText =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}\u3000-\u303f]/u;

function familyOrder(element: Element | null): Family[] {
  const lang =
    element?.closest("[lang]")?.getAttribute("lang")?.toLowerCase() ?? "";
  if (/^ko(?:-|$)/.test(lang)) return ["KR", "JP", "SC", "TC"];
  if (/^zh(?:-|$)/.test(lang)) {
    return /^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(lang)
      ? ["TC", "JP", "SC", "KR"]
      : ["SC", "JP", "TC", "KR"];
  }
  return ["JP", "SC", "TC", "KR"];
}

/** Load only the font families needed by the text, preserving the full fallback order. */
export default function DeferredFonts() {
  useEffect(() => {
    let active = true;
    const pending = new Map<Family, Promise<void>>();
    const coverage = new Map<Family, (point: number) => boolean>();
    const seen = new Set<string>();
    const load = (family: Family) => {
      let promise = pending.get(family);
      if (!promise) {
        promise = loaders[family]()
          .then(() => {
            const ranges: [number, number][] = [];
            for (const face of document.fonts) {
              if (
                face.family.replace(/["']/g, "") !==
                `Noto Sans ${family} Variable`
              )
                continue;
              for (const range of face.unicodeRange.split(",")) {
                const [start, end] = range
                  .trim()
                  .replace(/^U\+/i, "")
                  .split("-");
                ranges.push([
                  parseInt(start.replaceAll("?", "0"), 16),
                  parseInt((end ?? start).replaceAll("?", "F"), 16),
                ]);
              }
            }
            ranges.sort((a, b) => a[0] - b[0]);
            const merged: [number, number][] = [];
            for (const range of ranges) {
              const previous = merged.at(-1);
              if (previous && range[0] <= previous[1] + 1)
                previous[1] = Math.max(previous[1], range[1]);
              else merged.push([...range]);
            }
            coverage.set(family, (point) => {
              let left = 0;
              let right = merged.length - 1;
              while (left <= right) {
                const middle = (left + right) >>> 1;
                const [start, end] = merged[middle];
                if (point < start) right = middle - 1;
                else if (point > end) left = middle + 1;
                else return true;
              }
              return false;
            });
          })
          .catch((error) => {
            pending.delete(family);
            throw error;
          });
        pending.set(family, promise);
      }
      return promise;
    };
    const loadForText = (node: Node) => {
      const text = node.textContent;
      if (!text || !cjkText.test(text)) return;
      const families = familyOrder(node.parentElement);
      const points = [
        ...new Set(
          [...text]
            .filter((character) => cjkText.test(character))
            .map((character) => character.codePointAt(0)!),
        ),
      ];
      const key = `${families.join("")}:${points.join(",")}`;
      if (seen.has(key)) return;
      if (seen.size > 256) seen.clear();
      seen.add(key);
      void (async () => {
        let remaining = points;
        for (const family of families) {
          if (!active || !remaining.length) return;
          await load(family);
          remaining = remaining.filter(
            (point) => !coverage.get(family)?.(point),
          );
        }
      })().catch(() => seen.delete(key));
    };
    const scan = (node: Node) => {
      if (node.parentElement?.closest("script, style, noscript")) return;
      if (node.nodeType === Node.TEXT_NODE) {
        loadForText(node);
        return;
      }
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const text = walker.currentNode;
        if (!text.parentElement?.closest("script, style, noscript"))
          loadForText(text);
      }
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData" || record.type === "attributes")
          scan(record.target);
        else for (const node of record.addedNodes) scan(node);
      }
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["lang"],
    });
    scan(document.body);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  return null;
}
