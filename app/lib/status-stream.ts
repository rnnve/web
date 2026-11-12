import { isRecord } from "./json";

type Snapshot = { data: unknown; error: string | null; updatedAt: number };
const initial: Snapshot = { data: null, error: null, updatedAt: 0 };

function statusStream(service: "discord" | "spotify") {
  const listeners = new Set<() => void>();
  let snapshot = initial;
  let socket: WebSocket | null = null;
  let timer: number | undefined;
  let retryDelay = 1000;

  const publish = (next: Snapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  function reconnect() {
    publish({ ...snapshot, error: `Could not connect to ${service}` });
    if (document.hidden || !listeners.size) return;
    timer = window.setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30_000);
  }

  function connect() {
    if (document.hidden || socket || !listeners.size) return;
    try {
      socket = new WebSocket(`wss://api.rynni.cc/ws/${service}`);
    } catch {
      reconnect();
      return;
    }
    socket.onmessage = ({ data }) => {
      let frame: unknown;
      try {
        frame = JSON.parse(data);
      } catch {
        return;
      }
      if (!isRecord(frame)) return;
      if (frame.success === true && isRecord(frame.data)) {
        publish({ data: frame.data, error: null, updatedAt: Date.now() });
      } else if (frame.success === false && typeof frame.error === "string") {
        publish({ ...snapshot, error: frame.error });
      } else return;
      retryDelay = 1000;
    };
    socket.onclose = () => {
      socket = null;
      reconnect();
    };
  }

  function stop() {
    window.clearTimeout(timer);
    if (socket) {
      socket.onclose = null;
      socket.onmessage = null;
      socket.close();
      socket = null;
    }
    retryDelay = 1000;
  }

  function onVisibilityChange() {
    if (document.hidden) stop();
    else connect();
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        document.addEventListener("visibilitychange", onVisibilityChange);
        connect();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size) return;
        document.removeEventListener("visibilitychange", onVisibilityChange);
        stop();
        snapshot = initial;
      };
    },
  };
}

export const discordStream = statusStream("discord");
export const spotifyStream = statusStream("spotify");
