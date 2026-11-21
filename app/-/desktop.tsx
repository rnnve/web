"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NativeApps, { type NativeAppId } from "./native-apps";
import { clearListenSnapshots } from "../lib/listen-cache";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  RefreshCw,
  Power,
  Folder,
  Terminal,
  Settings,
  X,
  Minus,
  Maximize2,
  Grid2X2,
  ArrowUpRight,
  Search,
  Monitor,
  ChevronRight,
  Music2,
  Code2,
  Mail,
  House,
  ChevronUp,
} from "lucide-react";
import LiveStatus from "../components/status/live-status";
import styles from "./desktop.module.css";

type AppId =
  | "files"
  | "terminal"
  | "settings"
  | "portfolio"
  | "developing"
  | "listening"
  | "ask"
  | "newtab";
type WindowState = {
  id: AppId;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
};
const apps: Record<
  AppId,
  {
    name: string;
    icon: typeof Folder;
    detail: string;
    wide?: boolean;
  }
> = {
  files: {
    name: "File manager",
    icon: Folder,
    detail: "A few places to explore",
  },
  terminal: {
    name: "Terminal",
    icon: Terminal,
    detail: "Make yourself at home",
  },
  settings: {
    name: "System Settings",
    icon: Settings,
    detail: "Make this space yours",
  },
  portfolio: {
    name: "Portfolio",
    icon: Monitor,
    detail: "Open Portfolio",
    wide: true,
  },
  developing: {
    name: "Developing",
    icon: Code2,
    detail: "Open Developing",
    wide: true,
  },
  listening: {
    name: "Listening",
    icon: Music2,
    detail: "Open Listening",
    wide: true,
  },
  ask: {
    name: "Ask",
    icon: Mail,
    detail: "Open Ask me",
    wide: true,
  },
  newtab: {
    name: "New tab",
    icon: Monitor,
    detail: "Open New tab",
    wide: true,
  },
};
const DesktopWindow = motion.create(Card);

const appIds: AppId[] = [
  "files",
  "portfolio",
  "listening",
  "developing",
  "ask",
  "terminal",
];
const pageIds: AppId[] = ["settings", "newtab"];
const places = [
  {
    id: "portfolio" as AppId,
    name: "Portfolio",
    description: "A little about me",
    href: "/",
    type: "Website",
  },
  {
    id: "developing" as AppId,
    name: "Developing",
    description: "Things I’ve been building",
    href: "/developing",
    type: "Projects",
  },
  {
    id: "listening" as AppId,
    name: "Listening",
    description: "Currently in rotation",
    href: "/listen",
    type: "Music",
  },
  {
    id: "ask" as AppId,
    name: "Ask me",
    description: "Leave a question",
    href: "/ask",
    type: "Inbox",
  },
  {
    id: "newtab" as AppId,
    name: "New tab",
    description: "A quieter starting point",
    href: "/newtab",
    type: "Website",
  },
];

function windowBounds(id: AppId) {
  const taskbar =
    document.querySelector("[data-desktop-taskbar]")?.getBoundingClientRect()
      .height ?? 56;
  const width = Math.min(apps[id].wide ? 960 : 640, window.innerWidth - 32);
  const height = Math.min(
    apps[id].wide ? 680 : 460,
    window.innerHeight - taskbar - 32,
  );
  return {
    maxX: window.innerWidth - width - 16,
    maxY: window.innerHeight - taskbar - height - 16,
    taskbar,
  };
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [launcher, setLauncher] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState<Date | null>(null);
  const [saved, setSaved] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [ready, setReady] = useState(false);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([
    { command: "", output: "Welcome to Rynnie OS. Type help to look around." },
  ]);
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = systemReducedMotion || !animations;
  const [dragging, setDragging] = useState<AppId | null>(null);
  const [appVersions, setAppVersions] = useState<
    Partial<Record<AppId, number>>
  >({});
  const desktopSnapshot = useRef<Set<AppId> | null>(null);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const drag = useRef<{ id: AppId; dx: number; dy: number } | null>(null);
  const terminalEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setClock(new Date());
    const timer = setInterval(tick, 1000);
    const frame = requestAnimationFrame(() => {
      tick();
      try {
        setAnimations(
          localStorage.getItem("rynnie-desktop-animations") !== "off",
        );
      } catch {
        setSaved(false);
      }
      setReady(true);
    });
    const resize = () =>
      setWindows((previous) =>
        previous.map((item) => {
          const bounds = windowBounds(item.id);
          return {
            ...item,
            x: Math.max(12, Math.min(item.x, bounds.maxX)),
            y: Math.max(16, Math.min(item.y, bounds.maxY)),
          };
        }),
      );
    window.addEventListener("resize", resize);
    const positionFrame = requestAnimationFrame(resize);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(positionFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function persist(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  useEffect(() => {
    terminalEnd.current?.scrollIntoView({ block: "nearest" });
  }, [history]);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLauncher(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, []);

  function focus(id: AppId) {
    setWindows((previous) => {
      const item = previous.find((w) => w.id === id);
      return item
        ? [
            ...previous.filter((w) => w.id !== id),
            { ...item, minimized: false },
          ]
        : previous;
    });
  }
  function open(id: AppId) {
    desktopSnapshot.current = null;
    setWindows((previous) => {
      const item = previous.find((w) => w.id === id);
      if (item)
        return [
          ...previous.filter((w) => w.id !== id),
          { ...item, minimized: false },
        ];
      const offset = previous.length * 28;
      const bounds = windowBounds(id);
      return [
        ...previous,
        {
          id,
          x: Math.max(12, Math.min(200 + offset, bounds.maxX)),
          y: Math.max(16, Math.min(100 + offset, bounds.maxY)),
          minimized: false,
          maximized: false,
        },
      ];
    });
    setLauncher(false);
    setQuery("");
  }
  function update(id: AppId, patch: Partial<WindowState>) {
    setWindows((previous) =>
      previous.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    );
  }
  function startDrag(event: PointerEvent<HTMLElement>, item: WindowState) {
    if (
      item.maximized ||
      window.innerWidth < 700 ||
      (event.target as HTMLElement).closest("button")
    )
      return;
    event.preventDefault();
    setDragging(item.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: item.id,
      dx: event.clientX - item.x,
      dy: event.clientY - item.y,
    };
  }
  function moveDrag(event: PointerEvent<HTMLElement>) {
    if (!drag.current) return;
    update(drag.current.id, {
      x: Math.max(
        0,
        Math.min(
          window.innerWidth -
            (event.currentTarget.parentElement?.getBoundingClientRect().width ??
              640),
          event.clientX - drag.current.dx,
        ),
      ),
      y: Math.max(
        8,
        Math.min(
          window.innerHeight -
            (event.currentTarget.parentElement?.getBoundingClientRect()
              .height ?? 460) -
            windowBounds(drag.current.id).taskbar -
            8,
          event.clientY - drag.current.dy,
        ),
      ),
    });
  }
  function runCommand() {
    const input = command.trim();
    if (!input) return;
    commandHistory.current.push(input);
    historyIndex.current = commandHistory.current.length;
    const [cmd, arg] = input.split(/\s+/);
    let output = "";
    switch (cmd.toLowerCase()) {
      case "help":
        output =
          "help              Available commands\nls                Explore this desktop\nopen <app>        Any desktop app or page\ndate              Your local time\nwhoami            About this place\necho <text>       Say something\nclear             Start fresh";
        break;
      case "ls":
        output = [...appIds, ...pageIds].join("    ");
        break;
      case "date":
        output = new Date().toLocaleString();
        break;
      case "whoami":
        output =
          "A visitor in Rynnie’s little corner of the internet. Welcome.";
        break;
      case "echo":
        output = input.slice(5);
        break;
      case "open":
        if ([...appIds, ...pageIds].includes(arg as AppId)) {
          open(arg as AppId);
          output = `Opening ${arg}…`;
        } else output = `Choose an app: ${[...appIds, ...pageIds].join(", ")}.`;
        break;
      case "clear":
        setHistory([]);
        setCommand("");
        return;
      default:
        output = `Command not found: ${cmd}. Try help.`;
    }
    setHistory((previous) => [...previous, { command: input, output }]);
    setCommand("");
  }
  function showDesktop() {
    if (desktopSnapshot.current) {
      const previous = desktopSnapshot.current;
      setWindows((items) =>
        items.map((item) =>
          previous.has(item.id) ? { ...item, minimized: false } : item,
        ),
      );
      desktopSnapshot.current = null;
    } else {
      desktopSnapshot.current = new Set(
        windows.filter((item) => !item.minimized).map((item) => item.id),
      );
      setWindows((items) =>
        items.map((item) => ({ ...item, minimized: true })),
      );
    }
    setLauncher(false);
  }
  const active = windows.filter((w) => !w.minimized).at(-1)?.id;

  useEffect(() => {
    if (!active || !ready || launcher || powerOpen) return;
    const frame = requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-window-id="${active}"]`,
      );
      if (!element || element.contains(document.activeElement)) return;
      (
        element.querySelector<HTMLElement>("textarea:not(:disabled), input") ??
        element
      ).focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, ready, launcher, powerOpen]);

  return (
    <main
      className={styles.desktop}
      data-motion={reduceMotion ? "reduced" : "full"}
      aria-label="Rynnie desktop"
    >
      <div className={styles.wallpaper} aria-hidden="true">
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <path className={styles.wallpaperBack} d="M0 0H1600V1000H0Z" />
          <path
            className={styles.wallpaperFold}
            d="M530 0H1600V1000H1180L300 380Z"
          />
          <path
            className={styles.wallpaperPlane}
            d="M1600 0V1000H720L1220 300 830 0Z"
          />
          <path
            className={styles.wallpaperEdge}
            d="M0 740 1220 300 720 1000H0Z"
          />
          <path className={styles.wallpaperLight} d="m1220 300 380 700H720Z" />
        </svg>
      </div>

      <aside
        className={styles.desktopStatus}
        aria-label="Live Discord and Spotify status"
      >
        <LiveStatus />
      </aside>

      <div className={styles.shortcuts} aria-label="Desktop apps">
        {(["files", "portfolio", "settings"] as const).map((id) => {
          const Icon = apps[id].icon;
          return (
            <Button variant="ghost" key={id} onClick={() => open(id)}>
              <span className={styles.appIcon}>
                <Icon className="size-7" strokeWidth={1.5} />
              </span>
              <span>{apps[id].name}</span>
            </Button>
          );
        })}
      </div>
      <div className={styles.desktopLabel} aria-hidden="true">
        <span>Rynnie OS</span>
        <h1>
          {clock?.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }) ?? "—:—"}
        </h1>
        <p>
          {clock?.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }) ?? "Your browser desktop"}
        </p>
      </div>

      <AnimatePresence>
        {windows.map((item, index) => {
          const Icon = apps[item.id].icon;
          return (
            <DesktopWindow
              role="region"
              key={item.id}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={
                item.minimized
                  ? {
                      opacity: 0,
                      scale: 0.88,
                      y: 56,
                      transitionEnd: { visibility: "hidden" },
                    }
                  : { opacity: 1, scale: 1, y: 0, visibility: "visible" }
              }
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              inert={item.minimized}
              aria-hidden={item.minimized || undefined}
              data-window-id={item.id}
              data-dragging={dragging === item.id}
              tabIndex={-1}
              aria-label={`${apps[item.id].name} window`}
              className={`${styles.window} ${apps[item.id].wide ? styles.pageWindow : ""} ${item.maximized ? styles.maximized : ""}`}
              style={{ left: item.x, top: item.y, zIndex: 10 + index }}
              data-active={active === item.id}
              onPointerDown={() => focus(item.id)}
            >
              <header
                className={styles.titlebar}
                onPointerDown={(event) => startDrag(event, item)}
                onPointerMove={moveDrag}
                onPointerUp={() => {
                  drag.current = null;
                  setDragging(null);
                }}
                onPointerCancel={() => {
                  drag.current = null;
                  setDragging(null);
                }}
                onDoubleClick={(event) => {
                  if (!(event.target as HTMLElement).closest("button"))
                    update(item.id, { maximized: !item.maximized });
                }}
              >
                <span>
                  <Icon size={15} />
                  {apps[item.id].name}
                </span>
                <div className={styles.controls}>
                  {(item.id === "listening" || item.id === "developing") && (
                    <Button
                      variant="ghost"
                      aria-label={`Reload ${apps[item.id].name}`}
                      onClick={() => {
                        if (item.id === "listening") clearListenSnapshots();
                        setAppVersions((previous) => ({
                          ...previous,
                          [item.id]: (previous[item.id] ?? 0) + 1,
                        }));
                      }}
                    >
                      <RefreshCw size={13} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    aria-label={`Minimize ${apps[item.id].name}`}
                    onClick={() => update(item.id, { minimized: true })}
                  >
                    <Minus size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`${item.maximized ? "Restore" : "Maximize"} ${apps[item.id].name}`}
                    onClick={() =>
                      update(item.id, { maximized: !item.maximized })
                    }
                  >
                    <Maximize2 size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Close ${apps[item.id].name}`}
                    onClick={() =>
                      setWindows((previous) =>
                        previous.filter((w) => w.id !== item.id),
                      )
                    }
                  >
                    <X size={15} />
                  </Button>
                </div>
              </header>
              <div className={styles.windowBody}>
                {apps[item.id].wide && (
                  <NativeApps
                    key={`${item.id}-${appVersions[item.id] ?? 0}`}
                    id={item.id as NativeAppId}
                    onOpen={open}
                  />
                )}
                {item.id === "files" && (
                  <div className={styles.files}>
                    <aside>
                      <span>FAVORITES</span>
                      <Button
                        variant="ghost"
                        aria-current="page"
                        onClick={(event) =>
                          event.currentTarget
                            .closest("aside")
                            ?.nextElementSibling?.scrollTo({
                              top: 0,
                              behavior: reduceMotion ? "instant" : "smooth",
                            })
                        }
                      >
                        <Folder size={15} /> Home
                      </Button>
                      <p>
                        A few bookmarks
                        <br />
                        to my world.
                      </p>
                    </aside>
                    <div className={styles.fileContent}>
                      <div className={styles.breadcrumb}>
                        <Folder size={14} /> Home <ChevronRight size={13} />{" "}
                        <span>Rynnie</span>
                      </div>
                      <h2>Good to see you here.</h2>
                      <p>Take a look around. Make yourself at home.</p>
                      <div className={styles.fileList}>
                        {places.map((place) => (
                          <Button
                            variant="ghost"
                            key={place.href}
                            onClick={() => open(place.id)}
                          >
                            <span className={styles.fileSymbol}>
                              <Folder size={22} strokeWidth={1.5} />
                            </span>
                            <span>
                              <strong>{place.name}</strong>
                              <small>{place.description}</small>
                            </span>
                            <span className={styles.fileType}>
                              {place.type}
                            </span>
                            <ArrowUpRight size={15} />
                          </Button>
                        ))}
                      </div>
                      <footer>
                        {places.length} places{" "}
                        <span>
                          Opens a desktop app <ArrowUpRight size={11} />
                        </span>
                      </footer>
                    </div>
                  </div>
                )}
                {item.id === "terminal" && (
                  <div
                    className={styles.terminal}
                    onClick={(event) => {
                      if (
                        !(event.target as HTMLElement).closest("input") &&
                        !window.getSelection()?.toString()
                      )
                        event.currentTarget.querySelector("input")?.focus();
                    }}
                  >
                    <div className={styles.terminalIntro}>
                      RYNNIE OS <span> / browser session</span>
                    </div>
                    <div
                      className={styles.terminalOutput}
                      role="log"
                      aria-live="polite"
                    >
                      {history.map((entry, i) => (
                        <div key={i}>
                          {entry.command && (
                            <p>
                              <span>visitor ~ $</span> {entry.command}
                            </p>
                          )}
                          <pre>{entry.output}</pre>
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        runCommand();
                      }}
                    >
                      <label htmlFor="desktop-command">visitor ~ $</label>
                      <Input
                        id="desktop-command"
                        autoComplete="off"
                        spellCheck={false}
                        value={command}
                        onKeyDown={(event) => {
                          if (
                            event.key !== "ArrowUp" &&
                            event.key !== "ArrowDown"
                          )
                            return;
                          event.preventDefault();
                          historyIndex.current = Math.max(
                            0,
                            Math.min(
                              commandHistory.current.length,
                              historyIndex.current +
                                (event.key === "ArrowUp" ? -1 : 1),
                            ),
                          );
                          setCommand(
                            commandHistory.current[historyIndex.current] ?? "",
                          );
                        }}
                        onChange={(event) => setCommand(event.target.value)}
                      />
                    </form>
                    <div ref={terminalEnd} />
                  </div>
                )}
                {item.id === "settings" && (
                  <Card className={styles.settings}>
                    <CardHeader>
                      <CardDescription>Appearance</CardDescription>
                      <CardTitle>
                        <h2>System Settings</h2>
                      </CardTitle>
                      <CardDescription>
                        A Plasma inspired workspace, with the site’s live
                        accent.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={styles.accentSetting}>
                        <span
                          className={styles.accentSwatch}
                          aria-hidden="true"
                        />
                        <div>
                          <strong>Live site accent</strong>
                          <p>
                            Follows the current song’s artwork. Returns to white
                            when playback stops.
                          </p>
                        </div>
                      </div>
                      <div className={styles.motionSetting}>
                        <Label htmlFor="os-animations">
                          <span>
                            <strong>Window animations</strong>
                            <small>
                              {systemReducedMotion
                                ? "Your device requests reduced motion."
                                : "Animate windows and the app launcher."}
                            </small>
                          </span>
                        </Label>
                        <Switch
                          id="os-animations"
                          aria-label="Window animations"
                          checked={animations}
                          disabled={!ready}
                          onCheckedChange={(value) => {
                            setAnimations(value);
                            persist(
                              "rynnie-desktop-animations",
                              value ? "on" : "off",
                            );
                          }}
                        />
                      </div>
                      {!saved && (
                        <p role="status">
                          Your preference could not be saved on this device.
                        </p>
                      )}
                      <div className={styles.about}>
                        <Monitor size={25} strokeWidth={1.5} />
                        <div>
                          <strong>Rynnie OS</strong>
                          <p>Your personal browser workspace.</p>
                          <small>
                            Listening, Ask, and Developing. Right here.
                          </small>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DesktopWindow>
          );
        })}
      </AnimatePresence>

      {launcher && (
        <Button
          variant="ghost"
          className={styles.dismiss}
          aria-label="Dismiss app launcher"
          onClick={() => setLauncher(false)}
        />
      )}
      <AnimatePresence>
        {launcher && (
          <motion.section
            key="launcher"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={styles.launcher}
            aria-label="App launcher"
          >
            <div className={styles.launcherHeading}>
              <span className={styles.userAvatar}>R</span>
              <div>
                <strong>Rynnie</strong>
                <small>Personal workspace</small>
              </div>
              <Button
                variant="ghost"
                aria-label="Open System Settings"
                onClick={() => open("settings")}
              >
                <Settings size={20} />
              </Button>
            </div>
            <label className={styles.search}>
              <Search size={16} />
              <Input
                autoFocus
                aria-label="Search apps"
                placeholder="Search applications…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const match = [...appIds, ...pageIds].find((id) =>
                      apps[id].name.toLowerCase().includes(query.toLowerCase()),
                    );
                    if (match) open(match);
                  }
                }}
              />
            </label>
            <div className={styles.launcherContent}>
              <nav className={styles.launcherPlaces} aria-label="Places">
                <span>Places</span>
                <Button variant="ghost" onClick={() => open("files")}>
                  <House size={18} /> Home
                </Button>
                <Button variant="ghost" onClick={() => open("portfolio")}>
                  <Monitor size={18} /> Portfolio
                </Button>
                <Button variant="ghost" onClick={() => open("settings")}>
                  <Settings size={18} /> Settings
                </Button>
              </nav>
              <div className={styles.launcherApplications}>
                <p className={styles.launcherSection}>Applications</p>
                <div className={styles.launcherApps}>
                  {[...appIds, ...pageIds]
                    .filter((id) =>
                      apps[id].name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((id) => {
                      const Icon = apps[id].icon;
                      return (
                        <Button
                          variant="ghost"
                          key={id}
                          onClick={() => open(id)}
                        >
                          <Icon className="size-8" />
                          <span>
                            <strong>{apps[id].name}</strong>
                            <small>{apps[id].detail}</small>
                          </span>
                        </Button>
                      );
                    })}
                  {![...appIds, ...pageIds].some((id) =>
                    apps[id].name.toLowerCase().includes(query.toLowerCase()),
                  ) && <p>No apps found.</p>}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className={styles.portfolioButton}
              onClick={() => open("portfolio")}
            >
              Explore portfolio <Monitor size={14} />
            </Button>
          </motion.section>
        )}
      </AnimatePresence>
      <footer
        className={styles.taskbar}
        data-desktop-taskbar
        aria-label="Desktop taskbar"
      >
        <Button
          variant="ghost"
          className={styles.launchButton}
          aria-label="Open app launcher"
          aria-expanded={launcher}
          onClick={() => setLauncher(!launcher)}
        >
          <Grid2X2 size={21} />
        </Button>

        <div className={styles.separator} />
        <div className={styles.taskApps} aria-label="Running and pinned apps">
          {[
            ...appIds,
            ...pageIds.filter((id) => windows.some((w) => w.id === id)),
          ].map((id) => {
            const Icon = apps[id].icon;
            const running = windows.find((w) => w.id === id);
            return (
              <Button
                variant="ghost"
                key={id}
                className={styles.taskButton}
                aria-label={`Open ${apps[id].name}`}
                title={apps[id].name}
                data-running={!!running}
                data-active={active === id}
                onClick={() => {
                  if (active === id) update(id, { minimized: true });
                  else open(id);
                }}
              >
                <Icon className="size-6" strokeWidth={1.6} />
                <span className={styles.taskLabel}>{apps[id].name}</span>
                <i className={styles.runningIndicator} />
              </Button>
            );
          })}
        </div>
        <div className={styles.systemTray}>
          <Button
            variant="ghost"
            aria-label="Open System Settings"
            title="System Settings"
            onClick={() => open("settings")}
          >
            <ChevronUp size={18} />
          </Button>
          <DropdownMenu
            open={powerOpen}
            onOpenChange={(value) => {
              setPowerOpen(value);
              if (value) setLauncher(false);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Power menu"
                title="Power"
                aria-haspopup="menu"
              >
                <Power size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={styles.powerMenu}
              data-motion={reduceMotion ? "reduced" : "full"}
              side="top"
              align="start"
              sideOffset={8}
              collisionPadding={8}
            >
              <DropdownMenuLabel className={styles.powerMenuLabel}>
                RYNNIE OS
              </DropdownMenuLabel>
              <DropdownMenuItem className={styles.powerMenuItem} asChild>
                <Link href="/">
                  <Power size={14} />
                  Return to site
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={styles.powerMenuItem}
                onSelect={() => {
                  setWindows([]);
                  setLauncher(false);
                  setQuery("");
                  setCommand("");
                  setAppVersions({});
                  setHistory([
                    {
                      command: "",
                      output: "Welcome to Rynnie OS. Type help to look around.",
                    },
                  ]);
                  commandHistory.current = [];
                  historyIndex.current = 0;
                  desktopSnapshot.current = null;
                }}
              >
                <RefreshCw size={14} />
                Restart desktop
              </DropdownMenuItem>
              <DropdownMenuSeparator className={styles.powerMenuSeparator} />
              <DropdownMenuItem className={styles.powerMenuItem}>
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <time className={styles.trayClock} aria-label="Desktop clock">
          <span>
            {clock?.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            }) ?? "—:—"}
          </span>
          <small>
            {clock?.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </small>
        </time>
        <div className={styles.separator} />
        <Button
          variant="ghost"
          className={styles.desktopToggle}
          aria-label="Show desktop"
          title="Show desktop"
          onClick={showDesktop}
        />
      </footer>
    </main>
  );
}
