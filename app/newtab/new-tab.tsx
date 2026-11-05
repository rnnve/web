"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import LiveWallpaper from "./live-wallpaper";
import {
  DEFAULT_PREFERENCES,
  ENGINES,
  PREFERENCES_KEY,
  isSafeShortcut,
  parsePreferences,
  type Preferences,
  type Shortcut,
} from "./preferences";
import styles from "./new-tab.module.css";

const CHANGE_EVENT = "rynnie-newtab-change";
let cachedPreferences: Preferences | undefined;

function getPreferences() {
  if (!cachedPreferences) {
    try {
      cachedPreferences = parsePreferences(
        localStorage.getItem(PREFERENCES_KEY),
      );
    } catch {
      cachedPreferences = DEFAULT_PREFERENCES;
    }
  }
  return cachedPreferences;
}

function subscribePreferences(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCES_KEY || event.key === null) {
      cachedPreferences = undefined;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function savePreferences(preferences: Preferences) {
  cachedPreferences = preferences;
  let persisted = true;
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    persisted = false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return persisted;
}

// Update at minute boundaries and stop the timer while this tab is hidden.
function subscribeClock(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const update = () => {
    clearTimeout(timer);
    onChange();
    if (!document.hidden) {
      timer = setTimeout(update, 60_000 - (Date.now() % 60_000));
    }
  };
  update();
  document.addEventListener("visibilitychange", update);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", update);
  };
}

function Clock() {
  const minute = useSyncExternalStore(
    subscribeClock,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  const now = minute === null ? null : new Date(minute * 60_000);
  const hour = now?.getHours() ?? 12;
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className={styles.clock}>
      <p className={styles.greeting}>
        {now ? greeting : "Make room for a good day"}
        <span aria-hidden="true">.</span>
      </p>
      <h1 className={styles.time} aria-label="Local time">
        <time dateTime={now?.toISOString()}>
          {now
            ? now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "--:--"}
        </time>
      </h1>
      <p className={styles.date}>
        {now
          ? now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
          : "Your own little corner of the internet"}
      </p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default function NewTab() {
  const preferences = useSyncExternalStore(
    subscribePreferences,
    getPreferences,
    () => DEFAULT_PREFERENCES,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Shortcut[]>([]);
  const [notice, setNotice] = useState("");
  const engine = ENGINES[preferences.engine];

  function openEditor(addShortcut = false) {
    setNotice("");
    const shortcuts = preferences.shortcuts.map((shortcut) => ({
      ...shortcut,
    }));
    if (addShortcut && shortcuts.length < 8)
      shortcuts.push({ name: "", url: "" });
    setDraft(shortcuts);
    dialog.current?.showModal();
  }

  function updateShortcut(index: number, field: keyof Shortcut, value: string) {
    setDraft((current) =>
      current.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function saveShortcuts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const shortcuts = draft.map((item) => ({
      name: item.name.trim(),
      url: item.url.trim(),
    }));
    if (shortcuts.some((item) => !item.name || !isSafeShortcut(item.url))) {
      setNotice(
        "Give each shortcut a name and an http://, https://, or / address.",
      );
      return;
    }
    const persisted = savePreferences({ ...preferences, shortcuts });
    setNotice(
      persisted
        ? "Shortcuts saved on this browser."
        : "Updated for this tab. Browser storage is unavailable.",
    );
    dialog.current?.close();
  }

  return (
    <>
      <LiveWallpaper />
      <header className={styles.header}>
        <Link
          className={styles.brand}
          href="/"
          prefetch={false}
          aria-label="Rynnie home"
        >
          r<span>.</span>
        </Link>
        <span className={styles.headerLabel}>A LITTLE SPACE TO BEGIN</span>
        <button
          className={styles.customize}
          onClick={() => openEditor()}
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="3" fill="currentColor" />
            <circle cx="15" cy="17" r="3" fill="currentColor" />
          </svg>
          Customize
        </button>
      </header>

      <div className={styles.content}>
        <Clock />
        <section className={styles.launcher} aria-label="Search and shortcuts">
          <form
            className={styles.search}
            action={engine.url}
            method="get"
            role="search"
          >
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <label className={styles.srOnly} htmlFor="newtab-query">
              Search the web
            </label>
            <input
              id="newtab-query"
              name="q"
              type="search"
              placeholder="Where to next?"
              required
              autoComplete="off"
              enterKeyHint="search"
            />
            <label className={styles.srOnly} htmlFor="newtab-engine">
              Search engine
            </label>
            <select
              id="newtab-engine"
              value={preferences.engine}
              onChange={(event) => {
                const persisted = savePreferences({
                  ...preferences,
                  engine: event.target.value as Preferences["engine"],
                });
                if (!persisted)
                  setNotice(
                    "Updated for this tab. Browser storage is unavailable.",
                  );
              }}
            >
              {Object.entries(ENGINES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              aria-label={`Search with ${engine.name}`}
              className={styles.go}
            >
              ↗
            </button>
          </form>

          <nav className={styles.shortcuts} aria-label="Favorite sites">
            {preferences.shortcuts.map((shortcut, index) => (
              <a
                key={`${index}-${shortcut.url}`}
                href={shortcut.url}
                className={styles.shortcut}
              >
                <span
                  className={styles.shortcutIcon}
                  data-tone={index % 4}
                  aria-hidden="true"
                >
                  {shortcut.name.slice(0, 1).toUpperCase()}
                </span>
                <span>{shortcut.name}</span>
              </a>
            ))}
            {preferences.shortcuts.length < 8 && (
              <button
                className={styles.shortcut}
                type="button"
                onClick={() => openEditor(true)}
              >
                <span
                  className={`${styles.shortcutIcon} ${styles.addIcon}`}
                  aria-hidden="true"
                >
                  +
                </span>
                <span>Add shortcut</span>
              </button>
            )}
          </nav>
        </section>
      </div>

      <p className={styles.notice} role="status">
        {notice}
      </p>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="shortcuts-title"
      >
        <form onSubmit={saveShortcuts}>
          <div className={styles.dialogHeading}>
            <div>
              <p>MAKE IT YOURS</p>
              <h2 id="shortcuts-title">Your shortcuts</h2>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close customization"
            >
              ×
            </button>
          </div>
          <p className={styles.dialogDescription}>
            Keep your everyday places close. Saved only in this browser.
          </p>
          <div className={styles.editor}>
            {draft.map((shortcut, index) => (
              <div className={styles.editorRow} key={index}>
                <label>
                  Name
                  <input
                    value={shortcut.name}
                    required
                    maxLength={24}
                    onChange={(event) =>
                      updateShortcut(index, "name", event.target.value)
                    }
                  />
                </label>
                <label>
                  Address
                  <input
                    value={shortcut.url}
                    required
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="https://example.com"
                    onChange={(event) => {
                      event.target.setCustomValidity("");
                      updateShortcut(index, "url", event.target.value);
                    }}
                    onInvalid={(event) =>
                      event.currentTarget.setCustomValidity(
                        "Enter a website address.",
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remove shortcut ${index + 1}`}
                  onClick={() =>
                    setDraft((current) =>
                      current.filter((_, position) => position !== index),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {draft.length < 8 && (
            <button
              className={styles.addRow}
              type="button"
              onClick={() =>
                setDraft((current) => [...current, { name: "", url: "" }])
              }
            >
              + Add a shortcut
            </button>
          )}
          <p className={styles.editorNotice} role="status">
            {notice}
          </p>
          <div className={styles.dialogActions}>
            <button
              type="button"
              onClick={() =>
                setDraft(
                  DEFAULT_PREFERENCES.shortcuts.map((item) => ({ ...item })),
                )
              }
            >
              Reset links
            </button>
            <button type="submit">Save changes</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
