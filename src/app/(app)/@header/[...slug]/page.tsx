import { HeaderContent } from "@/components/shell/header-content";
import { PlayButton } from "@/components/shell/play-button";
import { getWord } from "@/lib/library";
import { resolveCrumbs } from "@/lib/shell/crumbs";

export default async function PageHeader({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const segments = slug.map(decodeURIComponent);
  const crumbs = resolveCrumbs(segments);

  const [section, category, wordSlug] = segments;
  const word = section === "vocabulary" && category && wordSlug ? getWord(category, wordSlug) : undefined;

  return <HeaderContent crumbs={crumbs} actions={word ? <PlayButton text={word.portuguese} /> : undefined} />;
}
