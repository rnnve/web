"use client";

import { useCallback, useEffect, useState } from "react";
import type { LyricsRecord } from "../lib/lyrics";
import { LyricsRequestError, requestLyrics } from "../lib/lyrics-request";

type Result = {
  query: string;
  lyrics: LyricsRecord | null;
  loading: boolean;
  error: boolean;
  retryAt: number;
};
const empty: Result = {
  query: "",
  lyrics: null,
  loading: false,
  error: false,
  retryAt: 0,
};

export default function useTrackLyrics(query: string) {
  const [result, setResult] = useState(empty);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(0);
  const retry = useCallback(() => {
    setResult({ ...empty, query, loading: true });
    setAttempt((value) => value + 1);
  }, [query]);
  useEffect(() => {
    let active = true;
    if (!query) return;
    void requestLyrics(query)
      .then((lyrics) => {
        if (active) setResult({ ...empty, query, lyrics });
      })
      .catch((error) => {
        if (!active) return;
        setNow(Date.now());
        setResult({
          ...empty,
          query,
          error: true,
          retryAt: error instanceof LyricsRequestError ? error.retryAt : 0,
        });
      });
    return () => {
      active = false;
    };
  }, [query, attempt]);
  useEffect(() => {
    if (!result.error || result.retryAt <= Date.now()) return;
    const timer = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= result.retryAt) window.clearInterval(timer);
    }, 500);
    return () => window.clearInterval(timer);
  }, [result.error, result.retryAt]);
  const current =
    result.query === query ? result : { ...empty, loading: Boolean(query) };
  return { ...current, waiting: now < current.retryAt, retry };
}
