"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  BookOpen01Icon,
  CodeIcon,
  ComputerIcon,
  InformationCircleIcon,
  Layers01Icon,
  PaintBoardIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import BranchedMenu, {
  collectLeaves,
  pathsToActive,
  type BranchedMenuBranch,
  type BranchedMenuItem,
  type BranchedMenuLeaf,
  type BranchedMenuNode,
} from "./branched-menu";

const PAGE_ICONS: Record<string, IconSvgElement> = {
  "/docs": BookOpen01Icon,
  "/docs/introduction": InformationCircleIcon,
  "/docs/introduction/development": CodeIcon,
  "/docs/getting-started": Rocket01Icon,
  "/docs/desktop": ComputerIcon,
  "/docs/customization": PaintBoardIcon,
  "/docs/components": Layers01Icon,
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

function folderHasSeparators(folder: PageTree.Folder): boolean {
  return folder.children.some((node) => node.type === "separator");
}

/**
 * One top-level section (e.g. Components) with:
 *   Intro (catalog) + nested groups (UI, Layout, …) each holding pages.
 */
function itemsFromSeparatedFolder(folder: PageTree.Folder): BranchedMenuItem[] {
  const children: BranchedMenuNode[] = [];
  let groupLabel: string | null = null;
  let groupPages: BranchedMenuLeaf[] = [];

  const flushGroup = () => {
    if (groupPages.length === 0) {
      groupLabel = null;
      return;
    }
    children.push({
      label: groupLabel ?? "Group",
      children: groupPages,
    });
    groupLabel = null;
    groupPages = [];
  };

  let intro: BranchedMenuLeaf | null = null;
  if (folder.index) {
    intro = {
      ...leafFromPage(folder.index),
      label: "Intro",
    };
  } else {
    const first = folder.children.find(
      (node): node is PageTree.Item => node.type === "page",
    );
    if (first) {
      intro = { ...leafFromPage(first), label: "Intro" };
    }
  }
  if (intro) children.push(intro);

  for (const node of folder.children) {
    if (node.type === "separator") {
      flushGroup();
      groupLabel = labelOf(node) || "Group";
      continue;
    }

    if (node.type === "page") {
      if (intro && node.url === intro.value) continue;
      if (!groupLabel) groupLabel = labelOf(folder);
      groupPages.push(leafFromPage(node));
      continue;
    }

    if (node.type === "folder") {
      flushGroup();
      const nested = itemsFromFolder(node);
      children.push(...nested);
    }
  }

  flushGroup();

  const section: BranchedMenuBranch = {
    label: labelOf(folder),
    children,
  };
  return [section];
}

function itemsFromFolder(folder: PageTree.Folder): BranchedMenuItem[] {
  if (folderHasSeparators(folder)) {
    return itemsFromSeparatedFolder(folder);
  }

  const children = pagesFromFolder(folder);
  if (children.length === 0) return [];
  return [
    {
      label: labelOf(folder),
      children,
    },
  ];
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
      items.push(...itemsFromFolder(node));
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
  const leaves = collectLeaves(items);
  const exact = leaves.find((child) => child.value === pathname);
  if (exact) return exact.value;
  const nested = [...leaves]
    .sort((a, b) => b.value.length - a.value.length)
    .find((child) => pathname.startsWith(`${child.value}/`));
  if (nested) return nested.value;
  return pathname;
}

export default function DocsBranchedNav({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { root } = useTreeContext();
  const items = itemsFromTree(root);
  const active = resolveActive(items, pathname);
  const defaultOpen = pathsToActive(items, active);

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
