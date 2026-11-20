"use client";

import {
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import "./branched-menu.css";

export type BranchedMenuLeaf = {
  value: string;
  label: string;
  icon?: IconSvgElement | ReactElement;
};

export type BranchedMenuBranch = {
  label: string;
  value?: string;
  children: BranchedMenuNode[];
};

export type BranchedMenuNode = BranchedMenuLeaf | BranchedMenuBranch;

/** @deprecated Prefer BranchedMenuBranch — kept for existing call sites. */
export type BranchedMenuSection = BranchedMenuBranch;

export type BranchedMenuItem = BranchedMenuNode;

export type BranchedMenuProps = {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[] | string | string[];
  defaultActive?: string;
  /** When set, highlights this value instead of internal selection state. */
  active?: string;
  onSelect?: (value: string, item: BranchedMenuLeaf | BranchedMenuItem) => void;
  onToggle?: (path: string, open: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
};

const PAD = 6;
const MARK = 16;

export function isBranch(
  item: BranchedMenuNode,
): item is BranchedMenuBranch {
  return Array.isArray((item as BranchedMenuBranch).children);
}

export function isLeaf(item: BranchedMenuNode): item is BranchedMenuLeaf {
  return !isBranch(item);
}

function renderIcon(icon: IconSvgElement | ReactElement): ReactNode {
  return isValidElement(icon) ? (
    icon
  ) : (
    <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
  );
}

function toOpenSet(open: number | number[] | string | string[]): Set<string> {
  if (Array.isArray(open)) {
    return new Set(open.map(String));
  }
  if (typeof open === "number") {
    return open >= 0 ? new Set([String(open)]) : new Set();
  }
  return open ? new Set([open]) : new Set();
}

function childPath(parent: string, index: number): string {
  return parent ? `${parent}.${index}` : String(index);
}

export function collectLeaves(nodes: BranchedMenuNode[]): BranchedMenuLeaf[] {
  const leaves: BranchedMenuLeaf[] = [];
  for (const node of nodes) {
    if (isLeaf(node)) leaves.push(node);
    else leaves.push(...collectLeaves(node.children));
  }
  return leaves;
}

/** Paths of every branch that contains the active leaf, outermost first. */
export function pathsToActive(
  nodes: BranchedMenuNode[],
  active: string,
  parent = "",
): string[] {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const path = childPath(parent, i);
    if (isLeaf(node)) {
      if (node.value === active) return [];
      continue;
    }
    if (collectLeaves(node.children).some((leaf) => leaf.value === active)) {
      return [path, ...pathsToActive(node.children, active, path)];
    }
  }
  return [];
}

function allLeavesAreDirect(nodes: BranchedMenuNode[]): nodes is BranchedMenuLeaf[] {
  return nodes.every(isLeaf);
}

type BranchViewProps = {
  nodes: BranchedMenuNode[];
  path: string;
  active: string;
  open: Set<string>;
  depth: number;
  rowHeight: number;
  indent: number;
  trunk: number;
  radius: number;
  onToggle: (path: string) => void;
  onSelect: (value: string, item: BranchedMenuLeaf) => void;
  heads: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  headIndex: number;
};

function LeafList({
  leaves,
  active,
  open,
  rowHeight,
  indent,
  trunk,
  radius,
  onSelect,
}: {
  leaves: BranchedMenuLeaf[];
  active: string;
  open: boolean;
  rowHeight: number;
  indent: number;
  trunk: number;
  radius: number;
  onSelect: (value: string, item: BranchedMenuLeaf) => void;
}) {
  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) =>
    `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) =>
    `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) =>
    rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);
  const bodyH = PAD * 2 + leaves.length * rowHeight;

  return (
    <div className="branched-menu__tree" style={{ height: bodyH }}>
      <svg
        className="branched-menu__lines"
        width={indent}
        height={bodyH}
        aria-hidden="true"
      >
        <path
          className="branched-menu__base"
          d={`M ${trunk} 0 V ${rowY(leaves.length - 1) - r}`}
        />
        {leaves.map((kid, k) => (
          <path key={kid.value} className="branched-menu__base" d={branch(k)} />
        ))}
        {leaves.map((kid, k) => (
          <path
            key={`${kid.value}-reach`}
            className="branched-menu__reach"
            d={reach(k)}
            style={{
              strokeDasharray: length(k),
              strokeDashoffset: kid.value === active ? 0 : length(k),
            }}
          />
        ))}
      </svg>
      {leaves.map((kid) => (
        <button
          key={kid.value}
          type="button"
          className="branched-menu__item"
          aria-current={kid.value === active ? "true" : undefined}
          data-active={kid.value === active ? "" : undefined}
          tabIndex={open ? 0 : -1}
          onClick={() => onSelect(kid.value, kid)}
        >
          {kid.icon ? (
            <span className="branched-menu__icon" aria-hidden="true">
              {renderIcon(kid.icon)}
            </span>
          ) : null}
          <span className="branched-menu__label">{kid.label}</span>
        </button>
      ))}
    </div>
  );
}

function BranchChildren(props: BranchViewProps) {
  const {
    nodes,
    path,
    active,
    open,
    depth,
    rowHeight,
    indent,
    trunk,
    radius,
    onToggle,
    onSelect,
    heads,
    headIndex,
  } = props;

  if (allLeavesAreDirect(nodes)) {
    return (
      <LeafList
        leaves={nodes}
        active={active}
        open={path === "" || open.has(path) || depth === 0}
        rowHeight={rowHeight}
        indent={indent}
        trunk={trunk}
        radius={radius}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div className="branched-menu__nest" data-depth={depth}>
      {nodes.map((node, i) => {
        const nodePath = childPath(path, i);
        if (isLeaf(node)) {
          return (
            <button
              key={node.value}
              type="button"
              className="branched-menu__item branched-menu__item--nest"
              aria-current={node.value === active ? "true" : undefined}
              data-active={node.value === active ? "" : undefined}
              tabIndex={depth === 0 || open.has(path) ? 0 : -1}
              onClick={() => onSelect(node.value, node)}
            >
              {node.icon ? (
                <span className="branched-menu__icon" aria-hidden="true">
                  {renderIcon(node.icon)}
                </span>
              ) : null}
              <span className="branched-menu__label">{node.label}</span>
            </button>
          );
        }

        const isOpen = open.has(nodePath);
        const containsActive = collectLeaves(node.children).some(
          (leaf) => leaf.value === active,
        );
        return (
          <div
            key={nodePath}
            className="branched-menu__section branched-menu__section--nest"
            data-open={isOpen ? "" : undefined}
            data-depth={depth + 1}
          >
            <button
              type="button"
              className="branched-menu__head branched-menu__head--nest"
              aria-expanded={isOpen}
              data-active={containsActive && isOpen ? "" : undefined}
              tabIndex={depth === 0 || open.has(path) ? 0 : -1}
              onClick={() => onToggle(nodePath)}
            >
              {node.label}
            </button>
            <div className="branched-menu__body">
              <div className="branched-menu__fold">
                <BranchChildren
                  nodes={node.children}
                  path={nodePath}
                  active={active}
                  open={open}
                  depth={depth + 1}
                  rowHeight={rowHeight}
                  indent={indent}
                  trunk={trunk}
                  radius={radius}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  heads={heads}
                  headIndex={headIndex}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BranchedMenu({
  items = [],
  defaultOpen = 0,
  defaultActive = "",
  active: activeProp,
  onSelect,
  onToggle,
  color = "#f5f5f5",
  accentColor = "#f5f5f5",
  lineColor = "#3f3f46",
  width = 240,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 400,
  foldDuration = 300,
  className = "",
}: BranchedMenuProps) {
  const [activeState, setActive] = useState(() => {
    if (defaultActive) return defaultActive;
    const leaves = collectLeaves(items);
    return leaves[0]?.value ?? "";
  });
  const active = activeProp ?? activeState;
  const [open, setOpen] = useState(() => {
    const initial = toOpenSet(defaultOpen);
    for (const path of pathsToActive(items, active)) initial.add(path);
    return initial;
  });
  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);

  const activeTop = items.findIndex(
    (it) =>
      isBranch(it) &&
      collectLeaves(it.children).some((leaf) => leaf.value === active),
  );
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    const needed = pathsToActive(items, active);
    if (needed.some((path) => !open.has(path))) {
      const next = new Set(open);
      for (const path of needed) next.add(path);
      setOpen(next);
    }
  }
  const markerShown = activeTop >= 0 && open.has(String(activeTop));

  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const marker = markerRef.current;
      const el = heads.current[activeTop];
      if (!marker) return;
      const on = markerShown && el;
      if (!glide) marker.style.transition = "none";
      if (on) {
        marker.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      }
      marker.toggleAttribute("data-on", Boolean(on));
      if (!glide) {
        void marker.offsetHeight;
        marker.style.transition = "";
      }
    };
    place(true);
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [activeTop, markerShown, items, fontSize, rowHeight, open]);

  const select = (value: string, item: BranchedMenuLeaf) => {
    setActive(value);
    onSelect?.(value, item);
  };

  const toggle = (path: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      const isOpen = !next.has(path);
      if (isOpen) next.add(path);
      else next.delete(path);
      onToggle?.(path, isOpen);
      return next;
    });
  };

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ""}`}
      style={{
        ["--bm-w" as string]: `${width}px`,
        ["--bm-ink" as string]: color,
        ["--bm-accent" as string]: accentColor,
        ["--bm-line" as string]: lineColor,
        ["--bm-font" as string]: `${fontSize}px`,
        ["--bm-row" as string]: `${rowHeight}px`,
        ["--bm-indent" as string]: `${indent}px`,
        ["--bm-line-w" as string]: lineWidth,
        ["--bm-draw" as string]: `${drawDuration}ms`,
        ["--bm-fold" as string]: `${foldDuration}ms`,
      }}
    >
      <span
        ref={markerRef}
        className="branched-menu__marker"
        aria-hidden="true"
      />
      {items.map((item, i) => {
        const path = String(i);
        if (isLeaf(item)) {
          const leafActive = item.value === active;
          return (
            <div key={item.value} className="branched-menu__section">
              <button
                ref={(el) => {
                  heads.current[i] = el;
                }}
                type="button"
                className="branched-menu__head"
                aria-current={leafActive ? "true" : undefined}
                data-active={leafActive ? "" : undefined}
                onClick={() => select(item.value, item)}
              >
                {item.label}
              </button>
            </div>
          );
        }

        const isOpen = open.has(path);
        const containsActive = collectLeaves(item.children).some(
          (leaf) => leaf.value === active,
        );
        return (
          <div
            key={item.value ?? item.label}
            className="branched-menu__section"
            data-open={isOpen ? "" : undefined}
          >
            <button
              ref={(el) => {
                heads.current[i] = el;
              }}
              type="button"
              className="branched-menu__head"
              aria-expanded={isOpen}
              data-active={containsActive && isOpen ? "" : undefined}
              onClick={() => toggle(path)}
            >
              {item.label}
            </button>
            <div className="branched-menu__body">
              <div className="branched-menu__fold">
                <BranchChildren
                  nodes={item.children}
                  path={path}
                  active={active}
                  open={open}
                  depth={1}
                  rowHeight={rowHeight}
                  indent={indent}
                  trunk={trunk}
                  radius={radius}
                  onToggle={toggle}
                  onSelect={select}
                  heads={heads}
                  headIndex={i}
                />
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
