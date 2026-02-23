import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "presenzia.ai — AI Search Visibility for UK Businesses",
  description: "Find out if AI search engines are hiding your business. Get monthly audits across ChatGPT, Claude, Perplexity and Google AI — and fix it.",
  keywords: "AI search visibility, ChatGPT business, AI SEO, UK business AI search, presenzia",
  openGraph: {
    title: "presenzia.ai — AI Search Visibility for UK Businesses",
    description: "Find out if AI search engines are hiding your business.",
    url: "https://presenzia.ai",
    siteName: "presenzia.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "presenzia.ai",
    description: "Find out if AI search engines are hiding your business.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased" suppressHydrationWarning style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
