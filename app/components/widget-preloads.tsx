"use client";

import { preload } from "react-dom";

export default function WidgetPreloads() {
  preload("/api/status", { as: "fetch", crossOrigin: "anonymous" });
  preload("/api/status/spotify", { as: "fetch", crossOrigin: "anonymous" });
  preload("/api/status/github", { as: "fetch", crossOrigin: "anonymous" });
  return null;
}
