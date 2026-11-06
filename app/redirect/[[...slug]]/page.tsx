import { notFound } from "next/navigation";
import RedirectScreen from "../redirect-screen";
import { getRedirectDestination, parseRedirectUrl } from "../destinations";

export default async function RedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ url?: string | string[] }>;
}) {
  const { slug } = await params;
  if (slug?.length) {
    if (slug.length !== 1) notFound();
    const destination = getRedirectDestination(slug[0]);
    if (!destination) notFound();
    return <RedirectScreen destination={destination} />;
  }

  const { url } = await searchParams;
  return <RedirectScreen destination={parseRedirectUrl(url)} />;
}
