"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  BookOpen01Icon,
  ComputerIcon,
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
  "/docs/getting-started": Rocket01Icon,
  "/docs/desktop": ComputerIcon,
  "/docs/customization": PaintBoardIcon,
};

function labelOf(node: PageTree.Node): string {
  return typeof node.name === "string" ? node.name : "Page";
}

function pagesFromNodes(nodes: PageTree.Node[]): BranchedMenuLeaf[] {
  const pages: BranchedMenuLeaf[] = [];
  for (const node of nodes) {
    if (node.type === "page") {
      pages.push({
        value: node.url,
        label: labelOf(node),
        icon: PAGE_ICONS[node.url],
      });
      continue;
    }
    if (node.type === "folder") {
      pages.push(...pagesFromNodes(node.children));
    }
  }
  return pages;
}

function itemsFromTree(root: PageTree.Root): BranchedMenuItem[] {
  const folders = root.children.filter(
    (node): node is PageTree.Folder => node.type === "folder",
  );
  const loosePages = root.children.filter(
    (node): node is PageTree.Item => node.type === "page",
  );

  const items: BranchedMenuItem[] = folders.map((folder) => ({
    label: labelOf(folder),
    children: pagesFromNodes(folder.children),
  }));

  if (loosePages.length > 0) {
    items.unshift({
      label: typeof root.name === "string" ? root.name : "Docs",
      children: loosePages.map((page) => ({
        value: page.url,
        label: labelOf(page),
        icon: PAGE_ICONS[page.url],
      })),
    });
  }

  return items.filter(
    (item) =>
      !("children" in item) ||
      (Array.isArray(item.children) && item.children.length > 0),
  );
}

function resolveActive(items: BranchedMenuItem[], pathname: string): string {
  for (const item of items) {
    if (!("children" in item) || !item.children) continue;
    const exact = item.children.find((child) => child.value === pathname);
    if (exact) return exact.value;
    const nested = item.children.find((child) =>
      pathname.startsWith(`${child.value}/`),
    );
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
