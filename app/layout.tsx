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
  title: "presenzia.ai | AI Search Visibility Audits for UK Businesses",
  description: "Find out if AI search engines recommend your business. Monthly audits across ChatGPT, Claude, Perplexity and Google AI with scored reports and actionable fixes.",
  keywords: "AI search visibility, AI SEO, ChatGPT business listing, AI search audit, UK business AI, presenzia, AI recommendations, local business AI visibility",
  metadataBase: new URL("https://presenzia.ai"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "presenzia.ai | AI Search Visibility Audits for UK Businesses",
    description: "Find out if AI search engines recommend your business. Monthly audits across ChatGPT, Claude, Perplexity and Google AI.",
    url: "https://presenzia.ai",
    siteName: "presenzia.ai",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "presenzia.ai - AI Search Visibility Audits for UK Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "presenzia.ai | AI Search Visibility for UK Businesses",
    description: "Find out if AI search engines recommend your business.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "presenzia.ai",
              legalName: "Ketzal LTD",
              url: "https://presenzia.ai",
              description: "AI search visibility auditing service for UK businesses. We audit how AI platforms like ChatGPT, Claude, Perplexity and Google AI see your business.",
              foundingDate: "2026",
              email: "hello@presenzia.ai",
              address: {
                "@type": "PostalAddress",
                addressCountry: "GB",
                addressLocality: "London",
              },
              sameAs: [],
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "GBP",
                lowPrice: "99",
                highPrice: "599",
                offerCount: "3",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "presenzia.ai",
              url: "https://presenzia.ai",
            }),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
