"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  Code2,
  Disc3,
  FolderGit2,
  History,
  Inbox,
  Mail,
  Music2,
  RefreshCw,
  Search,
  Send,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { activityCells, normalizeRepos } from "../lib/github";
import {
  LISTEN_PERIODS,
  type ListenItem,
  type ListenPeriod,
} from "../lib/lastfm";
import { clearListenSnapshots, loadListenSnapshot } from "../lib/listen-cache";
import { requestWidget } from "../lib/widget-request";
import styles from "./native-apps.module.css";

export type NativeAppId =
  "listening" | "ask" | "developing" | "portfolio" | "newtab";
const periodLabels: Record<ListenPeriod, string> = {
  "7day": "This week",
  "1month": "This month",
  "3month": "3 months",
  "6month": "6 months",
  "12month": "This year",
  overall: "All time",
};

function useResource<T>(url: string, loader: (url: string) => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    url: string;
    version: number;
    data: T | null;
    error: boolean;
  }>({ url: "", version: -1, data: null, error: false });
  useEffect(() => {
    let active = true;
    void loader(url)
      .then((data) => {
        if (active) setState({ url, version, data, error: false });
      })
      .catch(() => {
        if (active) setState({ url, version, data: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [url, loader, version]);
  const current = state.url === url && state.version === version;
  return {
    data: current ? state.data : null,
    error: current && state.error,
    loading: !current,
    retry: () => setVersion((value) => value + 1),
  };
}

function AppMessage({
  error = false,
  retry,
}: {
  error?: boolean;
  retry?: () => void;
}) {
  return (
    <div className={styles.message} role={error ? "alert" : "status"}>
      <Music2 size={25} strokeWidth={1.3} />
      <p>{error ? "Couldn’t connect right now." : "Opening your library…"}</p>
      {error && retry && (
        <Button variant="ghost" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}

function Cover({ item }: { item: ListenItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={styles.cover}>
      {item.image &&
      !failed &&
      !item.image.includes("2a96cbd8b46e442fc41c2b86b821562f") ? (
        // Last.fm supplies artwork from multiple image hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <Music2 size={18} strokeWidth={1.4} />
      )}
    </span>
  );
}

function ListeningApp() {
  const [view, setView] = useState<"history" | "tracks" | "artists">("history");
  const [period, setPeriod] = useState<ListenPeriod>("7day");
  const [query, setQuery] = useState("");
  const activity = useResource("/api/listen?period=7day", loadListenSnapshot);
  const endpoint =
    view === "history" || period === "7day"
      ? "/api/listen?period=7day"
      : `/api/listen?view=rankings&period=${period}`;
  const library = useResource(endpoint, loadListenSnapshot);
  const refresh = () => {
    clearListenSnapshots();
    activity.retry();
    library.retry();
  };
  const data = library.data;
  const key =
    view === "history"
      ? "recent"
      : view === "tracks"
        ? "topTracks"
        : "topArtists";
  const items = (data?.[key] ?? []).filter(
    (item) =>
      !item.nowPlaying &&
      `${item.name} ${item.artist}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as typeof view)}
      orientation="vertical"
      className={styles.workspace}
      aria-label="Listening application"
    >
      <aside className={styles.sidebar}>
        <span className={styles.appMark}>
          <Disc3 size={22} />
          Listening
        </span>
        <span className={styles.sectionLabel}>YOUR LIBRARY</span>
        <TabsList className={styles.libraryTabs} aria-label="Library views">
          {(
            [
              { id: "history", label: "History", icon: History },
              { id: "tracks", label: "Top tracks", icon: Music2 },
              { id: "artists", label: "Top artists", icon: Users },
            ] as const
          ).map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              <tab.icon size={15} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className={styles.sidebarFoot}>
          <span>SCROBBLES</span>
          <strong>
            {activity.data?.profile?.playcount?.toLocaleString() ?? "—"}
          </strong>
          <small>From Last.fm</small>
        </div>
      </aside>
      <TabsContent value={view} className={styles.main}>
        <div className={styles.toolbar}>
          <span>
            Library <span>/</span>{" "}
            {view === "history"
              ? "History"
              : view === "tracks"
                ? "Tracks"
                : "Artists"}
          </span>
          <div>
            {view !== "history" && (
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as ListenPeriod)}
              >
                <SelectTrigger aria-label="Library period" className="h-8 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTEN_PERIODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {periodLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="ghost"
              onClick={refresh}
              aria-label="Refresh library"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <span className={styles.sectionLabel}>
                SOUNDTRACK TO THE EVERYDAY
              </span>
              <h2>
                {view === "history"
                  ? "Your rotation."
                  : view === "tracks"
                    ? "On repeat."
                    : "Familiar voices."}
              </h2>
              <p>
                {view === "history"
                  ? "The songs you’ve been spending time with."
                  : `Your favorites · ${periodLabels[period].toLowerCase()}`}
              </p>
            </div>
            <Music2 size={45} strokeWidth={1} className={styles.headingIcon} />
          </div>
          <label className={styles.search}>
            <Search size={14} />
            <Input
              aria-label="Search library"
              placeholder="Find a song or artist"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {library.loading ? (
            <AppMessage />
          ) : library.error ? (
            <AppMessage error retry={refresh} />
          ) : data?.unavailable.includes(key) ? (
            <p role="status" className={styles.empty}>
              This part of the library is temporarily unavailable.
              <Button variant="ghost" onClick={refresh}>
                Try again
              </Button>
            </p>
          ) : (
            <>
              <div className={styles.tableHeading}>
                <span>#</span>
                <span>{view === "artists" ? "ARTIST" : "TITLE / ARTIST"}</span>
                <span>{view === "history" ? "PLAYED" : "PLAYS"}</span>
              </div>
              <ol className={styles.trackList}>
                {items.map((item, index) => {
                  const row = (
                    <>
                      <span className={styles.rank}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Cover key={item.image} item={item} />
                      <span className={styles.trackCopy}>
                        <strong>{item.name}</strong>
                        {view !== "artists" && <small>{item.artist}</small>}
                      </span>
                      <span className={styles.meta}>
                        {view === "history"
                          ? item.timestamp
                            ? new Date(
                                item.timestamp * 1000,
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"
                          : (item.plays?.toLocaleString() ?? "—")}
                      </span>
                    </>
                  );
                  return (
                    <li key={`${item.name}-${index}`}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {row}
                        </a>
                      ) : (
                        <div>{row}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
              {!items.length && (
                <p className={styles.empty}>
                  {query
                    ? "No matches in this view."
                    : "No listening history here yet."}
                </p>
              )}
            </>
          )}
        </div>
        <footer className={styles.statusbar}>
          {items.length} items <span>Listening library</span>
        </footer>
      </TabsContent>
    </Tabs>
  );
}

type GitHubData = { repos: unknown; contributions: unknown };
const loadGitHub = (url: string) => requestWidget<GitHubData>(url);
function DevelopingApp() {
  const resource = useResource("/api/status/github", loadGitHub);
  const [selected, setSelected] = useState<string | null>(null);
  const repos = normalizeRepos(resource.data?.repos);
  const repo = repos.find((item) => item.name === selected) ?? repos[0];
  const cells = activityCells(resource.data?.contributions);
  const year = new Date().getUTCFullYear();
  const total = cells.reduce((sum, cell) => sum + cell.count, 0);
  return (
    <div
      className={styles.workspace}
      role="region"
      aria-label="Developing application"
    >
      <aside className={styles.sidebar}>
        <span className={styles.appMark}>
          <Code2 size={22} />
          Developing
        </span>
        <span className={styles.sectionLabel}>PROJECT EXPLORER</span>
        {repos.map((item) => (
          <Button
            variant="ghost"
            key={item.name}
            aria-pressed={repo?.name === item.name}
            onClick={() => setSelected(item.name)}
          >
            <FolderGit2 size={15} />
            <span>{item.name}</span>
          </Button>
        ))}
        {!repos.length && (
          <p className={styles.sidebarHint}>Projects will appear here.</p>
        )}
        <div className={styles.sidebarFoot}>
          <span>WORKSPACE</span>
          <strong>rnnve</strong>
          <small>Code & craft</small>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.toolbar}>
          <span>
            Workspace <span>/</span> {repo?.name ?? "Overview"}
          </span>
          <Button
            variant="ghost"
            onClick={resource.retry}
            aria-label="Refresh projects"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
        <div className={styles.content}>
          {resource.loading ? (
            <AppMessage />
          ) : resource.error ? (
            <AppMessage error retry={resource.retry} />
          ) : (
            <>
              <div className={styles.heading}>
                <div>
                  <span className={styles.sectionLabel}>PROJECT README</span>
                  <h2>{repo?.name ?? "A work in progress."}</h2>
                  <p>
                    {repo?.description ??
                      "Discord bots, websites, and small things for the internet."}
                  </p>
                </div>
                <Code2
                  size={45}
                  strokeWidth={1}
                  className={styles.headingIcon}
                />
              </div>
              {repo && (
                <div className={styles.repoInfo}>
                  <Badge variant="secondary">{repo.language || "Code"}</Badge>
                  <span>
                    <Star size={13} />
                    {repo.stars} stars
                  </span>
                  <a href={repo.url} target="_blank" rel="noreferrer">
                    View source <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
              <Card className={styles.calendar}>
                <header>
                  <span>{year} / CONTRIBUTIONS</span>
                  <strong>
                    {Array.isArray(resource.data?.contributions)
                      ? `${total.toLocaleString()} contributions`
                      : "Calendar unavailable"}
                  </strong>
                </header>
                {Array.isArray(resource.data?.contributions) && (
                  <div className={styles.calendarScroll}>
                    <div
                      className={styles.graph}
                      aria-label={`${year} native contribution calendar`}
                    >
                      {cells.map((cell) => (
                        <span
                          key={cell.key}
                          data-level={cell.level}
                          data-outside={!cell.inYear}
                          data-future={cell.future}
                          title={`${cell.key}: ${cell.count} contributions`}
                          tabIndex={cell.inYear && !cell.future ? 0 : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <small>January — December</small>
              </Card>
              <span className={styles.sectionLabel}>BUILT WITH</span>
              <div className={styles.tags}>
                {[
                  "TypeScript",
                  "React",
                  "Next.js",
                  "Tailwind CSS",
                  "Bun",
                  "Git",
                ].map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </>
          )}
        </div>
        <footer className={styles.statusbar}>
          {repos.length} projects <span>Public GitHub workspace</span>
        </footer>
      </div>
    </div>
  );
}

const subscribeSession = () => () => {};
function sentSnapshot() {
  try {
    return sessionStorage.getItem("rynnie.ask.sent") === "true";
  } catch {
    return false;
  }
}
function AskApp() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const sending = useRef(false);
  const sentInSession = useSyncExternalStore<boolean | null>(
    subscribeSession,
    sentSnapshot,
    () => null,
  );
  const sent = status === "sent" || sentInSession === true;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current || sent || sentInSession === null || !question.trim())
      return;
    sending.current = true;
    setStatus("sending");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true)
        throw new Error("Delivery failed");
      try {
        sessionStorage.setItem("rynnie.ask.sent", "true");
      } catch {}
      setQuestion("");
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }
  return (
    <div
      className={styles.workspace}
      role="region"
      aria-label="Ask application"
    >
      <aside className={styles.sidebar}>
        <span className={styles.appMark}>
          <Mail size={22} />
          Ask
        </span>
        <span className={styles.sectionLabel}>ANONYMOUS MAIL</span>
        <span className={styles.selectedRow}>
          <Send size={15} />
          {sent ? "Delivered" : "Compose"}
        </span>
        <div className={styles.sidebarFoot}>
          <Inbox size={25} strokeWidth={1.2} />
          <small>
            A little conversation,
            <br />
            without the introductions.
          </small>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.toolbar}>
          <span>
            Mail <span>/</span> {sent ? "Sent" : "New question"}
          </span>
          <span className={styles.privacy}>ANONYMOUS</span>
        </div>
        {sent ? (
          <div className={styles.sent} role="status">
            <span>
              <Check size={30} />
            </span>
            <h2>Message delivered.</h2>
            <p>
              Your question is on its way to Rynnie.
              <br />
              Thanks for stopping by.
            </p>
            <small>One question per browser session.</small>
          </div>
        ) : (
          <Card className={styles.composerCard}>
            <form className={styles.composer} onSubmit={submit}>
              <div className={styles.mailField}>
                <span>To</span>
                <strong>Rynnie</strong>
              </div>
              <div className={styles.mailField}>
                <span>From</span>
                <strong>Anonymous visitor</strong>
              </div>
              <Label htmlFor="os-question" className={styles.composeLabel}>
                Your question
              </Label>
              <Textarea
                id="os-question"
                aria-label="Your anonymous question"
                placeholder="What’s on your mind?"
                maxLength={1000}
                value={question}
                disabled={status === "sending" || sentInSession === null}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
              />
              {status === "error" && (
                <p role="alert" className={styles.deliveryError}>
                  Couldn’t send your question. Your draft is still here — try
                  again.
                </p>
              )}
              <footer>
                <span>{question.length} / 1000</span>
                <Button
                  variant="default"
                  className={styles.primary}
                  disabled={
                    !question.trim() ||
                    status === "sending" ||
                    sentInSession === null
                  }
                >
                  <Send size={14} />
                  {status === "sending" ? "Sending…" : "Send question"}
                </Button>
              </footer>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

function StartApp({
  portfolio,
  onOpen,
}: {
  portfolio: boolean;
  onOpen: (id: NativeAppId) => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <section
      className={styles.start}
      aria-label={portfolio ? "Portfolio application" : "Start application"}
    >
      <span className={styles.sectionLabel}>
        {portfolio ? "ABOUT THIS WORKSPACE" : "A FRESH START"}
      </span>
      <h2>{portfolio ? "Hello, I’m Rynnie." : "Where to next?"}</h2>
      <p>
        {portfolio
          ? "I build Discord bots, websites, and little things for the internet. Explore my work, leave a question, or see what’s been on repeat."
          : "Search the web or jump into your desktop apps."}
      </p>
      {!portfolio && (
        <form
          action="https://www.google.com/search"
          target="_blank"
          rel="noreferrer"
          className={styles.search}
        >
          <Search size={16} />
          <Input
            aria-label="Search the web"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the web…"
            required
          />
          <Button variant="ghost" aria-label="Search">
            <ArrowUpRight size={16} />
          </Button>
        </form>
      )}
      <div className={styles.startLinks}>
        {(
          [
            {
              id: "listening",
              title: "Listening",
              text: "The soundtrack",
              icon: Music2,
            },
            {
              id: "ask",
              title: "Ask",
              text: "A little conversation",
              icon: Mail,
            },
            {
              id: "developing",
              title: "Developing",
              text: "Code & craft",
              icon: Code2,
            },
          ] as const
        ).map((app) => (
          <Button variant="ghost" key={app.id} onClick={() => onOpen(app.id)}>
            <app.icon size={25} strokeWidth={1.3} />
            <strong>{app.title}</strong>
            <span>{app.text}</span>
            <ArrowUpRight size={14} />
          </Button>
        ))}
      </div>
    </section>
  );
}

export default function NativeApps({
  id,
  onOpen,
}: {
  id: NativeAppId;
  onOpen: (id: NativeAppId) => void;
}) {
  if (id === "listening") return <ListeningApp />;
  if (id === "developing") return <DevelopingApp />;
  if (id === "ask") return <AskApp />;
  return <StartApp portfolio={id === "portfolio"} onOpen={onOpen} />;
}
