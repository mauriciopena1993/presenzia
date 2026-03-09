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
  title: "AI Search Visibility for UK IFAs & Wealth Managers | presenzia.ai",
  description: "Find out if your IFA firm appears when clients search ChatGPT, Perplexity or Google AI for a financial adviser. Free AI visibility score, no sign-up required.",
  keywords: "AI search visibility IFA, ChatGPT financial adviser search, AI SEO for wealth managers, IFA visibility audit, does my firm appear on ChatGPT, AI search visibility for IFAs, presenzia",
  metadataBase: new URL("https://presenzia.ai"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "Is your IFA firm invisible to AI search? | presenzia.ai",
    description: "94% of UK IFA firms don't appear when clients ask ChatGPT for a financial adviser. Find out where your firm stands with a free AI visibility audit.",
    url: "https://presenzia.ai",
    siteName: "presenzia.ai",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "presenzia.ai - AI Search Visibility for UK IFAs & Wealth Managers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Is your IFA firm invisible to AI search? | presenzia.ai",
    description: "94% of UK IFA firms don't appear when clients ask ChatGPT for a financial adviser. Get your free AI visibility score.",
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
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
