import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GroLocal",
    template: "%s · GroLocal",
  },
  description:
    "A map of what your neighbours are growing, and the stories behind it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line mt-16">
          <div className="mx-auto max-w-[1080px] px-5 py-8 text-[13px] text-graphite flex flex-wrap items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-display)] text-ink text-[15px]">
              GroLocal
            </span>
            <span>
              Neighbourhood gardens, cultural stories, and things to share.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
