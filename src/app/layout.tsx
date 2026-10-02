import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aula PT — European Portuguese",
  description:
    "Aula PT: European Portuguese conjugations, vocabulary, grammar, and practice. Learn European Portuguese.",
  icons: {
    icon: [
      { url: "/Aula Logo.png", type: "image/png" },
    ],
    shortcut: "/Aula Logo.png",
    apple: "/Aula Logo.png",
  },
  openGraph: {
    title: "Aula PT — European Portuguese",
    description:
      "Aula PT: European Portuguese conjugations, vocabulary, grammar, and practice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={geist.variable}>
      <body className="min-h-screen bg-white text-aula-text">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
