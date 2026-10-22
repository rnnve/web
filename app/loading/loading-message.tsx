"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Good things are taking shape.",
  "Preparing a little world just for you.",
  "Tuning the final details.",
  "Gathering a touch of stardust.",
  "Bringing your next scene into focus.",
  "Setting the stage for something lovely.",
];

export default function LoadingMessage() {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const index = Math.floor(Math.random() * loadingMessages.length);
      setMessage(loadingMessages[index]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return <p>{message}</p>;
}
