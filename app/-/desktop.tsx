"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type CSSProperties,
} from "react";
import {
  Folder,
  FileText,
  Terminal,
  Settings,
  X,
  Minus,
  Maximize2,
  Grid2X2,
  ArrowUpRight,
  Search,
  Monitor,
  Check,
  ChevronRight,
  Wifi,
  Volume2,
} from "lucide-react";
import styles from "./desktop.module.css";

type AppId = "files" | "notes" | "terminal" | "settings";
type WindowState = {
  id: AppId;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
};
const apps = {
  files: {
    name: "Files",
    icon: Folder,
    color: "#a9c6f4",
    detail: "A few places to explore",
  },
  notes: {
    name: "Notes",
    icon: FileText,
    color: "#f4d493",
    detail: "A little room to think",
  },
  terminal: {
    name: "Terminal",
    icon: Terminal,
    color: "#b7dbbb",
    detail: "Make yourself at home",
  },
  settings: {
    name: "Settings",
    icon: Settings,
    color: "#d0bee8",
    detail: "Make this space yours",
  },
};
const appIds = Object.keys(apps) as AppId[];
const themes = { midnight: "Midnight", dusk: "Dusk", forest: "Forest" };
type Theme = keyof typeof themes;
const initialNote =
  "A little space for your thoughts.\n\nWhat would you like to make today?";
const places = [
  {
    name: "Portfolio",
    description: "A little about me",
    href: "/",
    type: "Website",
  },
  {
    name: "Developing",
    description: "Things I’ve been building",
    href: "/developing",
    type: "Projects",
  },
  {
    name: "Listening",
    description: "Currently in rotation",
    href: "/listen",
    type: "Music",
  },
  {
    name: "Ask me",
    description: "Leave a question",
    href: "/ask",
    type: "Inbox",
  },
  {
    name: "New tab",
    description: "A quieter starting point",
    href: "/newtab",
    type: "Website",
  },
];

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "files", x: 200, y: 100, minimized: false, maximized: false },
  ]);
  const [launcher, setLauncher] = useState(false);
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState<Date | null>(null);
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(true);
  const [theme, setTheme] = useState<Theme>("midnight");
  const [ready, setReady] = useState(false);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([
    { command: "", output: "Welcome to Rynnie OS. Type help to look around." },
  ]);
  const drag = useRef<{ id: AppId; dx: number; dy: number } | null>(null);
  const terminalEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setClock(new Date());
    const timer = setInterval(tick, 1000);
    const frame = requestAnimationFrame(() => {
      tick();
      try {
        setNote(localStorage.getItem("rynnie-desktop-note") ?? initialNote);
        const stored = localStorage.getItem("rynnie-desktop-theme");
        if (stored && Object.hasOwn(themes, stored)) setTheme(stored as Theme);
      } catch {
        setSaved(false);
      }
      setReady(true);
    });
    const resize = () =>
      setWindows((previous) =>
        previous.map((item) => ({
          ...item,
          x: Math.max(
            12,
            Math.min(
              item.x,
              window.innerWidth - Math.min(640, window.innerWidth - 32) - 16,
            ),
          ),
          y: Math.max(
            40,
            Math.min(
              item.y,
              window.innerHeight -
                Math.min(460, window.innerHeight - 140) -
                100,
            ),
          ),
        })),
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
    setWindows((previous) => {
      const item = previous.find((w) => w.id === id);
      if (item)
        return [
          ...previous.filter((w) => w.id !== id),
          { ...item, minimized: false },
        ];
      const offset = previous.length * 28;
      return [
        ...previous,
        {
          id,
          x: Math.max(12, Math.min(200 + offset, window.innerWidth - 650)),
          y: Math.max(48, Math.min(100 + offset, window.innerHeight - 520)),
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
        Math.min(window.innerWidth - 160, event.clientX - drag.current.dx),
      ),
      y: Math.max(
        40,
        Math.min(window.innerHeight - 140, event.clientY - drag.current.dy),
      ),
    });
  }
  function runCommand() {
    const input = command.trim();
    if (!input) return;
    const [cmd, arg] = input.split(/\s+/);
    let output = "";
    switch (cmd.toLowerCase()) {
      case "help":
        output =
          "help              Available commands\nls                Explore this desktop\nopen <app>        files, notes, settings\ndate              Your local time\nwhoami            About this place\necho <text>       Say something\nclear             Start fresh";
        break;
      case "ls":
        output = "files/    notes.txt    settings/    portfolio.url";
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
        if (appIds.includes(arg as AppId)) {
          open(arg as AppId);
          output = `Opening ${arg}…`;
        } else output = "Choose an app: files, notes, terminal, settings.";
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
  const active = windows.filter((w) => !w.minimized).at(-1)?.id;

  return (
    <main
      className={styles.desktop}
      data-theme={theme}
      aria-label="Rynnie desktop"
    >
      <div className={styles.wallpaper} aria-hidden="true" />
      <header className={styles.menubar}>
        <span className={styles.brand}>
          <Monitor size={15} /> Rynnie <span>OS</span>
        </span>
        <span className={styles.currentApp}>
          {active ? apps[active].name : "Desktop"}
        </span>
        <div className={styles.system}>
          <Wifi size={14} aria-label="Web desktop" />
          <Volume2 size={14} aria-hidden="true" />
          <time>
            {clock?.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            <span>
              {clock?.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              }) ?? "—:—"}
            </span>
          </time>
        </div>
      </header>

      <div className={styles.shortcuts} aria-label="Desktop apps">
        {appIds.map((id) => {
          const Icon = apps[id].icon;
          return (
            <button key={id} onClick={() => open(id)}>
              <span
                className={styles.appIcon}
                style={{ "--app-color": apps[id].color } as CSSProperties}
              >
                <Icon size={27} strokeWidth={1.5} />
              </span>
              <span>{apps[id].name}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.desktopLabel} aria-hidden="true">
        <span>YOUR OWN LITTLE CORNER</span>
        <h1>Stay curious.</h1>
        <p>A desktop for the internet.</p>
      </div>

      {windows.map((item, index) => {
        const Icon = apps[item.id].icon;
        return (
          <section
            key={item.id}
            aria-label={`${apps[item.id].name} window`}
            hidden={item.minimized}
            className={`${styles.window} ${item.maximized ? styles.maximized : ""}`}
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
              }}
              onPointerCancel={() => {
                drag.current = null;
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
                <button
                  aria-label={`Minimize ${apps[item.id].name}`}
                  onClick={() => update(item.id, { minimized: true })}
                >
                  <Minus size={14} />
                </button>
                <button
                  aria-label={`${item.maximized ? "Restore" : "Maximize"} ${apps[item.id].name}`}
                  onClick={() =>
                    update(item.id, { maximized: !item.maximized })
                  }
                >
                  <Maximize2 size={12} />
                </button>
                <button
                  aria-label={`Close ${apps[item.id].name}`}
                  onClick={() =>
                    setWindows((previous) =>
                      previous.filter((w) => w.id !== item.id),
                    )
                  }
                >
                  <X size={15} />
                </button>
              </div>
            </header>
            <div className={styles.windowBody}>
              {item.id === "files" && (
                <div className={styles.files}>
                  <aside>
                    <span>FAVORITES</span>
                    <button aria-current="page">
                      <Folder size={15} /> Home
                    </button>
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
                        <a
                          key={place.href}
                          href={place.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className={styles.fileSymbol}>
                            <Folder size={22} strokeWidth={1.5} />
                          </span>
                          <span>
                            <strong>{place.name}</strong>
                            <small>{place.description}</small>
                          </span>
                          <span className={styles.fileType}>{place.type}</span>
                          <ArrowUpRight size={15} />
                        </a>
                      ))}
                    </div>
                    <footer>
                      {places.length} places{" "}
                      <span>
                        Opens in a new tab <ArrowUpRight size={11} />
                      </span>
                    </footer>
                  </div>
                </div>
              )}
              {item.id === "notes" && (
                <div className={styles.notes}>
                  <div className={styles.noteToolbar}>
                    <span>Untitled.txt</span>
                    <span>
                      <Check size={12} />
                      {saved ? "Saved on this device" : "Storage unavailable"}
                    </span>
                  </div>
                  <textarea
                    aria-label="Your notes"
                    value={note}
                    disabled={!ready}
                    onChange={(event) => {
                      setNote(event.target.value);
                      persist("rynnie-desktop-note", event.target.value);
                    }}
                    spellCheck={false}
                  />
                  <footer>
                    {note.trim() ? note.trim().split(/\s+/).length : 0} words{" "}
                    <span>Just for you.</span>
                  </footer>
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
                    <input
                      id="desktop-command"
                      autoComplete="off"
                      spellCheck={false}
                      value={command}
                      onChange={(event) => setCommand(event.target.value)}
                    />
                  </form>
                  <div ref={terminalEnd} />
                </div>
              )}
              {item.id === "settings" && (
                <div className={styles.settings}>
                  <span className={styles.eyebrow}>PERSONALIZE YOUR SPACE</span>
                  <h2>A change of scenery.</h2>
                  <p>Pick a mood for your desktop.</p>
                  <div className={styles.themes}>
                    {(Object.keys(themes) as Theme[]).map((key) => (
                      <button
                        key={key}
                        aria-pressed={theme === key}
                        disabled={!ready}
                        onClick={() => {
                          setTheme(key);
                          persist("rynnie-desktop-theme", key);
                        }}
                      >
                        <span className={styles.themePreview} data-theme={key}>
                          {theme === key && <Check size={18} />}
                        </span>
                        {themes[key]}
                      </button>
                    ))}
                  </div>
                  <div className={styles.about}>
                    <Monitor size={25} strokeWidth={1.5} />
                    <div>
                      <strong>Rynnie OS</strong>
                      <p>A small desktop, right in your browser.</p>
                      <small>Notes and appearance stay on this device.</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {launcher && (
        <>
          <button
            className={styles.dismiss}
            aria-label="Dismiss app launcher"
            onClick={() => setLauncher(false)}
          />
          <section className={styles.launcher} aria-label="App launcher">
            <div className={styles.launcherHeading}>
              <span>Make yourself at home.</span>
              <small>RYNNIE OS</small>
            </div>
            <label className={styles.search}>
              <Search size={16} />
              <input
                autoFocus
                aria-label="Search apps"
                placeholder="Find an app…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className={styles.launcherApps}>
              {appIds
                .filter((id) =>
                  apps[id].name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((id) => {
                  const Icon = apps[id].icon;
                  return (
                    <button key={id} onClick={() => open(id)}>
                      <Icon size={23} color={apps[id].color} />
                      <span>
                        <strong>{apps[id].name}</strong>
                        <small>{apps[id].detail}</small>
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              {!appIds.some((id) =>
                apps[id].name.toLowerCase().includes(query.toLowerCase()),
              ) && <p>No apps found.</p>}
            </div>
            <Link href="/">
              Back to the portfolio <ArrowUpRight size={14} />
            </Link>
          </section>
        </>
      )}
      <footer className={styles.taskbar}>
        <button
          className={styles.launchButton}
          aria-label="Open app launcher"
          aria-expanded={launcher}
          onClick={() => setLauncher(!launcher)}
        >
          <Grid2X2 size={21} />
        </button>
        <div className={styles.separator} />
        {appIds.map((id) => {
          const Icon = apps[id].icon;
          const running = windows.find((w) => w.id === id);
          return (
            <button
              key={id}
              aria-label={`Open ${apps[id].name}`}
              title={apps[id].name}
              data-running={!!running}
              data-active={active === id}
              onClick={() => {
                if (active === id) update(id, { minimized: true });
                else open(id);
              }}
            >
              <Icon size={22} strokeWidth={1.6} color={apps[id].color} />
              <span />
            </button>
          );
        })}
        <div className={styles.separator} />
        <button
          aria-label="Show desktop"
          title="Show desktop"
          onClick={() => {
            setWindows((previous) =>
              previous.map((w) => ({ ...w, minimized: true })),
            );
            setLauncher(false);
          }}
        >
          <Monitor size={19} />
        </button>
      </footer>
    </main>
  );
}
