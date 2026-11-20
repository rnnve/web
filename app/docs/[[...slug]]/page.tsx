import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/glass/page";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { source } from "../../lib/docs-source";

type Props = { params: Promise<{ slug?: string[] }> };
export default async function DocumentationPage({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            a: createRelativeLink(source, page),
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}
export function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = source.getPage((await params).slug);
  if (!page) notFound();
  return {
    title: `${page.data.title} — Rynnie Docs`,
    description: page.data.description,
    alternates: {
      canonical: `/docs${page.slugs.length ? `/${page.slugs.join("/")}` : ""}`,
    },
  };
}
