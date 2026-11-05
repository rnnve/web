"use client";

import { IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const enabledRef = useRef(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;

    const interactionEvents = ["pointerdown", "touchend", "click", "keydown"] as const;
    const removeListeners = () => {
      for (const event of interactionEvents) {
        document.removeEventListener(event, startPlayback, true);
      }
    };
    const startPlayback = (event?: Event) => {
      if (!enabledRef.current) return;
      if (event?.target instanceof Element && event.target.closest("[data-music-toggle]")) return;
      void audio.play().then(removeListeners).catch(() => {
        // Keep listening for a browser-approved user gesture.
      });
    };

    for (const event of interactionEvents) {
      document.addEventListener(event, startPlayback, true);
    }
    startPlayback();

    return removeListeners;
  }, []);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      enabledRef.current = false;
      audio.pause();
    } else {
      enabledRef.current = true;
      void audio.play().catch(() => setPlaying(false));
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/with-you-once-more.wav"
        autoPlay
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      <button
        type="button"
        data-music-toggle
        onClick={togglePlayback}
        aria-label={playing ? "Pause background music" : "Play background music"}
        title={playing ? "Pause background music" : "Play background music"}
        className="fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-50 flex size-11 items-center justify-center rounded-full border border-white/15 bg-[#252527]/95 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#38383b]"
      >
        {playing ? <IconVolume size={20} aria-hidden="true" /> : <IconVolumeOff size={20} aria-hidden="true" />}
      </button>
    </>
  );
}
