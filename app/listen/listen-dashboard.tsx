"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Headphones,
  Music2,
  RefreshCw,
  Mic2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadListenSnapshot,
  clearListenSnapshots,
  readListenSnapshot,
} from "../lib/listen-cache";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import {
  LISTEN_PERIODS,
  parseListenPeriod,
  type ListenData,
  type ListenItem,
  type ListenPeriod,
} from "../lib/lastfm";

type RankingData = Pick<ListenData, "topTracks" | "topArtists" | "unavailable">;
type ItemKind = "recent" | "track" | "artist";
function rankingData(result: ListenData): RankingData {
  return {
    topTracks: result.topTracks,
    topArtists: result.topArtists,
    unavailable: result.unavailable.filter(
      (key) => key === "topTracks" || key === "topArtists",
    ),
  };
}
function Artwork({
  item,
  artist = false,
}: {
  item: ListenItem;
  artist?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const valid =
    item.image &&
    !item.image.includes("2a96cbd8b46e442fc41c2b86b821562f") &&
    !failed;
  const Icon = artist ? Mic2 : Music2;
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center overflow-hidden bg-muted text-muted-foreground ${artist ? "rounded-full" : "rounded-md"}`}
    >
      {valid ? (
        // Artwork is served from variable Last.fm hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon size={19} aria-hidden="true" />
      )}
    </span>
  );
}
function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="px-4 py-10 text-center text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
function LoadingRows() {
  return (
    <div role="status" className="space-y-4 px-4 py-2">
      <span className="sr-only">Loading listening activity</span>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 motion-reduce:animate-none"
          aria-hidden="true"
        >
          <div className="size-11 rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-2 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
function ItemList({ items, kind }: { items: ListenItem[]; kind: ItemKind }) {
  const { t, language } = useSiteSettings();
  if (!items.length)
    return (
      <EmptyState>
        {t("Nothing to show yet.", "ยังไม่มีข้อมูลในตอนนี้")}
      </EmptyState>
    );
  return (
    <ol className="divide-y divide-border/50">
      {items.map((item, index) => {
        const meta =
          kind === "recent"
            ? item.timestamp
              ? new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(item.timestamp * 1000))
              : ""
            : item.plays == null
              ? ""
              : t(
                  `${item.plays.toLocaleString()} plays`,
                  `${item.plays.toLocaleString()} ครั้ง`,
                );
        const content = (
          <>
            <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <Artwork key={item.image} item={item} artist={kind === "artist"} />
            <span className="min-w-0 flex-1">
              <strong
                className="block truncate text-sm font-medium"
                title={item.name}
              >
                {item.name}
              </strong>
              {kind !== "artist" && (
                <span
                  className="block truncate text-xs text-muted-foreground"
                  title={item.artist}
                >
                  {item.artist}
                </span>
              )}
            </span>
            <span className="shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
              {meta}
            </span>
          </>
        );
        const rowClass =
          "flex min-w-0 items-center gap-3 px-4 py-3 text-foreground no-underline transition-colors hover:bg-muted/40";
        return (
          <li key={`${item.url}-${item.timestamp}-${index}`}>
            {item.url ? (
              <a
                className={rowClass}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                {content}
              </a>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
function ListeningPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-4" role="region" aria-label={title}>
      <CardHeader className="border-b">
        <CardTitle>
          <h2 className="text-sm font-medium">{title}</h2>
        </CardTitle>
        <CardDescription className="text-xs">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  );
}

export default function ListenDashboard() {
  const { t, language } = useSiteSettings();
  const [data, setData] = useState<ListenData | null>(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [period, setPeriod] = useState<ListenPeriod>("7day");
  const [rankings, setRankings] = useState<RankingData | null>(null);
  const [rankingsLoading, setRankingsLoading] = useState(true);
  const [rankingsError, setRankingsError] = useState(false);
  const refresh = () => {
    clearListenSnapshots();
    setRankingsLoading(true);
    setRankingsError(false);
    setRetryKey((key) => key + 1);
  };

  useEffect(() => {
    let active = true;
    void loadListenSnapshot("/api/listen?period=7day")
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(false);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [retryKey]);

  useEffect(() => {
    let active = true;
    const endpoint =
      period === "7day"
        ? "/api/listen?period=7day"
        : `/api/listen?view=rankings&period=${period}`;
    void loadListenSnapshot(endpoint)
      .then((result) => {
        if (active) setRankings(rankingData(result));
      })
      .catch(() => {
        if (active) setRankingsError(true);
      })
      .finally(() => {
        if (active) setRankingsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period, retryKey]);

  const choosePeriod = (value: string) => {
    const next = parseListenPeriod(value);
    if (next === period) return;
    const cached = readListenSnapshot(
      next === "7day"
        ? "/api/listen?period=7day"
        : `/api/listen?view=rankings&period=${next}`,
    );
    if (cached) setRankings(rankingData(cached));
    setRankingsLoading(!cached);
    setRankingsError(false);
    setPeriod(next);
  };

  const periodLabels: Record<ListenPeriod, string> = {
    "7day": t("7 Days", "7 วัน"),
    "1month": t("1 Month", "1 เดือน"),
    "3month": t("3 Months", "3 เดือน"),
    "6month": t("6 Months", "6 เดือน"),
    "12month": t("12 Months", "12 เดือน"),
    overall: t("Overall", "ทั้งหมด"),
  };
  const activeRankings = rankings;
  const playcount = data?.profile?.playcount;

  return (
    <main
      className="mx-auto w-[min(1100px,calc(100%-32px))] space-y-6 pb-28"
      aria-label={t("Listening", "การฟังเพลง")}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Headphones size={14} />
            {t("On repeat", "ฟังวนไป")}
          </p>
          <h1 className="text-3xl font-medium tracking-tight">
            {t("My Listening", "เพลงที่เราฟัง")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "Recent discoveries, familiar favorites, and everything in between.",
              "เพลงใหม่ เพลงโปรด และทุกเพลงระหว่างนั้น",
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {data?.profile?.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={data.profile.url} target="_blank" rel="noreferrer">
                Last.fm <ArrowUpRight size={14} />
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("Refresh listening activity", "รีเฟรชข้อมูลการฟัง")}
            onClick={refresh}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </header>
      {error && (
        <Card role="alert">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p>
              {data
                ? t(
                    "Couldn’t refresh. Showing the last update.",
                    "อัปเดตไม่สำเร็จ กำลังแสดงข้อมูลล่าสุด",
                  )
                : t(
                    "Last.fm is unavailable right now.",
                    "ยังเชื่อมต่อ Last.fm ไม่ได้ในตอนนี้",
                  )}
            </p>
            <Button variant="outline" size="sm" onClick={refresh}>
              {t("Try again", "ลองอีกครั้ง")}
            </Button>
          </CardContent>
        </Card>
      )}
      {!data && !error && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{t("Loading…", "กำลังโหลด…")}</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <LoadingRows />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {data && (
        <>
          <Card className="min-w-48 gap-3">
            <CardHeader>
              <CardDescription>
                {t("Total scrobbles", "เพลงที่บันทึกไว้")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium tracking-tight tabular-nums">
                {playcount?.toLocaleString(
                  language === "th" ? "th-TH" : "en-US",
                ) ?? "—"}
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium">
                {t("Listening highlights", "ไฮไลต์การฟัง")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "A closer look at what keeps coming back.",
                  "มาดูเพลงที่เรากลับมาฟังบ่อย ๆ",
                )}
              </p>
            </div>
            <Select value={period} onValueChange={choosePeriod}>
              <SelectTrigger
                aria-label={t("Listening period", "ช่วงเวลาการฟัง")}
                className="w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {LISTEN_PERIODS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {periodLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {rankingsError && (
            <p
              role="status"
              className="rounded-lg border px-4 py-3 text-sm text-muted-foreground"
            >
              {t(
                "That period couldn’t be loaded. Try another range.",
                "โหลดช่วงเวลานี้ไม่สำเร็จ ลองเลือกช่วงอื่น",
              )}
            </p>
          )}
          <div
            className="grid items-start gap-4 lg:grid-cols-3"
            data-rankings
            data-period={period}
          >
            <ListeningPanel
              title={t("Recently played", "เพลงที่ฟังล่าสุด")}
              subtitle={t(
                "Your latest listening history",
                "ประวัติการฟังล่าสุด",
              )}
            >
              {data.unavailable.includes("recent") ? (
                <EmptyState>
                  {t(
                    "Recent tracks are unavailable right now.",
                    "ยังไม่สามารถโหลดเพลงล่าสุดได้",
                  )}
                </EmptyState>
              ) : (
                <ItemList
                  items={data.recent.filter((item) => !item.nowPlaying)}
                  kind="recent"
                />
              )}
            </ListeningPanel>
            <div className="min-w-0" aria-busy={rankingsLoading}>
              <ListeningPanel
                title={t("Top tracks", "เพลงยอดนิยม")}
                subtitle={periodLabels[period]}
              >
                {rankingsLoading ? (
                  <LoadingRows />
                ) : rankingsError ||
                  activeRankings?.unavailable.includes("topTracks") ? (
                  <EmptyState>
                    {t(
                      "Top tracks are unavailable right now.",
                      "ยังไม่สามารถโหลดเพลงยอดนิยมได้",
                    )}
                  </EmptyState>
                ) : (
                  <ItemList
                    items={activeRankings?.topTracks ?? []}
                    kind="track"
                  />
                )}
              </ListeningPanel>
            </div>
            <div className="min-w-0" aria-busy={rankingsLoading}>
              <ListeningPanel
                title={t("Top artists", "ศิลปินยอดนิยม")}
                subtitle={periodLabels[period]}
              >
                {rankingsLoading ? (
                  <LoadingRows />
                ) : rankingsError ||
                  activeRankings?.unavailable.includes("topArtists") ? (
                  <EmptyState>
                    {t(
                      "Top artists are unavailable right now.",
                      "ยังไม่สามารถโหลดศิลปินยอดนิยมได้",
                    )}
                  </EmptyState>
                ) : (
                  <ItemList
                    items={activeRankings?.topArtists ?? []}
                    kind="artist"
                  />
                )}
              </ListeningPanel>
            </div>
          </div>
        </>
      )}
      <footer className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <Music2 size={13} />
        {t("Listening data from Last.fm", "ข้อมูลการฟังจาก Last.fm")}
      </footer>
    </main>
  );
}
