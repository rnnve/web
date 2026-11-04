"use client";

import { useEffect, useState } from "react";
import {
  IconArrowUpRight,
  IconHeadphones,
  IconMusic,
  IconVinyl,
} from "@tabler/icons-react";
import { useSiteSettings } from "../components/site-settings-provider";
import type { ListenData, ListenItem } from "../lib/lastfm";

function Artwork({
  item,
  large = false,
}: {
  item: ListenItem;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const placeholder = item.image.includes("2a96cbd8b46e442fc41c2b86b821562f");
  return (
    <span className={`listen-art${large ? " listen-art--large" : ""}`}>
      {item.image && !placeholder && !failed ? (
        // External album artwork is supplied by Last.fm.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading={large ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      ) : (
        <IconMusic size={large ? 48 : 20} aria-hidden="true" />
      )}
    </span>
  );
}

function ItemList({
  items,
  kind,
}: {
  items: ListenItem[];
  kind: "recent" | "ranked";
}) {
  const { t, language } = useSiteSettings();
  if (!items.length)
    return (
      <p className="listen-empty">
        {t("Nothing to show yet.", "ยังไม่มีข้อมูลในตอนนี้")}
      </p>
    );
  return (
    <ol className="listen-list">
      {items.map((entry, index) => {
        const body = (
          <>
            <span className="listen-rank">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Artwork item={entry} />
            <span className="listen-item-copy">
              <strong>{entry.name}</strong>
              {entry.artist && <small>{entry.artist}</small>}
            </span>
            <span className="listen-item-meta">
              {kind === "ranked" && entry.plays !== null
                ? t(`${entry.plays} plays`, `${entry.plays} ครั้ง`)
                : entry.nowPlaying
                  ? t("Playing", "กำลังเล่น")
                  : entry.timestamp
                    ? new Intl.DateTimeFormat(
                        language === "th" ? "th-TH" : "en",
                        { month: "short", day: "numeric" },
                      ).format(new Date(entry.timestamp * 1000))
                    : ""}
            </span>
          </>
        );
        return (
          <li key={`${entry.url}-${entry.timestamp ?? ""}-${index}`}>
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <div>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ListeningSkeleton() {
  const { t } = useSiteSettings();
  return (
    <div
      role="status"
      aria-label={t("Loading listening activity", "กำลังโหลดข้อมูลการฟัง")}
    >
      <div aria-hidden="true">
        <div className="listen-spotlight listen-skeleton-spotlight">
          <span className="listen-skeleton listen-skeleton-art" />
          <div className="listen-skeleton-copy">
            <span className="listen-skeleton listen-skeleton-label" />
            <span className="listen-skeleton listen-skeleton-title" />
            <span className="listen-skeleton listen-skeleton-subtitle" />
          </div>
        </div>
        <div className="listen-section">
          <div className="listen-skeleton listen-skeleton-heading" />
          <div className="listen-skeleton-list">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="listen-skeleton-row" key={index}>
                <span className="listen-skeleton listen-skeleton-thumb" />
                <div className="listen-skeleton-row-copy">
                  <span className="listen-skeleton listen-skeleton-row-title" />
                  <span className="listen-skeleton listen-skeleton-row-subtitle" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListenDashboard() {
  const { t } = useSiteSettings();
  const [data, setData] = useState<ListenData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/listen", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unavailable");
        const result = (await response.json()) as ListenData;
        if (active) {
          setData(result);
          setError(false);
        }
      } catch (error) {
        if (active && !(error instanceof Error && error.name === "AbortError"))
          setError(true);
      }
    };
    const refresh = () => {
      if (!document.hidden) void load();
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const current = data?.current;
  return (
    <main className="listen-page">
      <header className="listen-heading">
        <div>
          <span className="listen-kicker">
            <IconHeadphones size={16} />{" "}
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
            className="listen-profile"
            href={data.profile.url}
            target="_blank"
            rel="noreferrer"
          >
            Last.fm <IconArrowUpRight size={17} />
          </a>
        )}
      </header>
      {error && (
        <p className="listen-alert" role="status">
          {data
            ? t(
                "Couldn’t refresh. Showing the last update.",
                "อัปเดตไม่สำเร็จ กำลังแสดงข้อมูลล่าสุด",
              )
            : t(
                "Listening activity is temporarily unavailable.",
                "ยังไม่สามารถโหลดข้อมูลเพลงได้",
              )}
        </p>
      )}
      {!data && !error && <ListeningSkeleton />}
      {data && (
        <>
          <section
            className={`listen-spotlight${current ? "" : " listen-spotlight--empty"}`}
            aria-labelledby="listen-current"
          >
            {current && <Artwork key={current.image} item={current} large />}
            <div className="listen-spotlight-copy">
              <span className="listen-live">
                <i />{" "}
                {data.unavailable.includes("current")
                  ? t("LISTENING STATUS", "สถานะการฟัง")
                  : current?.nowPlaying
                    ? t("NOW PLAYING", "กำลังฟัง")
                    : t("LAST PLAYED", "ฟังล่าสุด")}
              </span>
              {current ? (
                <>
                  <h2 id="listen-current">
                    {current.url ? (
                      <a href={current.url} target="_blank" rel="noreferrer">
                        {current.name}
                        <span className="listen-visually-hidden">
                          {" "}
                          {t("on Last.fm", "บน Last.fm")}
                        </span>
                      </a>
                    ) : (
                      current.name
                    )}
                  </h2>
                  <p className="listen-artist">{current.artist}</p>
                  {current.album && (
                    <p className="listen-album">
                      <IconVinyl size={16} /> {current.album}
                    </p>
                  )}
                </>
              ) : (
                <h2 id="listen-current">
                  {data.unavailable.includes("current")
                    ? t(
                        "Listening status is unavailable right now.",
                        "ยังไม่สามารถโหลดสถานะการฟังได้",
                      )
                    : t("No recent track yet.", "ยังไม่มีเพลงที่ฟังล่าสุด")}
                </h2>
              )}
            </div>
          </section>
          {data.profile?.playcount !== null &&
            data.profile?.playcount !== undefined && (
              <p className="listen-total">
                {data.profile.playcount.toLocaleString()}{" "}
                <span>{t("scrobbles and counting", "เพลงที่บันทึกไว้")}</span>
              </p>
            )}
          <section className="listen-section" aria-labelledby="listen-recent">
            <div className="listen-section-heading">
              <div>
                <span>01 / {t("THE LATEST", "ล่าสุด")}</span>
                <h2 id="listen-recent">
                  {t("Recently played", "เพลงที่ฟังล่าสุด")}
                </h2>
              </div>
              <p>{t("The soundtrack lately.", "ซาวด์แทร็กช่วงนี้")}</p>
            </div>
            {data.unavailable.includes("recent") ? (
              <p className="listen-empty">
                {t(
                  "Recent tracks are unavailable right now.",
                  "ยังไม่สามารถโหลดเพลงล่าสุดได้",
                )}
              </p>
            ) : (
              <ItemList items={data.recent} kind="recent" />
            )}
          </section>
          <div className="listen-columns">
            <section className="listen-section" aria-labelledby="listen-tracks">
              <div className="listen-section-heading">
                <div>
                  <span>02 / {t("LAST 7 DAYS", "7 วันที่ผ่านมา")}</span>
                  <h2 id="listen-tracks">{t("Top tracks", "เพลงยอดนิยม")}</h2>
                </div>
              </div>
              {data.unavailable.includes("topTracks") ? (
                <p className="listen-empty">
                  {t(
                    "Top tracks are unavailable right now.",
                    "ยังไม่สามารถโหลดเพลงยอดนิยมได้",
                  )}
                </p>
              ) : (
                <ItemList items={data.topTracks} kind="ranked" />
              )}
            </section>
            <section
              className="listen-section"
              aria-labelledby="listen-artists"
            >
              <div className="listen-section-heading">
                <div>
                  <span>03 / {t("LAST 7 DAYS", "7 วันที่ผ่านมา")}</span>
                  <h2 id="listen-artists">
                    {t("Top artists", "ศิลปินยอดนิยม")}
                  </h2>
                </div>
              </div>
              {data.unavailable.includes("topArtists") ? (
                <p className="listen-empty">
                  {t(
                    "Top artists are unavailable right now.",
                    "ยังไม่สามารถโหลดศิลปินยอดนิยมได้",
                  )}
                </p>
              ) : (
                <ItemList items={data.topArtists} kind="ranked" />
              )}
            </section>
          </div>
        </>
      )}
      <footer className="listen-footer">
        {t("Listening data from Last.fm", "ข้อมูลการฟังจาก Last.fm")}
      </footer>
    </main>
  );
}
