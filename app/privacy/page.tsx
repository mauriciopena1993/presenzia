import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — presenzia.ai',
  description: 'How presenzia.ai collects, uses, and protects your personal data.',
};

const sectionStyle = {
  marginBottom: '2.5rem',
};

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

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      {/* Nav bar */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Legal
        </div>
        <h1 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '0.5rem',
          lineHeight: 1.2,
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#666', fontSize: '0.825rem', marginBottom: '3rem' }}>
          Last updated: February 2026 · Ketzal LTD t/a presenzia.ai
        </p>

        <div style={sectionStyle}>
          <p style={textStyle}>
            This Privacy Policy explains how Ketzal LTD (trading as presenzia.ai, Company No. 14570156,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and protects your personal data
            when you use our website at presenzia.ai and our AI search visibility audit services.
            We are committed to protecting your privacy in accordance with the UK GDPR and the Data Protection Act 2018.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Data We Collect</h2>
          <p style={textStyle}>We collect the following personal data:</p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Contact information:</strong> Your email address, provided when you purchase a plan or contact us.</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Business information:</strong> Your business name, type, location, keywords, and website URL, used to run your AI visibility audit.</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Payment information:</strong> Billing details processed securely by Stripe. We do not store card numbers.</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Usage data:</strong> Anonymised analytics data about how you use our website.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. How We Use Your Data</h2>
          <p style={textStyle}>We use your data to:</p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Provide and deliver our AI visibility audit services</li>
            <li style={{ marginBottom: '0.4rem' }}>Send you your audit reports and service communications</li>
            <li style={{ marginBottom: '0.4rem' }}>Process payments and manage your subscription</li>
            <li style={{ marginBottom: '0.4rem' }}>Improve our service and resolve technical issues</li>
            <li style={{ marginBottom: '0.4rem' }}>Comply with our legal obligations</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Legal Basis for Processing</h2>
          <p style={textStyle}>
            We process your data under the following legal bases: <strong style={{ color: '#F5F0E8' }}>contract performance</strong> (to deliver the service you paid for),
            <strong style={{ color: '#F5F0E8' }}> legitimate interests</strong> (to improve our services and communicate with you about your account),
            and <strong style={{ color: '#F5F0E8' }}>legal obligation</strong> (to comply with applicable law).
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Third-Party Services</h2>
          <p style={textStyle}>We share data with the following trusted third parties to deliver our service:</p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Stripe</strong> — payment processing (see Stripe&apos;s privacy policy at stripe.com)</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Supabase</strong> — secure data storage (EU-based servers)</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Resend</strong> — email delivery</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>OpenAI / Anthropic</strong> — AI platforms used to run visibility audits (your business name and type are submitted as query context)</li>
            <li style={{ marginBottom: '0.4rem' }}><strong style={{ color: '#F5F0E8' }}>Vercel</strong> — website hosting</li>
          </ul>
          <p style={textStyle}>We do not sell your personal data to third parties.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Data Retention</h2>
          <p style={textStyle}>
            We retain your data for as long as your account is active and for up to 3 years after account closure,
            or as required by law. Audit reports are stored for 12 months. You may request deletion at any time.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Your Rights</h2>
          <p style={textStyle}>Under UK GDPR, you have the right to:</p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Access the personal data we hold about you</li>
            <li style={{ marginBottom: '0.4rem' }}>Request correction of inaccurate data</li>
            <li style={{ marginBottom: '0.4rem' }}>Request erasure of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li style={{ marginBottom: '0.4rem' }}>Object to or restrict our processing of your data</li>
            <li style={{ marginBottom: '0.4rem' }}>Request a portable copy of your data</li>
            <li style={{ marginBottom: '0.4rem' }}>Lodge a complaint with the ICO (ico.org.uk)</li>
          </ul>
          <p style={textStyle}>
            To exercise any right, email us at{' '}
            <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
            We will respond within 30 days.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Cookies</h2>
          <p style={textStyle}>
            Our website uses only essential cookies required for the site to function. We do not use advertising or
            tracking cookies. You can control cookie settings via your browser.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Security</h2>
          <p style={textStyle}>
            We implement appropriate technical and organisational measures to protect your data, including encrypted
            data transmission (HTTPS), access controls, and secure third-party infrastructure. No method of
            transmission over the internet is 100% secure, but we take all reasonable steps to protect your information.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Changes to This Policy</h2>
          <p style={textStyle}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email
            or by posting a notice on our website. Continued use of our services after changes constitutes acceptance.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Contact Us</h2>
          <p style={textStyle}>
            For any privacy-related queries, contact us at:<br />
            <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a><br />
            Ketzal LTD, Company No. 14570156
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ borderTop: '1px solid #1A1A1A', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#555', fontSize: '0.75rem' }}>
          © 2026 Ketzal LTD t/a presenzia.ai. All rights reserved. ·{' '}
          <Link href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms of service</Link>
        </p>
      </div>
    </div>
  );
}
