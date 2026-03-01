import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import AmbientBackground from "@/components/AmbientBackground";


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
  title: "presenzia.ai | AI Search Visibility for UK Wealth Managers & IFAs",
  description: "Is your firm invisible to AI search? We audit how ChatGPT, Claude, Perplexity and Google AI see your financial advisory firm. 100+ wealth-specific prompts tested.",
  keywords: "AI search visibility, IFA AI visibility, financial advisor ChatGPT, wealth manager AI search, AI audit financial advisors, presenzia, AI recommendations IFA",
  metadataBase: new URL("https://presenzia.ai"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "presenzia.ai | AI Search Visibility for UK Wealth Managers & IFAs",
    description: "Is your firm invisible to AI search? We audit how ChatGPT, Claude, Perplexity and Google AI see your financial advisory firm.",
    url: "https://presenzia.ai",
    siteName: "presenzia.ai",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "presenzia.ai - AI Search Visibility for UK Wealth Managers & IFAs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "presenzia.ai | AI Search Visibility for UK Wealth Managers & IFAs",
    description: "Is your firm invisible to AI search? We audit how AI platforms see your financial advisory firm.",
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
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "presenzia.ai",
              legalName: "Ketzal LTD",
              url: "https://presenzia.ai",
              description: "AI search visibility for UK wealth managers and financial advisors. We audit how AI platforms like ChatGPT, Claude, Perplexity and Google AI see your firm.",
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
                lowPrice: "297",
                highPrice: "1997",
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
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
