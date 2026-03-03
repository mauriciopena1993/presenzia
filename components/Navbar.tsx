'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 2rem',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1F1F1F' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.4rem',
          fontWeight: 600,
          color: '#F5F0E8',
          letterSpacing: '-0.02em',
        }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
        <Link href="/#how-it-works" style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
          How it works
        </Link>
        <Link href="/#sample-report" style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
          Sample audit
        </Link>
        <Link href="/pricing" style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
          Pricing
        </Link>
        <Link href="/blog" style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
          Blog
        </Link>
        <Link href="/dashboard" style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
          Login
        </Link>
        <Link href="/score" style={{
          padding: '0.5rem 1.25rem',
          background: '#C9A84C',
          color: '#0A0A0A',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E8C96A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C9A84C')}>
          Get your free score →
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
        className="mobile-menu-btn"
      >
        <div style={{ width: '22px', height: '2px', background: '#F5F0E8', marginBottom: '5px', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <div style={{ width: '22px', height: '2px', background: '#F5F0E8', marginBottom: '5px', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
        <div style={{ width: '22px', height: '2px', background: '#F5F0E8', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <>
        {/* Full-screen backdrop to prevent content bleed-through */}
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10,10,10,0.95)',
            zIndex: 98,
          }}
        />
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          background: '#0A0A0A',
          borderBottom: '1px solid #1F1F1F',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          zIndex: 99,
        }}>
          {[
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Sample audit', href: '/#sample-report' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Blog', href: '/blog' },
            { label: 'About', href: '/about' },
            { label: 'Login', href: '/dashboard' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#999', fontSize: '1rem', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
          <Link href="/score" onClick={() => setMenuOpen(false)} style={{
            padding: '0.75rem 1.5rem',
            background: '#C9A84C',
            color: '#0A0A0A',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
          }}>
            Get your free score →
          </Link>
        </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
