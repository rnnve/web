import { SITE_NAME, SITE_URL, type PageContent } from "../../lib/og/resolver";

function shorten(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

export default function OGTemplate({
  content,
  path,
}: {
  content: PageContent;
  path: string;
}) {
  const title = shorten(
    content.title === "rynnie"
      ? SITE_NAME
      : content.title.replace(/ · Rynnie$/, ""),
    160,
  );
  const titleSize =
    title.length > 95
      ? 48
      : title.length > 55
        ? 60
        : title.length > 30
          ? 72
          : 88;
  const category =
    content.category ?? (path === "/" ? "Personal site" : path.split("/")[1]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#121212",
        color: "#eeeeee",
        padding: "52px 64px",
        fontFamily: "Geist",
        position: "relative",
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {Array.from({ length: 26 }, (_, index) => (
          <line
            key={`x${index}`}
            x1={index * 48}
            y1="0"
            x2={index * 48}
            y2="630"
            stroke="#24222b"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 15 }, (_, index) => (
          <line
            key={`y${index}`}
            x1="0"
            y1={index * 48}
            x2="1200"
            y2={index * 48}
            stroke="#24222b"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "radial-gradient(ellipse at 85% 10%, #39323f 0%, transparent 65%)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#e2e2e2",
              color: "#181818",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {SITE_NAME}.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#c4c4c4",
            border: "1px solid #454545",
            background: "#202020",
            borderRadius: 24,
            padding: "10px 20px",
          }}
        >
          {shorten(category, 32)}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          position: "relative",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.08,
            maxWidth: 1050,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 95 ? 24 : 28,
            lineHeight: 1.5,
            color: "#c4c4c4",
            marginTop: 24,
            maxWidth: 970,
          }}
        >
          {shorten(content.description, title.length > 95 ? 140 : 220)}
        </div>
        {!!content.tags?.length && (
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {content.tags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  borderRadius: 12,
                  background: "#303030",
                  color: "#e8e8e8",
                  fontSize: 18,
                  padding: "8px 14px",
                }}
              >
                {shorten(tag, 24)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #454545",
          paddingTop: 20,
          fontSize: 19,
          color: "#c4c4c4",
          position: "relative",
        }}
      >
        <div style={{ display: "flex" }}>{new URL(SITE_URL).hostname}</div>
        <div style={{ display: "flex" }}>{shorten(path, 64)}</div>
      </div>
    </div>
  );
}
