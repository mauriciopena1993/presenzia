'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InteractiveReport from '@/components/InteractiveReport';

interface PlatformScore {
  platform: string;
  score: number;
  promptsTested: number;
  promptsMentioned: number;
  avgPosition: number | null;
  competitors: string[];
}

interface AuditJob {
  id: string;
  status: string;
  overall_score: number | null;
  grade: string | null;
  summary: string | null;
  platforms_json: PlatformScore[] | null;
  competitors_json: Array<{ name: string; count: number }> | null;
  report_path: string | null;
  created_at: string;
  completed_at: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insights_json: any | null;
}

interface ClientData {
  id: string;
  email: string;
  plan: string;
  status: string;
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  pending_plan_change: string | null;
  pending_change_date: string | null;
}

interface HistoryReport {
  id: string;
  status: string;
  overall_score: number | null;
  grade: string | null;
  completed_at: string | null;
  created_at: string;
  report_path: string | null;
  platforms_json: PlatformScore[] | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const PLATFORM_TOOLTIPS: Record<string, string> = {
  'ChatGPT': 'Used by 200M+ people daily. When someone asks ChatGPT to recommend a financial advisor, this score shows how often your firm appears.',
  'Claude': 'Anthropic\'s AI assistant, growing rapidly in professional use. A high score here means Claude is recommending your firm.',
  'Perplexity': 'An AI-powered search engine replacing Google for many users. High visibility here drives direct, high-intent traffic to your firm.',
  'Google AI': 'Google\'s AI Overview appears at the top of search results. Critical for discovery — this is the highest-impact platform.',
};

const GRADE_COLORS: Record<string, string> = {
  'A': '#4CAF50',
  'B': '#8BC34A',
  'C': '#FFC107',
  'D': '#FF9800',
  'F': '#F44336',
};

const PLAN_LABELS: Record<string, string> = {
  audit: 'Full AI Audit',
  starter: 'Full AI Audit', // legacy alias
  growth: 'Growth Retainer',
  premium: 'Premium',
};

const PLAN_PRICES: Record<string, string> = {
  audit: '£99',
  starter: '£99', // legacy
  growth: '£249',
  premium: '£599',
};

const PLAN_PRICE_SUFFIX: Record<string, string> = {
  audit: 'one-time payment',
  starter: 'one-time payment',
  growth: 'per month',
  premium: 'per month',
};

const TIER_COLORS: Record<string, string> = {
  audit: '#C9A84C',
  starter: '#C9A84C',
  growth: '#5BA88C',
  premium: '#9b6bcc',
};

const PLAN_FEATURES: Record<string, string[]> = {
  audit: ['Complete AI visibility audit (4 platforms)', 'Personalised action plan with recommendations', 'Competitor analysis & positioning insights', 'Online dashboard + PDF report'],
  starter: ['Monthly AI visibility audit', 'Delivered by email (report)'], // legacy
  growth: ['Everything in Audit', 'Weekly re-audits with score tracking & trends', 'AI audit assistant', 'Competitor deep-dive with real-time alerts', 'Priority email support'],
  premium: ['Everything in Growth', 'Daily re-audits (vs weekly in Growth)', 'Dedicated account strategist', 'Monthly 1-hour strategy call', 'Exclusive territory protection', '4 AI-optimised articles written & published monthly'],
};

const PLAN_ORDER = ['audit', 'growth', 'premium'];

const PLAN_LOSSES: Record<string, string[]> = {
  audit: ['AI visibility audit report', 'Score tracking', 'Action plan recommendations'],
  starter: ['Monthly AI visibility audits', 'Email reports with action plans', 'Score tracking over time'], // legacy
  growth: ['Weekly re-audits', 'Online dashboard with weekly updates', 'AI audit assistant', 'Competitor deep-dive analysis', 'Priority email support'],
  premium: ['Daily dashboard updates', 'Dedicated account manager', 'Monthly 1:1 strategy calls', 'Territory exclusivity', 'Done-for-you content', 'Custom prompt testing', 'Industry benchmarking'],
};

// Premium strategy call booking link — replace with Calendly/Cal.com URL when ready
const BOOKING_URL = 'https://calendly.com/presenzia/strategy-call';

const GRADE_CONTEXT: Record<string, string> = {
  'A': 'Excellent — AI assistants are actively recommending your firm. Keep monitoring to maintain your position.',
  'B': 'Good visibility with room to grow. A few targeted improvements could push you into the top tier.',
  'C': 'Moderate presence. You appear on some platforms but competitors are being recommended more often.',
  'D': 'Low visibility. Most AI searches in your category are recommending competitors instead of you.',
  'F': 'Not visible. AI assistants are not currently recommending your firm. Immediate action needed.',
};

function scoreColor(score: number) {
  if (score >= 70) return '#4a9e6a';
  if (score >= 45) return '#C9A84C';
  if (score >= 25) return '#cc8833';
  return '#cc4444';
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getNextAuditDate(lastDate: string, plan?: string): string {
  const d = new Date(lastDate);
  if (plan === 'premium') {
    // Premium: daily re-audits
    d.setDate(d.getDate() + 1);
  } else if (plan === 'growth') {
    // Growth: weekly re-audits
    d.setDate(d.getDate() + 7);
  } else {
    // Fallback: monthly
    d.setMonth(d.getMonth() + 1);
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getUpdateFrequencyLabel(plan?: string): string {
  if (plan === 'premium') return 'Daily';
  if (plan === 'growth') return 'Weekly';
  return 'One-off';
}

/** Simple markdown renderer for AI chat responses — handles bold, italic, headers, lists, links */
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers (## → h3, ### → h4)
    .replace(/^### (.+)$/gm, '<strong style="display:block;margin:0.5em 0 0.25em;font-size:0.9em;color:#F5F0E8">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="display:block;margin:0.6em 0 0.3em;font-size:0.95em;color:#F5F0E8">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong style="display:block;margin:0.6em 0 0.3em;font-size:1em;color:#F5F0E8">$1</strong>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F5F0E8">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered list items
    .replace(/^[-•] (.+)$/gm, '<li style="margin-left:1em;list-style:disc;margin-bottom:0.2em">$1</li>')
    // Ordered list items (1. 2. etc.)
    .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-left:1em;list-style:decimal;margin-bottom:0.2em">$1</li>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#C9A84C;text-decoration:underline">$1</a>')
    // Line breaks (double newline → paragraph break)
    .replace(/\n\n/g, '<br/><br/>')
    // Single newlines within content
    .replace(/\n/g, '<br/>');

  return html;
}

function CongratsBanner({ plan, onClose }: { plan: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '480px',
        width: '90%',
        padding: 'clamp(2rem, 5vw, 3rem)',
        background: '#0D0D0D',
        border: '1px solid rgba(201,168,76,0.3)',
        textAlign: 'center',
      }}>
        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(201,168,76,0.15)',
          border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          fontSize: '1.5rem',
        }}>
          ✓
        </div>

        <div style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: '1.5rem',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}>
          Welcome to {PLAN_LABELS[plan] || plan}
        </div>

        <p style={{
          color: '#AAAAAA',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          marginBottom: '1.5rem',
        }}>
          {plan === 'growth'
            ? 'Your online dashboard is now unlocked. Access your full audit report, competitor insights, and AI assistant — all in one place.'
            : 'You now have access to everything — daily updates, your dedicated account manager, and monthly strategy calls. We\'re excited to work with you.'}
        </p>

        <div style={{
          width: '100%',
          height: '2px',
          background: '#1a1a1a',
          borderRadius: '1px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: '#C9A84C',
            animation: 'congrats-progress 5s linear forwards',
          }} />
        </div>
        <style>{`
          @keyframes congrats-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ── PromoCodeDisplay: shows retention code for copy ──────────
function PromoCodeDisplay({
  code,
  onKeepPlan,
  onContinueCancel,
}: {
  code: string | null;
  onKeepPlan: () => void;
  onContinueCancel: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return (
    <>
      <div style={{ fontSize: '0.9rem', color: '#C9A84C', fontWeight: 600, marginBottom: '0.5rem' }}>
        Here&apos;s your 50% off code
      </div>
      <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
        Use this code at checkout for <span style={{ color: '#C9A84C', fontWeight: 600 }}>50% off</span> any plan. It&apos;s single-use and valid for 3 months.
      </p>

      {/* Code box with copy button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#111',
        border: '1px solid #2a2a2a',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}>
        <code style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#F5F0E8',
          letterSpacing: '0.08em',
        }}>
          {code || '—'}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#1a3a1a' : '#1a1a1a',
            border: `1px solid ${copied ? '#2a5a2a' : '#333'}`,
            color: copied ? '#5BA88C' : '#999',
            padding: '0.4rem 0.75rem',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6, marginBottom: '1rem' }}>
        Paste this code in the promo field at checkout when subscribing to any plan.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onKeepPlan}
          style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Keep my plan
        </button>
        <button
          onClick={onContinueCancel}
          style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Continue to cancel
        </button>
      </div>
    </>
  );
}

// ── CancelFlow: multi-step cancellation funnel ──────────────
function CancelFlow({
  plan,
  cancelStep,
  setCancelStep,
  retentionEligible,
  retentionCode,
  actionLoading,
  onAcceptRetention,
  onConfirmCancel,
  onChangePlan,
  onSubmitFeedback,
  onClose,
  cancelEndDate,
}: {
  plan: string;
  cancelStep: string;
  setCancelStep: (s: 'confirm-loss' | 'downgrade-offer' | 'retention-offer' | 'confirming' | 'done' | 'saved' | 'switched') => void;
  retentionEligible: boolean;
  retentionCode: string | null;
  actionLoading: boolean;
  onAcceptRetention: () => void;
  onConfirmCancel: () => void;
  onChangePlan: (targetPlan: string) => void;
  onSubmitFeedback: (feedback: string) => void;
  onClose: () => void;
  cancelEndDate: string | null;
}) {
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const planRank = PLAN_ORDER.indexOf(plan);
  const losses = PLAN_LOSSES[plan] || [];
  // Only show subscription plans as downgrade options (exclude one-off plans like 'audit')
  const lowerPlans = PLAN_ORDER.filter((p, i) => i < planRank && PLAN_PRICE_SUFFIX[p] !== 'one-time payment');

  const handleProceedFromLoss = () => {
    // Offer downgrade only if there are subscription-based lower plans available
    if (lowerPlans.length > 0) {
      setCancelStep('downgrade-offer');
    } else if (retentionEligible) {
      setCancelStep('retention-offer');
    } else {
      setCancelStep('confirming');
    }
  };

  const handleProceedFromDowngrade = () => {
    if (retentionEligible) {
      setCancelStep('retention-offer');
    } else {
      setCancelStep('confirming');
    }
  };

  return (
    <div style={{ padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a', maxWidth: '520px' }}>
      {/* Step 1: Confirm loss */}
      {cancelStep === 'confirm-loss' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Are you sure?</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            If you cancel your {PLAN_LABELS[plan]} plan, you will lose access to:
          </p>
          <ul style={{ margin: '0 0 1rem', padding: '0 0 0 1.25rem', fontSize: '0.85rem', color: '#cc6644', lineHeight: 1.8 }}>
            {losses.map((loss, i) => <li key={i}>{loss}</li>)}
          </ul>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleProceedFromLoss}
              style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              I want to cancel
            </button>
            <button
              onClick={onClose}
              style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Never mind, keep my plan
            </button>
          </div>
        </>
      )}

      {/* Step 2: Downgrade offer (tier 2+ only) */}
      {cancelStep === 'downgrade-offer' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Would you rather switch to a cheaper plan?</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
            Instead of cancelling completely, you could switch to a more affordable plan and keep tracking your AI visibility.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {lowerPlans.map(p => (
              <div key={p} style={{ flex: 1, minWidth: '200px', padding: '1rem', background: '#111', border: '1px solid #222' }}>
                <div style={{ fontSize: '0.85rem', color: '#C9A84C', fontWeight: 600, marginBottom: '4px' }}>
                  {PLAN_LABELS[p]} · {PLAN_PRICES[p]} {PLAN_PRICE_SUFFIX[p]}
                </div>
                <ul style={{ margin: '0.5rem 0 0.75rem', padding: '0 0 0 1rem', fontSize: '0.78rem', color: '#999', lineHeight: 1.6 }}>
                  {PLAN_FEATURES[p]?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button
                  onClick={() => onChangePlan(p)}
                  disabled={actionLoading}
                  style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                >
                  {actionLoading ? 'Processing...' : `Switch to ${PLAN_LABELS[p]}`}
                </button>
                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', textAlign: 'center' }}>Takes effect at end of billing cycle</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleProceedFromDowngrade}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            No thanks, I want to cancel completely
          </button>
        </>
      )}

      {/* Step 3: Retention offer (50% off) */}
      {cancelStep === 'retention-offer' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Before you go...</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
            How about <span style={{ color: '#C9A84C', fontWeight: 600 }}>50% off your next month</span>? Stay and keep tracking your AI visibility while you see the results from your latest audit.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onAcceptRetention}
              disabled={actionLoading}
              style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
            >
              {actionLoading ? 'Applying...' : 'Yes, give me 50% off'}
            </button>
            <button
              onClick={() => setCancelStep('confirming')}
              disabled={actionLoading}
              style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              No thanks, cancel anyway
            </button>
          </div>
        </>
      )}

      {/* Step 4: Final confirmation */}
      {cancelStep === 'confirming' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Last step</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
            Your subscription will remain active until the end of your current billing period. After that, no new audits will be generated — but you can still log in to view your previous reports anytime.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onConfirmCancel}
              disabled={actionLoading}
              style={{ background: '#cc4444', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
            >
              {actionLoading ? 'Cancelling...' : 'Confirm cancellation'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: '1px solid #333', color: '#999', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Never mind
            </button>
          </div>
        </>
      )}

      {/* Done: Sad to see you go + feedback + end date */}
      {cancelStep === 'done' && (
        <>
          <div style={{ fontSize: '1.1rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.75rem' }}>We&apos;re sad to see you go</div>
          <div style={{
            padding: '1rem',
            background: 'rgba(204,68,68,0.06)',
            border: '1px solid rgba(204,68,68,0.2)',
            marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.25rem' }}>
              {PLAN_LABELS[plan]} plan{cancelEndDate ? `, finishing on ${cancelEndDate}` : ', finishing at the end of your billing cycle'}.
            </div>
            <div style={{ fontSize: '0.82rem', color: '#999' }}>
              No further payments will be made. You&apos;ll keep full access until then.
            </div>
          </div>

          {!feedbackSent ? (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#AAAAAA', marginBottom: '0.5rem' }}>
                Would you mind sharing why you&apos;re leaving? Your feedback helps us improve.
              </label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="What could we have done better?"
                rows={3}
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #2a2a2a',
                  color: '#F5F0E8',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => { onSubmitFeedback(feedback); setFeedbackSent(true); }}
                disabled={!feedback.trim()}
                style={{
                  background: feedback.trim() ? '#333' : '#1a1a1a',
                  color: feedback.trim() ? '#AAAAAA' : '#555',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                Send feedback
              </button>
            </div>
          ) : (
            <div style={{ padding: '0.75rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '1rem', fontSize: '0.85rem', color: '#C9A84C' }}>
              Thank you for your feedback — it genuinely helps us improve.
            </div>
          )}

          <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6, margin: 0 }}>
            If you change your mind, you can undo the cancellation from your dashboard anytime before the end date, or visit our <a href="/pricing" style={{ color: '#C9A84C', textDecoration: 'none' }}>pricing page</a> to resubscribe later.
          </p>
        </>
      )}

      {cancelStep === 'saved' && (
        <PromoCodeDisplay
          code={retentionCode}
          onKeepPlan={onClose}
          onContinueCancel={() => setCancelStep('confirming')}
        />
      )}

      {cancelStep === 'switched' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#C9A84C', fontWeight: 600, marginBottom: '0.5rem' }}>Plan change confirmed!</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6 }}>
            Your plan will switch at the end of your current billing cycle. You'll keep full access to your current features until then.
          </p>
          <button
            onClick={onClose}
            style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #333', color: '#999', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}

// ── PlanConfirmModal: "Are you sure?" dialog before plan changes ────
function PlanConfirmModal({
  currentPlan,
  targetPlan,
  pendingChange,
  pendingDate,
  onConfirm,
  onCancel,
  loading,
}: {
  currentPlan: string;
  targetPlan: string;
  pendingChange: string | null;
  pendingDate: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const isUpgrade = PLAN_ORDER.indexOf(targetPlan) > PLAN_ORDER.indexOf(currentPlan);
  const targetLabel = PLAN_LABELS[targetPlan] || targetPlan;
  const currentLabel = PLAN_LABELS[currentPlan] || currentPlan;
  const targetFeatures = PLAN_FEATURES[targetPlan] || [];

  // What you lose by downgrading
  const lostFeatures: string[] = [];
  if (!isUpgrade) {
    const currentFeats = PLAN_FEATURES[currentPlan] || [];
    const targetFeats = PLAN_FEATURES[targetPlan] || [];
    currentFeats.forEach(f => {
      if (!f.startsWith('Everything in') && !targetFeats.includes(f)) lostFeatures.push(f);
    });
  }

  // Pending change info
  const hasPending = !!pendingChange;
  const pendingLabel = pendingChange === 'cancel'
    ? 'cancellation'
    : `downgrade to ${PLAN_LABELS[pendingChange || ''] || pendingChange}`;
  const dateStr = pendingDate
    ? new Date(pendingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'end of your billing cycle';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', maxWidth: '480px', width: '100%', padding: '2rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: '#F5F0E8' }}>
          {isUpgrade ? `Upgrade to ${targetLabel}?` : `Switch to ${targetLabel}?`}
        </h3>

        {hasPending && (
          <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#C9A84C', lineHeight: 1.6 }}>
            You currently have a pending {pendingLabel} scheduled for {dateStr}. Proceeding will cancel that and {isUpgrade ? 'upgrade' : 'switch'} to {targetLabel} instead.
          </div>
        )}

        {isUpgrade ? (
          <>
            <p style={{ fontSize: '0.85rem', color: '#999', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
              You&apos;ll be charged the prorated difference for the rest of your billing cycle. From the next cycle, you&apos;ll pay {PLAN_PRICES[targetPlan]} {PLAN_PRICE_SUFFIX[targetPlan]}.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
              <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>What you&apos;ll get</div>
              {targetFeatures.map((f, i) => (
                <div key={i} style={{ padding: '2px 0' }}>
                  <span style={{ color: '#4a9e6a', marginRight: '6px' }}>+</span>{f}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: '#999', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
              The change will take effect at the end of your billing cycle. You&apos;ll keep full {currentLabel} access until then.
            </p>
            {lostFeatures.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>What you&apos;ll lose</div>
                {lostFeatures.map((f, i) => (
                  <div key={i} style={{ padding: '2px 0' }}>
                    <span style={{ color: '#cc4444', marginRight: '6px' }}>−</span>{f}
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
              Your new price: <strong style={{ color: '#F5F0E8' }}>{PLAN_PRICES[targetPlan]} {PLAN_PRICE_SUFFIX[targetPlan]}</strong> (currently {PLAN_PRICES[currentPlan]} {PLAN_PRICE_SUFFIX[currentPlan]})
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid #333', color: '#999', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Never mind
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: '0.6rem', background: isUpgrade ? (targetPlan === 'premium' ? '#9b6bcc' : '#C9A84C') : '#C9A84C', color: '#0A0A0A', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : isUpgrade ? `Upgrade to ${targetLabel}` : `Switch to ${targetLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PendingChangeBanner: prominent top-of-page status bar ──────────
function PendingChangeBanner({
  client,
  onCancelPending,
  actionLoading,
}: {
  client: ClientData;
  onCancelPending: () => void;
  actionLoading: boolean;
}) {
  if (!client.pending_plan_change) return null;

  const isCancel = client.pending_plan_change === 'cancel';
  const dateStr = client.pending_change_date
    ? new Date(client.pending_change_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'the end of your billing cycle';

  return (
    <div style={{
      padding: '0.875rem clamp(1rem, 3vw, 2rem)',
      background: isCancel
        ? 'linear-gradient(to right, rgba(204,68,68,0.1), rgba(204,68,68,0.03))'
        : 'linear-gradient(to right, rgba(201,168,76,0.1), rgba(201,168,76,0.03))',
      borderBottom: `1px solid ${isCancel ? 'rgba(204,68,68,0.15)' : 'rgba(201,168,76,0.15)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isCancel ? '#cc6666' : '#C9A84C',
          flexShrink: 0,
          boxShadow: isCancel ? '0 0 8px rgba(204,102,102,0.4)' : '0 0 8px rgba(201,168,76,0.4)',
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', color: '#F5F0E8', fontWeight: 600 }}>
            {isCancel
              ? 'Your subscription is ending'
              : `Switching to ${PLAN_LABELS[client.pending_plan_change] || client.pending_plan_change}`}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#999', marginTop: '2px' }}>
            {isCancel
              ? `Active until ${dateStr} — no further payments will be taken`
              : `Takes effect on ${dateStr} — you keep your current features until then`}
          </div>
        </div>
      </div>
      <button
        onClick={onCancelPending}
        disabled={actionLoading}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${isCancel ? 'rgba(204,68,68,0.3)' : 'rgba(201,168,76,0.3)'}`,
          color: isCancel ? '#cc8888' : '#C9A84C',
          padding: '0.45rem 1.25rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: actionLoading ? 'wait' : 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {actionLoading ? 'Processing...' : isCancel ? 'Undo cancellation' : 'Keep current plan'}
      </button>
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color = scoreColor(score);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(3rem, 8vw, 4.5rem)',
        color,
        lineHeight: 1,
        fontWeight: 600,
      }}>
        {score}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px', letterSpacing: '0.05em' }}>/ 100</div>
      <div style={{
        display: 'inline-block',
        marginTop: '12px',
        padding: '4px 16px',
        background: color + '22',
        border: `1px solid ${color}55`,
        color,
        fontWeight: 700,
        fontSize: '0.875rem',
        letterSpacing: '0.1em',
      }}>
        Grade {grade}
      </div>
    </div>
  );
}

function ScoreTrendGraph({ reports, plan }: { reports: HistoryReport[]; plan: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter to completed reports with scores, sort oldest-first
  const data = reports
    .filter(r => r.status === 'completed' && r.overall_score !== null)
    .sort((a, b) => new Date(a.completed_at || a.created_at).getTime() - new Date(b.completed_at || b.created_at).getTime());

  if (data.length < 2) return null;

  // SVG dimensions
  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Map data to coordinates
  const points = data.map((r, i) => ({
    x: PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
    y: PAD.top + plotH - ((r.overall_score! / 100) * plotH),
    score: r.overall_score!,
    grade: r.grade || '',
    date: r.completed_at || r.created_at,
  }));

  // SVG paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length - 1].x},${PAD.top + plotH} L ${points[0].x},${PAD.top + plotH} Z`;

  // Grid lines at 25, 50, 75
  const gridValues = [25, 50, 75];
  const gridYs = gridValues.map(v => PAD.top + plotH - (v / 100) * plotH);

  // X-axis labels: adaptive spacing
  const labelEvery = plan === 'premium' && data.length > 14 ? 7
    : data.length > 10 ? Math.ceil(data.length / 6)
    : 1;

  const formatShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Handle mouse/touch interaction
  const findNearest = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - mouseX);
      if (dist < minDist) { minDist = dist; nearest = i; }
    }
    setHoveredIndex(nearest);
  };

  // Tooltip position (clamped to SVG bounds)
  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;
  const tooltipX = hovered ? Math.min(Math.max(hovered.x, PAD.left + 40), W - PAD.right - 40) : 0;
  const tooltipAbove = hovered ? hovered.y > PAD.top + 40 : true;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        onMouseMove={e => findNearest(e.clientX)}
        onMouseLeave={() => setHoveredIndex(null)}
        onTouchMove={e => { if (e.touches[0]) findNearest(e.touches[0].clientX); }}
        onTouchEnd={() => setHoveredIndex(null)}
      >
        {/* Grid lines */}
        {gridYs.map((y, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1a1a1a" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" fill="#555" fontSize="9" fontFamily="var(--font-inter, Inter, sans-serif)">
              {gridValues[i]}
            </text>
          </g>
        ))}
        {/* Y-axis 0 and 100 labels */}
        <text x={PAD.left - 6} y={PAD.top + plotH + 3} textAnchor="end" fill="#555" fontSize="9" fontFamily="var(--font-inter, Inter, sans-serif)">0</text>
        <text x={PAD.left - 6} y={PAD.top + 3} textAnchor="end" fill="#555" fontSize="9" fontFamily="var(--font-inter, Inter, sans-serif)">100</text>

        {/* Baseline */}
        <line x1={PAD.left} y1={PAD.top + plotH} x2={W - PAD.right} y2={PAD.top + plotH} stroke="#1a1a1a" strokeWidth="1" />

        {/* X-axis date labels */}
        {points.map((p, i) => (
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="#555" fontSize="8.5" fontFamily="var(--font-inter, Inter, sans-serif)">
              {formatShort(data[i].completed_at || data[i].created_at)}
            </text>
          ) : null
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="rgba(201,168,76,0.05)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data dots */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          const isLatest = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5 : isLatest ? 4 : 3}
              fill={isHovered ? '#E8C96A' : '#C9A84C'}
              stroke="#0D0D0D"
              strokeWidth={2}
              style={{ transition: 'r 0.15s ease' }}
            />
          );
        })}

        {/* Hover vertical line */}
        {hovered && (
          <line x1={hovered.x} y1={PAD.top} x2={hovered.x} y2={PAD.top + plotH} stroke="rgba(201,168,76,0.2)" strokeWidth="1" strokeDasharray="3 3" />
        )}
      </svg>

      {/* Tooltip */}
      {hovered && hoveredIndex !== null && (
        <div style={{
          position: 'absolute',
          left: `${(tooltipX / W) * 100}%`,
          top: tooltipAbove ? `${((hovered.y - 50) / H) * 100}%` : `${((hovered.y + 15) / H) * 100}%`,
          transform: 'translateX(-50%)',
          background: '#161616',
          border: '1px solid #2a2a2a',
          padding: '0.4rem 0.65rem',
          pointerEvents: 'none',
          zIndex: 5,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
            <span style={{ fontSize: '0.9rem', color: scoreColor(hovered.score), fontWeight: 700 }}>{hovered.score}</span>
            <span style={{ fontSize: '0.7rem', color: '#666' }}>/100</span>
            {hovered.grade && (
              <span style={{
                fontSize: '0.6rem',
                padding: '1px 5px',
                background: scoreColor(hovered.score) + '22',
                color: scoreColor(hovered.score),
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}>
                {hovered.grade}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888' }}>
            {formatShort(data[hoveredIndex].completed_at || data[hoveredIndex].created_at)}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform }: { platform: PlatformScore }) {
  const [tooltip, setTooltip] = useState(false);
  const pct = Math.round(platform.score);
  const isFound = platform.score > 0;
  const hitRate = platform.promptsTested > 0
    ? Math.round((platform.promptsMentioned / platform.promptsTested) * 100)
    : 0;

  return (
    <div className="dash-platform-card" style={{
      background: '#0D0D0D',
      border: '1px solid #1a1a1a',
      padding: '1.25rem',
    }}>
      {/* Platform name + tooltip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 500 }}>{platform.platform}</span>
          <div
            style={{ position: 'relative', cursor: 'help' }}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          >
            <span style={{ fontSize: '0.65rem', color: '#666', border: '1px solid #444', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>?</span>
            {tooltip && (
              <div style={{
                position: 'absolute',
                bottom: '130%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1a1a1a',
                border: '1px solid #333',
                padding: '0.625rem 0.875rem',
                fontSize: '0.75rem',
                color: '#AAAAAA',
                lineHeight: 1.5,
                width: 'min(240px, 80vw)',
                zIndex: 10,
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}>
                {PLATFORM_TOOLTIPS[platform.platform] || 'AI platform visibility score'}
              </div>
            )}
          </div>
        </div>
        <span style={{
          fontSize: '0.7rem',
          padding: '2px 8px',
          background: isFound ? scoreColor(platform.score) + '18' : '#1a1a1a',
          border: `1px solid ${isFound ? scoreColor(platform.score) + '40' : '#333'}`,
          color: isFound ? scoreColor(platform.score) : '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {isFound ? 'Visible' : 'Not found'}
        </span>
      </div>

      {/* Score number */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.75rem' }}>
        <span style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: '2rem',
          color: isFound ? scoreColor(platform.score) : '#444',
          fontWeight: 600,
          lineHeight: 1,
        }}>{pct}</span>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>/100</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '1rem' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isFound ? scoreColor(platform.score) : '#2a2a2a',
          borderRadius: '2px',
          transition: 'width 1s ease',
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Hit rate</div>
          <div style={{ fontSize: '0.85rem', color: '#AAAAAA' }}>{hitRate}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Prompts</div>
          <div style={{ fontSize: '0.85rem', color: '#AAAAAA' }}>{platform.promptsMentioned}/{platform.promptsTested}</div>
        </div>
        {platform.avgPosition !== null && (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Avg pos.</div>
            <div style={{ fontSize: '0.85rem', color: '#AAAAAA' }}>#{Math.round(platform.avgPosition)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPane({ jobId, businessName }: { jobId: string; businessName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: `Hi! I can help you understand your AI visibility results for ${businessName || 'your firm'} and suggest specific improvements. What would you like to know?`,
  }]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/client/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, jobId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Sorry, something went wrong. Email hello@presenzia.ai for help.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0D0D0D',
      border: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      height: '460px',
    }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '6px', height: '6px', background: '#C9A84C', borderRadius: '50%' }} />
        <span style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          AI Audit Assistant
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              padding: '0.625rem 0.875rem',
              background: msg.role === 'user' ? '#C9A84C' : '#161616',
              color: msg.role === 'user' ? '#0A0A0A' : '#CCCCCC',
              fontSize: '0.85rem',
              lineHeight: 1.55,
              border: msg.role === 'user' ? 'none' : '1px solid #222',
            }}>
              {msg.role === 'assistant' ? (
                <div
                  className="chat-markdown"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.625rem 0.875rem', background: '#161616', border: '1px solid #222', color: '#888', fontSize: '0.85rem' }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '0.75rem', borderTop: '1px solid #1a1a1a', display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your results…"
          style={{
            flex: 1,
            background: '#111',
            border: '1px solid #2a2a2a',
            color: '#F5F0E8',
            padding: '0.625rem 0.875rem',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || chatLoading}
          style={{
            background: input.trim() && !chatLoading ? '#C9A84C' : '#2a2a2a',
            color: input.trim() && !chatLoading ? '#0A0A0A' : '#888',
            border: 'none',
            padding: '0.625rem 1rem',
            cursor: input.trim() && !chatLoading ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
            transition: 'all 0.2s',
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [latestJob, setLatestJob] = useState<AuditJob | null>(null);
  const [pendingJob, setPendingJob] = useState<{ id: string; status: string } | null>(null);
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'report' | 'history' | 'chat'>('report');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelStep, setCancelStep] = useState<'confirm-loss' | 'downgrade-offer' | 'retention-offer' | 'confirming' | 'done' | 'saved' | 'switched'>('confirm-loss');
  const [actionLoading, setActionLoading] = useState(false);
  const [retentionEligible, setRetentionEligible] = useState(true);
  const [retentionCode, setRetentionCode] = useState<string | null>(null);
  const [congratsPlan, setCongratsPlan] = useState<string | null>(null);
  const [cancelEndDate, setCancelEndDate] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauditChoice, setShowReauditChoice] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgradedPlan = params.get('upgraded');
    // Clean up URL immediately — don't show ?upgraded= on reload
    if (upgradedPlan) {
      window.history.replaceState({}, '', '/dashboard');
    }

    const load = async () => {
      const [meRes, histRes] = await Promise.all([
        fetch('/api/client/me'),
        fetch('/api/client/reports'),
      ]);

      if (meRes.status === 401) {
        router.push('/dashboard/login');
        return;
      }

      const meData = await meRes.json();
      const histData = await histRes.json();

      setClient(meData.client || null);
      setLatestJob(meData.latestJob || null);
      setPendingJob(meData.pendingJob || null);
      setHistory(histData.reports || []);
      setLoading(false);

      // Only show congrats if the plan in the DB actually matches the upgrade
      // (webhook must have processed the payment first)
      if (upgradedPlan && PLAN_LABELS[upgradedPlan] && meData.client?.plan === upgradedPlan) {
        setCongratsPlan(upgradedPlan);
      }
    };

    load();
  }, [router]);

  const handleSignOut = async () => {
    // Cookie is httpOnly — must clear it server-side
    await fetch('/api/client/signout', { method: 'POST' });
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/client/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        router.push('/?deleted=1');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account. Please contact hello@presenzia.ai');
        setDeleteLoading(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setDeleteLoading(false);
    }
  };

  const handleDownloadReport = (jobId: string) => {
    window.open(`/api/client/download?jobId=${jobId}`, '_blank');
  };

  // Step 1: Show confirmation dialog
  const handleChangePlan = (targetPlan: string) => {
    setConfirmTarget(targetPlan);
  };

  // Step 2: Execute the plan change after confirmation
  const executeChangePlan = async (targetPlan: string) => {
    setConfirmTarget(null);
    setActionLoading(true);
    try {
      const res = await fetch('/api/client/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.checkoutUrl) {
          // Upgrade — redirect to Stripe Checkout for prorated payment
          window.location.href = data.checkoutUrl;
          return; // Don't clear actionLoading — page is navigating away
        } else if (data.immediate) {
          // No-charge upgrade — takes effect now
          setClient(prev => prev ? { ...prev, plan: targetPlan, pending_plan_change: null, pending_change_date: null } : null);
          setCongratsPlan(targetPlan);
        } else {
          // Downgrade — scheduled for end of billing cycle
          setClient(prev => prev ? { ...prev, pending_plan_change: targetPlan, pending_change_date: data.effectiveDate } : null);
          // If triggered from cancel flow, show switched step
          if (showCancel) {
            setCancelStep('switched');
          }
        }
      } else {
        alert(data.error || 'Plan change failed. Please contact hello@presenzia.ai');
      }
    } catch {
      alert('Something went wrong. Please contact hello@presenzia.ai');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCongratsClose = () => {
    setCongratsPlan(null);
    window.location.reload();
  };

  const handleStartCancel = async () => {
    setShowCancel(true);
    setCancelStep('confirm-loss');
    // Pre-check retention eligibility in background
    try {
      const res = await fetch('/api/client/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-retention' }),
      });
      const data = await res.json();
      setRetentionEligible(data.eligible !== false);
    } catch {
      setRetentionEligible(true);
    }
  };

  const handleAcceptRetention = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/client/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept-offer' }),
      });
      const data = await res.json();
      if (data.success && data.promoCode) {
        setRetentionCode(data.promoCode);
        setCancelStep('saved');
      } else if (data.error) {
        // Offer rejected (cooldown), skip to confirmation
        setRetentionEligible(false);
        setCancelStep('confirming');
      }
    } catch {
      alert('Something went wrong. Please contact hello@presenzia.ai');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/client/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm-cancel' }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelEndDate(data.formattedEndDate || null);
        setClient(prev => prev ? { ...prev, pending_plan_change: 'cancel', pending_change_date: data.endDate || null } : null);
        setCancelStep('done');
      } else {
        alert(data.error || 'Cancellation failed. Please contact hello@presenzia.ai');
      }
    } catch {
      alert('Something went wrong. Please contact hello@presenzia.ai');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async (feedbackText: string) => {
    if (!feedbackText.trim()) return;
    try {
      await fetch('/api/client/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-feedback', feedback: feedbackText }),
      });
    } catch {
      // Silently fail — feedback is non-critical
    }
  };

  const handleCancelPending = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/client/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel-pending' }),
      });
      const data = await res.json();
      if (data.success) {
        setClient(prev => prev ? { ...prev, pending_plan_change: null, pending_change_date: null } : null);
        setShowCancel(false);
      } else {
        alert(data.error || 'Failed to cancel pending change. Please contact hello@presenzia.ai');
      }
    } catch {
      alert('Something went wrong. Please contact hello@presenzia.ai');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        <div style={{ color: '#C9A84C', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading…</div>
      </div>
    );
  }

  // Tier flags — all tiers now use the unified dashboard
  const isAuditTier = client?.plan === 'starter' || client?.plan === 'audit';
  const isPremium = client?.plan === 'premium';
  const isGrowthOrAbove = client?.plan === 'growth' || isPremium;

  const platforms = latestJob?.platforms_json || [];
  const competitors = latestJob?.competitors_json || [];
  const completedCount = history.filter(r => r.status === 'completed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' }}>
      {/* Congratulations overlay */}
      {congratsPlan && <CongratsBanner plan={congratsPlan} onClose={handleCongratsClose} />}
      {/* Plan change confirmation modal */}
      {confirmTarget && client && (
        <PlanConfirmModal
          currentPlan={client.plan}
          targetPlan={confirmTarget}
          pendingChange={client.pending_plan_change || null}
          pendingDate={client.pending_change_date || null}
          onConfirm={() => executeChangePlan(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Nav */}
      <div style={{ borderBottom: `1px solid ${client ? TIER_COLORS[client.plan] + '30' : '#1A1A1A'}`, borderTop: `2px solid ${client ? TIER_COLORS[client.plan] || '#C9A84C' : 'transparent'}`, padding: '1rem clamp(1rem, 3vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50, gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', minWidth: 0 }}>
          <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none', flexShrink: 0 }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
          {client && (
            <div className="dash-nav-info" style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span className="dash-nav-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.business_name || client.email}</span>
              <span style={{ padding: '2px 8px', background: `${TIER_COLORS[client.plan] || '#C9A84C'}18`, border: `1px solid ${TIER_COLORS[client.plan] || '#C9A84C'}50`, fontSize: '0.75rem', color: TIER_COLORS[client.plan] || '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, fontWeight: 600 }}>
                {PLAN_LABELS[client.plan] || client.plan}
              </span>
              <span className="dash-nav-status" style={{ fontSize: '0.6rem', color: TIER_COLORS[client.plan] || '#C9A84C', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isGrowthOrAbove && (
                  <>
                    <span style={{ width: '5px', height: '5px', background: TIER_COLORS[client.plan] || '#C9A84C', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    {isPremium ? 'Daily monitoring' : 'Weekly updates'}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: '1px solid #2a2a2a', color: '#999', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', flexShrink: 0 }}
        >
          Sign out
        </button>
      </div>

      {/* Prominent pending-change banner — visible immediately on login */}
      {client && <PendingChangeBanner client={client} onCancelPending={handleCancelPending} actionLoading={actionLoading} />}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem) 4rem' }}>

        {/* Inactive subscription banner */}
        {client?.status === 'cancelled' && (
          <div style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(204,68,68,0.06)',
            border: '1px solid rgba(204,68,68,0.2)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>No active subscription</div>
            <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, margin: '0 0 1rem' }}>
              Your previous reports are still available below. To generate a new audit, resubscribe to one of our plans.
            </p>
            <a
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                background: '#C9A84C',
                color: '#0A0A0A',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              View plans & resubscribe
            </a>
          </div>
        )}

        {/* Premium: Strategy call booking */}
        {client?.plan === 'premium' && client?.status !== 'cancelled' && (
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(155,107,204,0.06)',
            border: '1px solid rgba(155,107,204,0.2)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#9b6bcc', borderRadius: '50%', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#F5F0E8', fontWeight: 500 }}>Monthly strategy call</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Book your 1:1 with your account manager</div>
              </div>
            </div>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                background: '#9b6bcc',
                color: '#0A0A0A',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
            >
              Book a slot →
            </a>
          </div>
        )}

        {/* Audit running banner */}
        {pendingJob && (
          <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d00', border: '1px solid #2a2000', color: '#C9A84C', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />
            Your AI visibility audit is running — results will appear here within 15 minutes.
          </div>
        )}

        {/* Tabs — audit tier only sees "Your Audit", Growth/Premium see all 3 */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '2rem' }}>
          {(isAuditTier
            ? [{ key: 'report' as const, label: 'Your Audit' }]
            : [
                { key: 'report' as const, label: 'Latest Audit' },
                { key: 'history' as const, label: `History (${completedCount})` },
                { key: 'chat' as const, label: 'Ask AI' },
              ]
          ).map(tab => {
            const tabAccent = TIER_COLORS[client?.plan || 'audit'] || '#C9A84C';
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? `2px solid ${tabAccent}` : '2px solid transparent',
                  color: activeTab === tab.key ? '#F5F0E8' : '#888',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  transition: 'color 0.2s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── REPORT TAB ─── */}
        {activeTab === 'report' && (
          !latestJob ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', color: '#F5F0E8', marginBottom: '1rem' }}>
                {pendingJob ? 'Your first audit is running…' : 'Your audit is on its way'}
              </div>
              <p style={{ color: '#999', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
                {pendingJob
                  ? 'Your AI visibility audit is processing. Results will appear here automatically.'
                  : 'Your first audit will be ready shortly. Check back in 15 minutes or look for an email from us.'}
              </p>
            </div>
          ) : (
            <div>
              {/* Report date + next update info */}
              {latestJob.completed_at && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  background: `${TIER_COLORS[client?.plan || 'audit']}0A`,
                  border: `1px solid ${TIER_COLORS[client?.plan || 'audit']}20`,
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5px', height: '5px', background: '#4a9e6a', borderRadius: '50%', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: '#999' }}>
                        Report date: <span style={{ color: '#F5F0E8', fontWeight: 500 }}>{fmt(latestJob.completed_at)}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5px', height: '5px', background: TIER_COLORS[client?.plan || 'audit'], borderRadius: '50%', flexShrink: 0, animation: isGrowthOrAbove ? 'pulse 2s infinite' : 'none' }} />
                      <span style={{ fontSize: '0.78rem', color: '#999' }}>
                        {isGrowthOrAbove ? (
                          <>Next audit: <span style={{ color: TIER_COLORS[client?.plan || 'audit'], fontWeight: 600 }}>{getNextAuditDate(latestJob.completed_at, client?.plan)}</span></>
                        ) : (
                          <>Next audit: <button onClick={() => setShowReauditChoice(v => !v)} style={{ background: 'none', border: 'none', padding: 0, color: TIER_COLORS[client?.plan || 'audit'], fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Run another audit →</button></>
                        )}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.6rem',
                    padding: '2px 8px',
                    background: isGrowthOrAbove ? `${TIER_COLORS[client?.plan || 'audit']}18` : 'rgba(255,255,255,0.04)',
                    border: isGrowthOrAbove ? `1px solid ${TIER_COLORS[client?.plan || 'audit']}40` : '1px solid #2a2a2a',
                    color: isGrowthOrAbove ? TIER_COLORS[client?.plan || 'audit'] : '#888',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    {getUpdateFrequencyLabel(client?.plan)}
                  </span>
                </div>
              )}

              {/* Re-audit choice — audit tier only, toggled from report date bar */}
              {showReauditChoice && isAuditTier && client && (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  background: '#0D0D0D',
                  border: '1px solid rgba(201,168,76,0.2)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Ready for a fresh audit?
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: 0, lineHeight: 1.5 }}>
                      Your AI visibility changes over time. Get updated results or upgrade for automatic recurring audits.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              plan: 'audit',
                              email: client.email,
                              business_name: client.business_name || '',
                              business_type: client.business_type || '',
                              location: client.location || '',
                              website: client.website || '',
                            }),
                          });
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                          else alert('Something went wrong. Please contact hello@presenzia.ai');
                        } catch {
                          alert('Something went wrong. Please contact hello@presenzia.ai');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      style={{
                        padding: '0.5rem 1.25rem',
                        background: 'transparent',
                        color: '#C9A84C',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid rgba(201,168,76,0.4)',
                        cursor: actionLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Buy another audit — £99'}
                    </button>
                    <button
                      onClick={() => handleChangePlan('growth')}
                      disabled={actionLoading}
                      style={{
                        padding: '0.5rem 1.25rem',
                        background: '#5BA88C',
                        color: '#0A0A0A',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: actionLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Upgrade to Growth — £249/mo →
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive report — replaces static report view */}
              <InteractiveReport
                job={latestJob}
                client={{
                  business_name: client?.business_name || null,
                  business_type: client?.business_type || null,
                  location: client?.location || null,
                  website: client?.website || null,
                  plan: client?.plan || 'growth',
                }}
                onDownload={handleDownloadReport}
              />

              {/* Rate your audit prompt */}
              {latestJob.completed_at && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: '#0D0D0D',
                  border: '1px solid #1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>
                      How was your audit?
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                      Your feedback helps us improve the service
                    </div>
                  </div>
                  <Link
                    href="/dashboard/rate"
                    style={{
                      padding: '0.4rem 1rem',
                      background: 'transparent',
                      border: `1px solid ${TIER_COLORS[client?.plan || 'audit']}50`,
                      color: TIER_COLORS[client?.plan || 'audit'],
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    Rate your audit
                  </Link>
                </div>
              )}

              {/* Score trend graph — Growth/Premium only (needs 2+ audits) */}
              {isGrowthOrAbove && history.filter(r => r.status === 'completed' && r.overall_score !== null).length >= 2 && (
                <div style={{
                  background: '#0D0D0D',
                  border: `1px solid ${TIER_COLORS[client?.plan || 'audit']}30`,
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  marginTop: '1.25rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#666',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Score Evolution
                    </div>
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '2px 8px',
                      background: `${TIER_COLORS[client?.plan || 'audit']}18`,
                      border: `1px solid ${TIER_COLORS[client?.plan || 'audit']}40`,
                      color: TIER_COLORS[client?.plan || 'audit'],
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      Updated {client?.plan === 'premium' ? 'daily' : 'weekly'}
                    </span>
                  </div>
                  <ScoreTrendGraph reports={history} plan={client?.plan || 'growth'} />
                </div>
              )}


              {/* Audit tier: re-purchase + upsell options */}
              {isAuditTier && client?.status !== 'cancelled' && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Buy another one-off audit */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    background: '#0D0D0D',
                    border: '1px solid #1a1a1a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '6px', height: '6px', background: '#C9A84C', borderRadius: '50%' }} />
                      <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600 }}>
                        Want an updated audit?
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, margin: '0 0 1rem' }}>
                      Your AI visibility changes over time. Purchase another one-off audit to see how your score has evolved and get fresh recommendations.
                    </p>
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              plan: 'audit',
                              email: client.email,
                              business_name: client.business_name || '',
                              business_type: client.business_type || '',
                              location: client.location || '',
                              website: client.website || '',
                            }),
                          });
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                          else alert('Something went wrong. Please contact hello@presenzia.ai');
                        } catch {
                          alert('Something went wrong. Please contact hello@presenzia.ai');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'transparent',
                        color: '#C9A84C',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: '1px solid rgba(201,168,76,0.4)',
                        cursor: actionLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Buy another audit — £99 →'}
                    </button>
                  </div>

                  {/* Upsell to Growth */}
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    background: 'rgba(201,168,76,0.04)',
                    border: '1px solid rgba(201,168,76,0.15)',
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Want ongoing visibility tracking?
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, margin: '0 0 1rem' }}>
                      Upgrade to Growth for weekly re-audits, a live dashboard with score tracking, an AI audit assistant, and competitor deep-dive analysis — all for £249/mo.
                    </p>
                    <button
                      onClick={() => handleChangePlan('growth')}
                      disabled={actionLoading}
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: '#C9A84C',
                        color: '#0A0A0A',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: actionLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Upgrade to Growth Retainer →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeTab === 'history' && (
          <div style={{ border: '1px solid #111' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No audits yet.</div>
            ) : (
              history.map((report, i) => (
                <div key={report.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderBottom: i < history.length - 1 ? '1px solid #111' : 'none',
                  background: i === 0 ? '#0D0D0D' : 'transparent',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#F5F0E8' }}>
                        {report.completed_at ? fmt(report.completed_at) : fmt(report.created_at)}
                      </span>
                      {i === 0 && report.status === 'completed' && (
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#1a1400', border: '1px solid #3a2e00', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Latest
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                      {report.status === 'completed' ? 'Completed' : report.status === 'running' ? 'Running…' : report.status === 'pending' ? 'Queued' : 'Failed'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {report.overall_score !== null && report.grade && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', color: scoreColor(report.overall_score), fontWeight: 700, lineHeight: 1 }}>{report.overall_score}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>/ 100 · Grade {report.grade}</div>
                      </div>
                    )}
                    {report.report_path && (
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        style={{ background: 'none', border: '1px solid #555', color: '#999', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C9A84C'; (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#999'; (e.currentTarget as HTMLElement).style.borderColor = '#555'; }}
                      >
                        ↓ Audit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── CHAT TAB ─── */}
        {activeTab === 'chat' && (
          latestJob ? (
            <div style={{ maxWidth: '700px' }}>
              <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Ask anything about your results: what the scores mean, how competitors are outranking you, and exactly what to do to improve.
              </p>
              <ChatPane jobId={latestJob.id} businessName={client?.business_name || ''} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              Chat will be available once your first audit is ready.
            </div>
          )
        )}

        {/* ─── SUBSCRIPTION MANAGEMENT ─── */}
        {client?.status !== 'cancelled' ? (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1a1a1a' }}>
          {/* Pending change banner (downgrade or cancellation) */}
          {client?.pending_plan_change && (
            <div style={{
              padding: '1rem 1.25rem',
              background: client.pending_plan_change === 'cancel' ? 'rgba(204,68,68,0.06)' : '#1a1500',
              border: `1px solid ${client.pending_plan_change === 'cancel' ? 'rgba(204,68,68,0.2)' : '#332800'}`,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: '0.85rem', color: client.pending_plan_change === 'cancel' ? '#cc8888' : '#C9A84C' }}>
                {client.pending_plan_change === 'cancel'
                  ? <>Your subscription will end on {client.pending_change_date ? new Date(client.pending_change_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the end of your billing cycle'}. No further payments will be made.</>
                  : <>Switching to {PLAN_LABELS[client.pending_plan_change] || client.pending_plan_change} on {client.pending_change_date ? new Date(client.pending_change_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'end of billing cycle'}.</>
                }
              </div>
              <button
                onClick={handleCancelPending}
                disabled={actionLoading}
                style={{
                  background: 'none',
                  border: '1px solid #444',
                  color: '#AAAAAA',
                  padding: '0.4rem 1rem',
                  fontSize: '0.78rem',
                  cursor: actionLoading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {actionLoading ? 'Processing...' : client.pending_plan_change === 'cancel' ? `Stay on ${PLAN_LABELS[client.plan] || client.plan}` : 'Cancel this change'}
              </button>
            </div>
          )}

          {/* Plan options */}
          {client && (
            <div id="plan-options" style={{ marginBottom: '2rem' }}>
              {/* Audit tier: show subscription plans to upgrade to */}
              {isAuditTier ? (
                <>
                  <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Subscription plans</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['growth', 'premium'].map(plan => {
                      const tierColor = TIER_COLORS[plan] || '#C9A84C';
                      return (
                        <div key={plan} style={{
                          flex: 1,
                          minWidth: 'min(280px, 100%)',
                          padding: '1.25rem',
                          background: '#0A0A0A',
                          border: '1px solid #1a1a1a',
                          borderTop: `3px solid ${tierColor}`,
                        }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.95rem', color: '#AAAAAA', fontWeight: 600 }}>
                              {PLAN_LABELS[plan]}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#888', fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}>
                                {PLAN_PRICES[plan]}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {PLAN_PRICE_SUFFIX[plan]}
                              </span>
                            </div>
                          </div>
                          <ul style={{ margin: '0.75rem 0 1.25rem', padding: '0 0 0 1rem', fontSize: '0.8rem', color: '#888', lineHeight: 1.7 }}>
                            {PLAN_FEATURES[plan]?.map((f, i) => (
                              <li key={i} style={{ marginBottom: '2px' }}>
                                <span style={{ color: '#555', marginRight: '2px' }}></span>{f}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => handleChangePlan(plan)}
                            disabled={actionLoading}
                            style={{ background: tierColor, color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                          >
                            {actionLoading ? 'Processing...' : `Upgrade to ${PLAN_LABELS[plan]} →`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.75rem' }}>
                    Subscriptions include automatic recurring audits and an always-up-to-date dashboard.
                  </p>
                </>
              ) : (
                <>
                  {/* Growth/Premium: show all 3 plan cards with current highlighted */}
                  <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your plan</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['growth', 'premium'].map(plan => {
                      const isCurrent = plan === client.plan;
                      const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(client.plan);
                      const tierColor = TIER_COLORS[plan] || '#C9A84C';
                      return (
                        <div key={plan} style={{
                          flex: 1,
                          minWidth: 'min(280px, 100%)',
                          padding: '1.25rem',
                          background: isCurrent ? `${tierColor}08` : '#0A0A0A',
                          borderTop: isCurrent ? `3px solid ${tierColor}` : '3px solid transparent',
                          border: isCurrent ? `1px solid ${tierColor}40` : '1px solid #1a1a1a',
                          borderTopWidth: '3px',
                          position: 'relative',
                        }}>
                          {isCurrent && (
                            <div style={{
                              position: 'absolute',
                              top: '-1px',
                              right: '1rem',
                              background: tierColor,
                              color: '#0A0A0A',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              padding: '3px 10px',
                            }}>
                              Your plan
                            </div>
                          )}
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.95rem', color: isCurrent ? '#F5F0E8' : '#AAAAAA', fontWeight: 600 }}>
                              {PLAN_LABELS[plan]}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: isCurrent ? tierColor : '#888', fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}>
                                {PLAN_PRICES[plan]}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {PLAN_PRICE_SUFFIX[plan]}
                              </span>
                            </div>
                          </div>
                          <ul style={{ margin: '0.75rem 0 1.25rem', padding: '0 0 0 1rem', fontSize: '0.8rem', color: isCurrent ? '#BBBBBB' : '#888', lineHeight: 1.7 }}>
                            {PLAN_FEATURES[plan]?.map((f, i) => (
                              <li key={i} style={{ marginBottom: '2px' }}>
                                <span style={{ color: isCurrent ? tierColor : '#555', marginRight: '2px' }}></span>{f}
                              </li>
                            ))}
                          </ul>
                          {isCurrent ? (
                            <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', color: tierColor, border: `1px solid ${tierColor}30`, background: `${tierColor}08` }}>
                              Current plan
                            </div>
                          ) : isUpgrade ? (
                            <button
                              onClick={() => handleChangePlan(plan)}
                              disabled={actionLoading}
                              style={{ background: tierColor, color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                            >
                              {actionLoading ? 'Processing...' : `Upgrade to ${PLAN_LABELS[plan]} →`}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleChangePlan(plan)}
                                disabled={actionLoading}
                                style={{ background: 'transparent', color: '#888', border: '1px solid #333', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                              >
                                {actionLoading ? 'Processing...' : `Downgrade to ${PLAN_LABELS[plan]}`}
                              </button>
                              <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '4px', textAlign: 'center' }}>Takes effect at end of billing cycle</p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                    Upgrades are instant — you only pay the difference. Downgrades take effect at the end of your billing cycle.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Cancel — only show for subscription plans (growth/premium) */}
          {isGrowthOrAbove && (
            <>
              {!showCancel ? (
                <button
                  onClick={handleStartCancel}
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  Cancel subscription
                </button>
              ) : (
                <CancelFlow
                  plan={client?.plan || 'growth'}
                  cancelStep={cancelStep}
                  setCancelStep={setCancelStep}
                  retentionEligible={retentionEligible}
                  retentionCode={retentionCode}
                  actionLoading={actionLoading}
                  onAcceptRetention={handleAcceptRetention}
                  onConfirmCancel={handleConfirmCancel}
                  onChangePlan={handleChangePlan}
                  onSubmitFeedback={handleSubmitFeedback}
                  onClose={() => setShowCancel(false)}
                  cancelEndDate={cancelEndDate}
                />
              )}
            </>
          )}

          {/* Delete account */}
          <div style={{ marginTop: '1.5rem' }}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
              >
                Delete account and all data
              </button>
            ) : (
              <div style={{
                padding: '1.25rem',
                background: 'rgba(204,68,68,0.04)',
                border: '1px solid rgba(204,68,68,0.2)',
                marginTop: '0.5rem',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Delete your account?
                </div>
                <p style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  This will permanently delete your account, all audit reports, score history, and any stored data. Your Stripe subscription will be cancelled immediately. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: '#cc4444',
                      color: '#F5F0E8',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: deleteLoading ? 'wait' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'none',
                      color: '#888',
                      border: '1px solid #333',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Questions? <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>
            </p>
          </div>
        )}
      </div>

      {/* Compact footer */}
      <footer style={{
        padding: '2rem clamp(1rem, 3vw, 2rem)',
        borderTop: '1px solid #1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginTop: '2rem',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          &copy; {new Date().getFullYear()} Ketzal LTD t/a{' '}
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>presenzia.ai</Link>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
          <a href="mailto:hello@presenzia.ai" style={{ color: '#666', textDecoration: 'none' }}>Contact</a>
          <Link href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Dashboard responsive */
        @media (max-width: 768px) {
          .dash-score-header {
            flex-direction: column !important;
            text-align: center;
            gap: 1.25rem !important;
          }
          .dash-report-grid {
            grid-template-columns: 1fr !important;
          }
          .dash-platform-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .dash-nav-status {
            display: none !important;
          }
          .dash-nav-name {
            max-width: 120px;
          }
        }
        @media (max-width: 480px) {
          .dash-platform-grid {
            grid-template-columns: 1fr !important;
          }
          .dash-nav-name {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
