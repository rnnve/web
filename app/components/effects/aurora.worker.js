import { createAuroraRenderer } from "./aurora-renderer";

let renderer;
self.onmessage = ({ data }) => {
  try {
    if (data.type === "init") {
      renderer = createAuroraRenderer(
        data.canvas,
        data.settings,
        data.viewport,
        data.reduce,
      );
      if (!renderer) throw new Error("WebGL2 is unavailable in the worker");
      self.postMessage({ type: "ready" });
    } else renderer?.[data.type]?.(data.value);
  } catch {
    self.postMessage({ type: "fallback" });
  }
};
