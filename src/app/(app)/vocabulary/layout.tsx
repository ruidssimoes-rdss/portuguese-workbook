import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vocabulary — Aula PT",
};

export default function VocabularyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
