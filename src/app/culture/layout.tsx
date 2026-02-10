import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Culture & Expressions — Aula PT",
};

export default function CultureLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
