import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeScreen } from "@/components/home/hoje";
import { Landing } from "@/components/marketing/landing";
import { getOptionalUser } from "@/lib/supabase/current-user";

const marketing: Metadata = {
  title: "Aula — Português europeu",
  description:
    "Curso de português europeu, do A1 ao B1. Vocabulário, gramática, conjugações e cultura de Portugal, com revisão espaçada e o Professor Elísio a responder a partir do curso.",
  openGraph: {
    title: "Aula — Português europeu",
    description:
      "Curso de português europeu, do A1 ao B1. Vocabulário, gramática, conjugações e cultura de Portugal, com revisão espaçada.",
    locale: "pt_PT",
    type: "website",
    siteName: "Aula",
  },
  twitter: {
    card: "summary",
    title: "Aula — Português europeu",
    description:
      "Curso de português europeu, do A1 ao B1. Vocabulário, gramática, conjugações e cultura de Portugal.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const user = await getOptionalUser();
  if (user) return { title: "Hoje — Aula" };
  return marketing;
}

function first(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  return undefined;
}

/**
 * Signed-out visitors get the marketing front door.
 * A session still opens Hoje. `/welcome` stays the auth entry.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([getOptionalUser(), searchParams]);
  if (!user) {
    const error = first(params.error);
    const errorCode = first(params.error_code);
    if (error || errorCode) {
      const query = new URLSearchParams();
      if (error) query.set("error", error);
      if (errorCode) query.set("error_code", errorCode);
      const description = first(params.error_description);
      if (description) query.set("error_description", description);
      redirect(`/auth/login?${query.toString()}`);
    }
    return <Landing />;
  }
  return <HomeScreen />;
}
