"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  BookOpen01Icon,
  CodeIcon,
  ComputerIcon,
  InformationCircleIcon,
  PaintBoardIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import BranchedMenu, {
  type BranchedMenuItem,
  type BranchedMenuLeaf,
} from "./branched-menu";

const PAGE_ICONS: Record<string, IconSvgElement> = {
  "/docs": BookOpen01Icon,
  "/docs/introduction": InformationCircleIcon,
  "/docs/introduction/development": CodeIcon,
  "/docs/getting-started": Rocket01Icon,
  "/docs/desktop": ComputerIcon,
  "/docs/customization": PaintBoardIcon,
};

function labelOf(node: PageTree.Node): string {
  return typeof node.name === "string" ? node.name : "Page";
}

function leafFromPage(page: PageTree.Item): BranchedMenuLeaf {
  return {
    value: page.url,
    label: labelOf(page),
    icon: PAGE_ICONS[page.url],
  };
}

function pagesFromNodes(nodes: PageTree.Node[]): BranchedMenuLeaf[] {
  const pages: BranchedMenuLeaf[] = [];
  for (const node of nodes) {
    if (node.type === "page") {
      pages.push(leafFromPage(node));
      continue;
    }
    if (node.type === "folder") {
      pages.push(...pagesFromFolder(node));
    }
  }
  return pages;
}

function pagesFromFolder(folder: PageTree.Folder): BranchedMenuLeaf[] {
  const pages = pagesFromNodes(folder.children);
  if (
    folder.index &&
    !pages.some((page) => page.value === folder.index!.url)
  ) {
    pages.unshift(leafFromPage(folder.index));
  }
  return pages;
}

function itemsFromTree(
  tree: PageTree.Root | PageTree.Folder,
): BranchedMenuItem[] {
  const items: BranchedMenuItem[] = [];
  let sectionLabel: string | null = null;
  let sectionPages: BranchedMenuLeaf[] = [];

  const flushSection = () => {
    if (sectionPages.length === 0) {
      sectionLabel = null;
      return;
    }
    items.push({
      label: sectionLabel ?? "Pages",
      children: sectionPages,
    });
    sectionLabel = null;
    sectionPages = [];
  };

  for (const node of tree.children) {
    if (node.type === "separator") {
      flushSection();
      sectionLabel = labelOf(node) || "Pages";
      continue;
    }

    if (node.type === "folder") {
      flushSection();
      const children = pagesFromFolder(node);
      if (children.length > 0) {
        items.push({
          label: labelOf(node),
          children,
        });
      }
      continue;
    }

    if (node.type === "page") {
      if (!sectionLabel) sectionLabel = "Pages";
      sectionPages.push(leafFromPage(node));
    }
  }

  flushSection();
  return items;
}

function resolveActive(items: BranchedMenuItem[], pathname: string): string {
  for (const item of items) {
    if (!("children" in item) || !item.children) continue;
    const exact = item.children.find((child) => child.value === pathname);
    if (exact) return exact.value;
    const nested = [...item.children]
      .sort((a, b) => b.value.length - a.value.length)
      .find((child) => pathname.startsWith(`${child.value}/`));
    if (nested) return nested.value;
  }
  return pathname;
}

export default function DocsBranchedNav({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { root } = useTreeContext();
  const items = itemsFromTree(root);
  const active = resolveActive(items, pathname);
  const defaultOpen = Math.max(
    0,
    items.findIndex(
      (item) =>
        "children" in item &&
        item.children?.some(
          (child) =>
            child.value === active || pathname.startsWith(`${child.value}/`),
        ),
    ),
  );

  if (items.length === 0) return null;

  return (
    <BranchedMenu
      className={className}
      items={items}
      defaultOpen={defaultOpen}
      defaultActive={active}
      active={active}
      onSelect={(value) => {
        if (value !== pathname) router.push(value);
      }}
      color="var(--color-fd-foreground)"
      accentColor="var(--color-fd-primary)"
      lineColor="#3f3f46"
      width={240}
      rowHeight={36}
      indent={40}
      trunk={14}
      radius={10}
      lineWidth={1.5}
      fontSize={14}
      drawDuration={400}
      foldDuration={300}
    />
  );
}
