import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Começar — Aula",
  description: "Cria uma conta na Aula e começa o português europeu.",
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
