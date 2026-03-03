import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | presenzia.ai',
  description: 'Terms and conditions for using presenzia.ai services.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service | presenzia.ai',
    description: 'Terms and conditions for using presenzia.ai services.',
    url: 'https://presenzia.ai/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | presenzia.ai',
    description: 'Terms and conditions for using presenzia.ai services.',
  },
};

const sectionStyle = { marginBottom: '2.5rem' };
const headingStyle = {
  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
  fontSize: '1.25rem',
  color: '#F5F0E8',
  fontWeight: 600,
  marginBottom: '0.75rem',
};
const textStyle = {
  color: '#AAAAAA',
  fontSize: '0.925rem',
  lineHeight: 1.8,
  marginBottom: '0.75rem',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'rgba(10,10,10,0.97)', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', zIndex: 1 }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</div>
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Terms of Service
        </h1>
        <p style={{ color: '#999', fontSize: '0.825rem', marginBottom: '3rem' }}>
          Last updated: February 2026 · Ketzal LTD t/a presenzia.ai
        </p>

        <div style={sectionStyle}>
          <p style={textStyle}>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of presenzia.ai services provided by
            Ketzal LTD (Company No. 14570156, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By purchasing or using our services,
            you agree to be bound by these Terms.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Our Service</h2>
          <p style={textStyle}>
            presenzia.ai provides AI search visibility auditing services for UK wealth managers and financial advisors. We query major AI platforms
            (including ChatGPT, Claude, Perplexity, and Google AI) to assess how often and how prominently your
            firm appears in AI-generated recommendations, and deliver a scored audit with actionable insights.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. Subscriptions and Billing</h2>
          <p style={textStyle}>
            Our services are offered as one-off audits or on a monthly subscription basis. One-off audits are billed
            at the time of purchase. Subscriptions are billed in advance each month.
            All prices are in GBP and include VAT where applicable.
          </p>
          <p style={textStyle}>
            You may cancel your subscription at any time with 30 days&apos; notice. Cancellations take effect at the end
            of the current billing period. You will not be charged for the following month. We do not offer refunds
            for partial months except where required by law.
          </p>
          <p style={textStyle}>
            Payments are processed securely by Stripe. We do not store your payment card details.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Your Responsibilities</h2>
          <p style={textStyle}>You agree to:</p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Provide accurate information about your firm for audit purposes</li>
            <li style={{ marginBottom: '0.4rem' }}>Use our reports for your own business purposes only</li>
            <li style={{ marginBottom: '0.4rem' }}>Not reproduce, resell, or distribute our reports without permission</li>
            <li style={{ marginBottom: '0.4rem' }}>Maintain the confidentiality of your account credentials</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Audit Delivery</h2>
          <p style={textStyle}>
            We aim to deliver your first audit within 15 minutes of your purchase being completed
            and your firm details being provided. Subsequent audits (for retainer clients) are delivered on your subscription cycle.
            Delivery times are estimates and may vary due to factors outside our control.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Limitations and Disclaimers</h2>
          <p style={textStyle}>
            Our reports reflect the state of AI platforms at the time of the audit. AI search results are dynamic
            and may change at any time. We make no guarantee that following our recommendations will result in
            improved AI visibility, as AI platform behaviour is outside our control.
          </p>
          <p style={textStyle}>
            Our services are provided &ldquo;as is&rdquo;. To the fullest extent permitted by UK law, we disclaim all warranties,
            express or implied. Our total liability to you shall not exceed the amount you paid us in the 3 months
            preceding any claim.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Intellectual Property</h2>
          <p style={textStyle}>
            Reports generated for you are licensed for your use only. All other content, branding, and methodology
            remain the intellectual property of Ketzal LTD. You may not copy, replicate, or commercialise our
            methodology or platform without written consent.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Termination</h2>
          <p style={textStyle}>
            We reserve the right to suspend or terminate access to our services if you breach these Terms or
            engage in any fraudulent, abusive, or unlawful behaviour. You may cancel your subscription at any time
            as described in Section 2.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Governing Law</h2>
          <p style={textStyle}>
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive
            jurisdiction of the courts of England and Wales.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Changes to These Terms</h2>
          <p style={textStyle}>
            We may update these Terms from time to time. We will give you at least 14 days&apos; notice of material
            changes by email. Continued use of our services after the effective date constitutes acceptance.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Contact</h2>
          <p style={textStyle}>
            For any queries about these Terms, contact us at:{' '}
            <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a><br />
            Ketzal LTD, Company No. 14570156
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1A1A1A', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '0.8rem' }}>
          © 2026 Ketzal LTD t/a presenzia.ai. All rights reserved. ·{' '}
          <Link href="/privacy" style={{ color: '#999', textDecoration: 'none' }}>Privacy policy</Link>
        </p>
      </div>
    </div>
  );
}
