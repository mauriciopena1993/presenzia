'use client';

import { ClipboardList, Cpu, FileText, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function HowItWorks() {
  const steps: { number: string; title: string; description: string; icon: LucideIcon }[] = [
    {
      number: '01',
      title: 'You tell us about your business',
      description: 'Share your business type, location, and the keywords your customers use. Takes 5 minutes.',
      icon: ClipboardList,
    },
    {
      number: '02',
      title: 'We run the audit',
      description: 'Our engine tests hundreds of prompts across ChatGPT, Claude, Perplexity, and Google AI. We record exactly where you appear, where you don\'t, and who does instead.',
      icon: Cpu,
    },
    {
      number: '03',
      title: 'You receive your audit',
      description: 'A clear, beautifully formatted audit lands in your inbox within 48 hours. Your visibility score, competitor gaps, and exact recommendations.',
      icon: FileText,
    },
    {
      number: '04',
      title: 'We fix it and track it',
      description: 'On Growth and Premium plans, we provide monthly follow-up audits so you can see your score improve over time.',
      icon: TrendingUp,
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: '6rem 2rem',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          The process
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          How presenzia<span style={{ color: '#C9A84C' }}>.ai</span> works
        </h2>
        <p style={{ color: '#AAAAAA', maxWidth: '500px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
          From signup to your first audit in under 48 hours. No calls required.
        </p>
      </div>

      {/* Steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0',
      }}>
        {steps.map((step, i) => (
          <div key={step.number} style={{
            padding: '2.5rem',
            background: 'rgba(10,10,10,0.6)',
            position: 'relative',
            transition: 'background 0.3s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,15,15,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,0.6)'; }}
          >
            <step.icon size={24} strokeWidth={1.5} style={{ color: '#C9A84C', marginBottom: '1rem', display: 'block' }} />
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '3rem',
              color: 'rgba(201,168,76,0.2)',
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: '1.5rem',
            }}>
              {step.number}
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              {step.title}
            </h3>
            <p style={{ color: '#999999', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
