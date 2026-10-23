import type { CSSProperties, ReactNode } from "react";

type Tool = {
  name: string;
  href: string;
  color: string;
  logo: ReactNode;
};

const iconProps = { viewBox: "0 0 48 48", role: "img", focusable: false } as const;

const tools: Tool[] = [
  { name: "Next.js", href: "https://nextjs.org", color: "#ffffff", logo: <svg {...iconProps}><circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M16 33V15l17 22M30 15v15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: "Astro", href: "https://astro.build", color: "#ff5d01", logo: <svg {...iconProps}><path d="M15 35 22 9h6l7 26-7-5h-8l-5 5Z" fill="currentColor"/><path d="M18 37c3 1 9 1 12 0-1 4-3 6-6 7-3-1-5-3-6-7Z" fill="currentColor"/></svg> },
  { name: "React", href: "https://react.dev", color: "#61dafb", logo: <svg {...iconProps}><circle cx="24" cy="24" r="3.5" fill="currentColor"/><g fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="24" cy="24" rx="20" ry="8"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)"/></g></svg> },
  { name: "Tailwind CSS", href: "https://tailwindcss.com", color: "#38bdf8", logo: <svg {...iconProps}><path d="M8 22c4-10 12-12 20-6 3 2 5 2 8-1-4 10-12 12-20 6-3-2-5-2-8 1Zm4 11c4-10 12-12 20-6 3 2 5 2 8-1-4 10-12 12-20 6-3-2-5-2-8 1Z" fill="currentColor"/></svg> },
  { name: "TypeScript", href: "https://www.typescriptlang.org", color: "#3178c6", logo: <svg {...iconProps}><rect x="5" y="5" width="38" height="38" rx="5" fill="currentColor"/><path d="M13 20h17v4h-6v16h-5V24h-6v-4Zm18 7c0-4 3-7 8-7 2 0 4 .5 5 1.5v5c-2-1.5-3.5-2-5-2-1.5 0-2.5.6-2.5 1.6 0 2.7 9 1.5 9 8.1 0 4.3-3.4 6.8-8.4 6.8-2.7 0-5-.7-6.6-2.1v-5.2c2 1.7 4.1 2.7 6.3 2.7 1.8 0 2.8-.6 2.8-1.7 0-2.8-8.6-1.4-8.6-7.7Z" fill="#fff"/></svg> },
  { name: "Bun", href: "https://bun.sh", color: "#f6d7b0", logo: <svg {...iconProps}><path d="M6 27c0-10 8-18 18-18s18 8 18 18c0 9-8 14-18 14S6 36 6 27Z" fill="currentColor"/><path d="M14 24c3-4 17-4 20 0" fill="none" stroke="#2d2016" strokeWidth="2" strokeLinecap="round"/><circle cx="18" cy="29" r="1.5" fill="#2d2016"/><circle cx="30" cy="29" r="1.5" fill="#2d2016"/><path d="M21 34c2 1.5 4 1.5 6 0" fill="none" stroke="#2d2016" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { name: "ElysiaJS", href: "https://elysiajs.com", color: "#e879f9", logo: <svg {...iconProps}><path d="M24 5c10 0 18 8 18 18 0 12-9 20-22 20-8 0-14-5-14-12 0-6 4-10 10-11-2-8 2-15 8-15Z" fill="currentColor"/><path d="M17 28c4-5 10-7 17-5-2 8-7 13-15 13-3 0-5-2-5-4 0-2 1-3 3-4Z" fill="var(--surface)"/></svg> },
  { name: "Python", href: "https://www.python.org", color: "#ffd343", logo: <svg {...iconProps}><path d="M24 5c-10 0-10 4-10 9v5h20v3H12c-5 0-8 4-8 10s3 10 8 10h5v-7c0-5 4-8 9-8h13c4 0 7-3 7-7v-6c0-5-4-9-10-9H24Zm-4 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="#3776ab"/><path d="M24 43c10 0 10-4 10-9v-5H14v-3h22c5 0 8-4 8-10S41 6 36 6h-5v7c0 5-4 8-9 8H9c-4 0-7 3-7 7v6c0 5 4 9 10 9h12Zm4-5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg> },
  { name: "Cloudflare", href: "https://www.cloudflare.com", color: "#f48120", logo: <svg {...iconProps}><path d="M8 34h31c4 0 6-2 6-5s-3-5-7-5h-1c-1-7-6-11-12-11-6 0-11 4-12 10-5 0-9 2-9 6 0 3 2 5 4 5Z" fill="currentColor"/><path d="M12 34h29" stroke="#faae40" strokeWidth="4" strokeLinecap="round"/></svg> },
  { name: "Vercel", href: "https://vercel.com", color: "#ffffff", logo: <svg {...iconProps}><path d="m24 7 21 36H3L24 7Z" fill="currentColor"/></svg> },
];

export default function DeveloperTools() {
  return (
    <section id="developer" className="developer-tools" aria-labelledby="developer-tools-title" data-reveal>
      <div className="developer-tools__heading">
        <p>Developer</p>
        <h2 id="developer-tools-title">Tools I build with<span>.</span></h2>
        <p>My everyday stack for designing, developing, deploying, and keeping projects fast.</p>
      </div>
      <div className="developer-tools__grid">
        {tools.map((tool) => (
          <a className="developer-tool" href={tool.href} target="_blank" rel="noreferrer" key={tool.name} style={{ "--tool-color": tool.color } as CSSProperties}>
            <span className="developer-tool__logo" aria-hidden="true">{tool.logo}</span>
            <strong>{tool.name}</strong>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
