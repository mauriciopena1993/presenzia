'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #222222',
      padding: '4rem 2rem 2rem',
      background: '#080808',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#F5F0E8', marginBottom: '1rem' }}>
              presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
            </div>
            <p style={{ color: '#888888', fontSize: '0.825rem', lineHeight: 1.7, maxWidth: '220px' }}>
              AI search visibility audits for UK businesses. Know where you stand. Fix what&apos;s broken.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#666666', lineHeight: 1.6 }}>
              Trading name of Ketzal LTD<br />
              Company No. 14570156
            </div>
          </div>

          {/* Services Links */}
          <div>
            <div style={{ fontSize: '0.65rem', color: '#777777', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Services</div>
            {[
              { label: 'How it works', href: '/#how-it-works' },
              { label: 'Pricing', href: '/#pricing' },
              { label: 'Sample report', href: '/#sample-report' },
              { label: 'Blog', href: '/blog' },
            ].map(({ label, href }) => (
              <div key={label} style={{ marginBottom: '0.75rem' }}>
                <Link href={href} style={{ color: '#888888', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F0E8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Company Links */}
          <div>
            <div style={{ fontSize: '0.65rem', color: '#777777', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Company</div>
            {[
              { label: 'About', href: '/about' },
              { label: 'Contact', href: 'mailto:hello@presenzia.ai' },
              { label: 'Privacy policy', href: '/privacy' },
              { label: 'Terms of service', href: '/terms' },
            ].map(({ label, href }) => (
              <div key={label} style={{ marginBottom: '0.75rem' }}>
                <Link href={href} style={{ color: '#888888', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F5F0E8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div>
            <div style={{ fontSize: '0.65rem', color: '#777777', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Get started</div>
            <p style={{ color: '#888888', fontSize: '0.825rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Ready to find out where you stand?
            </p>
            <Link href="/#pricing" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontSize: '0.825rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8C96A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9A84C'; }}>
              Get my audit →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid #1A1A1A',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#555555' }}>
            © 2026 Ketzal LTD t/a presenzia.ai. All rights reserved.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555555' }}>
            Made with precision in London.
          </div>
        </div>
      </div>
    </footer>
  );
}
