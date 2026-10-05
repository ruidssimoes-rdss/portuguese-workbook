import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Learn — Aula PT",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

