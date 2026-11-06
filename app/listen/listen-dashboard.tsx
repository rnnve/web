"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  IconArrowUpRight,
  IconChartBar,
  IconHeadphones,
  IconMicrophone2,
  IconMusic,
  IconRefresh,
  IconVinyl,
} from "@tabler/icons-react";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import {
  LISTEN_PERIODS,
  parseListenPeriod,
  type ListenData,
  type ListenItem,
  type ListenPeriod,
} from "../lib/lastfm";
import styles from "./listen-dashboard.module.css";

type RankingData = Pick<ListenData, "topTracks" | "topArtists" | "unavailable">;
type ItemKind = "recent" | "track" | "artist";

const LASTFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

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
  variant = "track",
}: {
  item: ListenItem | null;
  variant?: "hero" | "track" | "artist";
}) {
  const [failed, setFailed] = useState(false);
  const image = item?.image ?? "";
  const hasImage = image && !image.includes(LASTFM_PLACEHOLDER) && !failed;
  const FallbackIcon = variant === "artist" ? IconMicrophone2 : IconMusic;

  return (
    <span className={`${styles.artwork} ${styles[`${variant}Artwork`]}`}>
      {hasImage ? (
        // Last.fm artwork hosts vary, so a native image preserves reliable fallback handling.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading={variant === "hero" ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.artworkFallback} aria-hidden="true">
          <FallbackIcon size={variant === "hero" ? 34 : 18} stroke={1.6} />
        </span>
      )}
    </span>
  );
}

function ItemRow({
  item,
  index,
  kind,
}: {
  item: ListenItem;
  index: number;
  kind: ItemKind;
}) {
  const { t, language } = useSiteSettings();
  const metadata =
    kind === "recent"
      ? item.nowPlaying
        ? t("Playing", "กำลังเล่น")
        : item.timestamp
          ? new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en", {
              month: "short",
              day: "numeric",
            }).format(new Date(item.timestamp * 1000))
          : ""
      : item.plays === null
        ? ""
        : t(`${item.plays} plays`, `${item.plays} ครั้ง`);
  const content = (
    <>
      <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
      <Artwork
        key={`${kind}-${item.image}-${item.name}`}
        item={item}
        variant={kind === "artist" ? "artist" : "track"}
      />
      <span className={styles.itemCopy}>
        <strong title={item.name}>{item.name}</strong>
        {kind !== "artist" && item.artist && (
          <small title={item.artist}>{item.artist}</small>
        )}
      </span>
      <span className={styles.itemMeta}>
        {item.nowPlaying && <i aria-hidden="true" />}
        {metadata}
      </span>
    </>
  );

  return (
    <li className={item.nowPlaying ? styles.activeRow : undefined}>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noreferrer">
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </li>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className={styles.emptyState} role="status">
      <IconMusic size={20} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

function ItemList({ items, kind }: { items: ListenItem[]; kind: ItemKind }) {
  const { t } = useSiteSettings();
  if (!items.length)
    return (
      <EmptyState>
        {t("Nothing to show yet.", "ยังไม่มีข้อมูลในตอนนี้")}
      </EmptyState>
    );

  return (
    <ol
      className={`${styles.list} ${kind === "recent" ? styles.recentList : ""}`}
    >
      {items.map((item, index) => (
        <ItemRow
          key={`${item.url}-${item.timestamp ?? "ranked"}-${index}`}
          item={item}
          index={index}
          kind={kind}
        />
      ))}
    </ol>
  );
}

function SectionHeader({
  number,
  eyebrow,
  title,
  id,
}: {
  number: string;
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <span>
        {number} / {eyebrow}
      </span>
      <h2 id={id}>{title}</h2>
    </header>
  );
}

function Equalizer({ active }: { active: boolean }) {
  return (
    <span
      className={`${styles.equalizer} ${active ? styles.equalizerActive : ""}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </span>
  );
}

function ListeningSkeleton() {
  const { t } = useSiteSettings();
  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-label={t("Loading listening activity", "กำลังโหลดข้อมูลการฟัง")}
    >
      <div className={styles.skeletonHero} aria-hidden="true">
        <span className={`${styles.skeletonBlock} ${styles.skeletonCover}`} />
        <div className={styles.skeletonCopy}>
          <span className={`${styles.skeletonBlock} ${styles.skeletonLabel}`} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonText}`} />
        </div>
        <span className={`${styles.skeletonBlock} ${styles.skeletonStat}`} />
      </div>
      <div className={styles.skeletonPanels} aria-hidden="true">
        {[0, 1, 2].map((panel) => (
          <div className={styles.skeletonPanel} key={panel}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonHeading}`}
            />
            {[0, 1, 2, 3].map((row) => (
              <span
                className={`${styles.skeletonBlock} ${styles.skeletonRow}`}
                key={row}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListenDashboard() {
  const { t, language } = useSiteSettings();
  const [data, setData] = useState<ListenData | null>(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [period, setPeriod] = useState<ListenPeriod>("7day");
  const [rankings, setRankings] = useState<RankingData | null>(null);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingsError, setRankingsError] = useState(false);
  const periodRef = useRef<ListenPeriod>("7day");
  const rankingCache = useRef(new Map<ListenPeriod, RankingData>());

  useEffect(() => {
    let active = true;
    let firstRequest = true;
    let controller: AbortController | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const endpoint = firstRequest
          ? "/api/listen?period=7day"
          : "/api/listen?view=activity";
        const response = await fetch(endpoint, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unavailable");
        const result = (await response.json()) as ListenData;
        if (!active) return;

        if (firstRequest) {
          const initialRankings = rankingData(result);
          rankingCache.current.set("7day", initialRankings);
          setData(result);
          if (periodRef.current === "7day") setRankings(initialRankings);
          firstRequest = false;
        } else {
          setData((previous) =>
            previous
              ? {
                  ...previous,
                  current: result.unavailable.includes("current")
                    ? previous.current
                    : result.current,
                  recent: result.unavailable.includes("recent")
                    ? previous.recent
                    : result.recent,
                  profile: result.unavailable.includes("profile")
                    ? previous.profile
                    : result.profile,
                  unavailable: [
                    ...previous.unavailable.filter(
                      (key) => key === "topTracks" || key === "topArtists",
                    ),
                    ...result.unavailable,
                  ],
                }
              : result,
          );
        }
        setError(false);
      } catch (loadError) {
        if (
          active &&
          !(loadError instanceof Error && loadError.name === "AbortError")
        )
          setError(true);
      }
    };

    const refresh = () => {
      if (!document.hidden) void load();
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [retryKey]);

  useEffect(() => {
    if (period === "7day") {
      const cached = rankingCache.current.get(period);
      if (cached) setRankings(cached);
      setRankingsError(false);
      setRankingsLoading(false);
      return;
    }

    const cached = rankingCache.current.get(period);
    if (cached) {
      setRankings(cached);
      setRankingsError(false);
      setRankingsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setRankings(null);
    setRankingsLoading(true);
    setRankingsError(false);
    void fetch(`/api/listen?view=rankings&period=${period}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return (await response.json()) as ListenData;
      })
      .then((result) => {
        if (!active) return;
        const nextRankings = rankingData(result);
        rankingCache.current.set(period, nextRankings);
        setRankings(nextRankings);
      })
      .catch((rankingError) => {
        if (
          active &&
          !(rankingError instanceof Error && rankingError.name === "AbortError")
        )
          setRankingsError(true);
      })
      .finally(() => {
        if (active) setRankingsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [period]);

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPeriod = parseListenPeriod(event.target.value);
    periodRef.current = nextPeriod;
    setPeriod(nextPeriod);
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
  const current = data?.current ?? null;

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            <IconHeadphones size={15} aria-hidden="true" />
            {t("A LITTLE LISTENING LOG", "บันทึกเพลงที่ฟัง")}
          </span>
          <h1>
            {t("My Listening", "เพลงที่เราฟัง")}
            <span>.</span>
          </h1>
          <p>
            {t(
              "A little peek at what I’ve been listening to.",
              "แวะมาดูเพลงที่เราฟังกัน",
            )}
          </p>
        </div>
        {data?.profile?.url && (
          <a
            className={styles.profileLink}
            href={data.profile.url}
            target="_blank"
            rel="noreferrer"
          >
            Last.fm <IconArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </header>

      {error && data && (
        <div className={styles.alert} role="status">
          <span>
            {t(
              "Couldn’t refresh. Showing the last update.",
              "อัปเดตไม่สำเร็จ กำลังแสดงข้อมูลล่าสุด",
            )}
          </span>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
            <IconRefresh size={15} aria-hidden="true" />
            {t("Retry", "ลองอีกครั้ง")}
          </button>
        </div>
      )}

      {!data && !error && <ListeningSkeleton />}

      {!data && error && (
        <section className={styles.unavailable} role="alert">
          <IconMusic size={28} aria-hidden="true" />
          <h2>{t("Listening is offline.", "ข้อมูลเพลงออฟไลน์อยู่")}</h2>
          <p>
            {t(
              "Last.fm couldn’t be reached right now. Please try again in a moment.",
              "ยังเชื่อมต่อ Last.fm ไม่ได้ในตอนนี้ กรุณาลองอีกครั้ง",
            )}
          </p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
            <IconRefresh size={16} aria-hidden="true" />
            {t("Try again", "ลองอีกครั้ง")}
          </button>
        </section>
      )}

      {data && (
        <div className={styles.dashboard}>
          <section
            className={`${styles.hero} ${current ? "" : styles.heroEmpty}`}
            aria-labelledby="listen-current"
          >
            <Artwork
              key={`hero-${current?.image ?? "empty"}`}
              item={current}
              variant="hero"
            />
            <div
              className={styles.heroCopy}
              key={current?.url || current?.name || "empty"}
            >
              <span className={styles.liveLabel}>
                <Equalizer active={current?.nowPlaying === true} />
                {data.unavailable.includes("current")
                  ? t("LISTENING STATUS", "สถานะการฟัง")
                  : current?.nowPlaying
                    ? t("NOW PLAYING", "กำลังฟัง")
                    : t("LAST PLAYED", "ฟังล่าสุด")}
              </span>
              {current ? (
                <>
                  <h2 id="listen-current" title={current.name}>
                    {current.url ? (
                      <a href={current.url} target="_blank" rel="noreferrer">
                        {current.name}
                      </a>
                    ) : (
                      current.name
                    )}
                  </h2>
                  <p className={styles.heroArtist}>{current.artist}</p>
                  {current.album && (
                    <p className={styles.heroAlbum} title={current.album}>
                      <IconVinyl size={15} aria-hidden="true" />
                      {current.album}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 id="listen-current">
                    {data.unavailable.includes("current")
                      ? t(
                          "Listening status is unavailable.",
                          "ยังไม่สามารถโหลดสถานะการฟังได้",
                        )
                      : t("Quiet for now.", "ตอนนี้ยังเงียบอยู่")}
                  </h2>
                  <p className={styles.heroArtist}>
                    {t(
                      "The next track will appear here.",
                      "เพลงถัดไปจะแสดงตรงนี้",
                    )}
                  </p>
                </>
              )}
            </div>
            <div className={styles.scrobbleStat}>
              <span>{t("TOTAL SCROBBLES", "เพลงที่บันทึกไว้")}</span>
              <strong>
                {data.profile?.playcount?.toLocaleString(
                  language === "th" ? "th-TH" : "en-US",
                ) ?? "—"}
              </strong>
              <small>{t("and counting", "และเพิ่มขึ้นเรื่อย ๆ")}</small>
            </div>
          </section>

          <div className={styles.dashboardToolbar}>
            <div>
              <IconChartBar size={17} aria-hidden="true" />
              <span>{t("Listening highlights", "ไฮไลต์การฟัง")}</span>
            </div>
            <label className={styles.periodControl}>
              <span>{t("Period", "ช่วงเวลา")}</span>
              <select
                value={period}
                onChange={handlePeriodChange}
                aria-label={t("Listening period", "ช่วงเวลาการฟัง")}
              >
                {LISTEN_PERIODS.map((option) => (
                  <option value={option} key={option}>
                    {periodLabels[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {rankingsError && (
            <p className={styles.rankingsError} role="status">
              {t(
                "That period couldn’t be loaded. Try another range.",
                "โหลดช่วงเวลานี้ไม่สำเร็จ ลองเลือกช่วงอื่น",
              )}
            </p>
          )}

          <div
            className={`${styles.panelGrid} ${rankingsLoading ? styles.rankingsLoading : ""}`}
            aria-busy={rankingsLoading}
            data-rankings
            data-period={period}
          >
            <section className={`${styles.panel} ${styles.recentPanel}`}>
              <SectionHeader
                number="01"
                eyebrow={t("THE LATEST", "ล่าสุด")}
                title={t("Recently played", "เพลงที่ฟังล่าสุด")}
                id="listen-recent"
              />
              {data.unavailable.includes("recent") ? (
                <EmptyState>
                  {t(
                    "Recent tracks are unavailable right now.",
                    "ยังไม่สามารถโหลดเพลงล่าสุดได้",
                  )}
                </EmptyState>
              ) : (
                <ItemList items={data.recent} kind="recent" />
              )}
            </section>

            <section className={styles.panel}>
              <SectionHeader
                number="02"
                eyebrow={periodLabels[period].toUpperCase()}
                title={t("Top tracks", "เพลงยอดนิยม")}
                id="listen-tracks"
              />
              {activeRankings?.unavailable.includes("topTracks") ? (
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
            </section>

            <section className={styles.panel}>
              <SectionHeader
                number="03"
                eyebrow={periodLabels[period].toUpperCase()}
                title={t("Top artists", "ศิลปินยอดนิยม")}
                id="listen-artists"
              />
              {activeRankings?.unavailable.includes("topArtists") ? (
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
            </section>
          </div>
        </div>
      )}

      <footer className={styles.dataFooter}>
        {t("Listening data from Last.fm", "ข้อมูลการฟังจาก Last.fm")}
      </footer>
    </main>
  );
}
