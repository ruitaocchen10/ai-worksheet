import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Figtree, Martian_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import DebateProvider from "@/components/debate/debate-store";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crossfire",
  description:
    "Debate the reading. Grounded in your class's own material, scored on how you reason rather than whether you win.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-school="forest"
      // The nav script below writes data-nav here before React hydrates, and
      // SchoolTheme writes data-school. Both are deliberate — the warning is
      // about the attribute, not a rendering difference.
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${figtree.variable} ${martianMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        {/* Applies the stored nav width before first paint. Without this the
            panel renders at its width-derived default and snaps once React
            hydrates, which reads as a bug rather than a preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var n=localStorage.getItem("cf-nav");if(n)document.documentElement.dataset.nav=n}catch(e){}`,
          }}
        />
        <DebateProvider>{children}</DebateProvider>
      </body>
    </html>
  );
}
