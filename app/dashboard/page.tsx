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
  'ChatGPT': 'Used by 200M+ people daily. When someone asks ChatGPT to recommend a business like yours, this score shows how often you appear.',
  'Claude': 'Anthropic\'s AI assistant, growing rapidly in professional use. A high score here means Claude is recommending your business.',
  'Perplexity': 'An AI-powered search engine replacing Google for many users. High visibility here drives direct, high-intent traffic to your business.',
  'Google AI': 'Google\'s AI Overview appears at the top of search results. Critical for local discovery — this is the highest-impact platform.',
};

const GRADE_COLORS: Record<string, string> = {
  'A': '#4CAF50',
  'B': '#8BC34A',
  'C': '#FFC107',
  'D': '#FF9800',
  'F': '#F44336',
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  premium: 'Premium',
};

const PLAN_PRICES: Record<string, string> = {
  starter: '£99',
  growth: '£199',
  premium: '£599',
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['Monthly AI visibility audit', 'Delivered by email (report)'],
  growth: ['Everything in Starter', 'Online client dashboard (weekly updates)', 'AI audit assistant', 'Competitor deep-dive', 'Priority email support'],
  premium: ['Everything in Growth', 'Daily dashboard updates', 'Dedicated account manager', 'Monthly 1:1 strategy call', 'Custom prompt testing'],
};

const PLAN_ORDER = ['starter', 'growth', 'premium'];

const PLAN_LOSSES: Record<string, string[]> = {
  starter: ['Monthly AI visibility audits', 'Email reports with action plans', 'Score tracking over time'],
  growth: ['Online dashboard with weekly updates', 'AI audit assistant', 'Competitor deep-dive analysis', 'Priority email support'],
  premium: ['Daily dashboard updates', 'Dedicated account manager', 'Monthly 1:1 strategy call', 'Custom prompt testing', 'Industry benchmarking'],
};

// Premium strategy call booking link — replace with Calendly/Cal.com URL when ready
const BOOKING_URL = 'https://calendly.com/presenzia/strategy-call';

const GRADE_CONTEXT: Record<string, string> = {
  'A': 'Excellent — AI assistants are actively recommending your business. Keep monitoring to maintain your position.',
  'B': 'Good visibility with room to grow. A few targeted improvements could push you into the top tier.',
  'C': 'Moderate presence. You appear on some platforms but competitors are being recommended more often.',
  'D': 'Low visibility. Most AI searches in your category are recommending competitors instead of you.',
  'F': 'Not visible. AI assistants are not currently recommending your business. Immediate action needed.',
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

function getNextAuditDate(lastDate: string): string {
  const d = new Date(lastDate);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

// ── CancelFlow: multi-step cancellation funnel ──────────────
function CancelFlow({
  plan,
  cancelStep,
  setCancelStep,
  retentionEligible,
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
  const lowerPlans = PLAN_ORDER.filter((_, i) => i < planRank);

  const handleProceedFromLoss = () => {
    // Tier 2+ → offer downgrade first; Tier 1 → retention or confirming
    if (planRank > 0) {
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
                  {PLAN_LABELS[p]} · {PLAN_PRICES[p]}/mo
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
            If you change your mind, you can undo the cancellation from your dashboard anytime before the end date, or visit our <a href="/#pricing" style={{ color: '#C9A84C', textDecoration: 'none' }}>pricing page</a> to resubscribe later.
          </p>
        </>
      )}

      {cancelStep === 'saved' && (
        <>
          <div style={{ fontSize: '0.9rem', color: '#C9A84C', fontWeight: 600, marginBottom: '0.5rem' }}>Discount applied!</div>
          <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6 }}>
            Your next month is 50% off. We're glad you're staying! Keep implementing the actions from your latest audit and watch your AI visibility improve.
          </p>
          <button
            onClick={onClose}
            style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #333', color: '#999', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Close
          </button>
        </>
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
    content: `Hi! I can help you understand your AI visibility results for ${businessName || 'your business'} and suggest specific improvements. What would you like to know?`,
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
              {msg.content}
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
  const [congratsPlan, setCongratsPlan] = useState<string | null>(null);
  const [cancelEndDate, setCancelEndDate] = useState<string | null>(null);

  useEffect(() => {
    // Detect post-checkout redirect (?upgraded=plan)
    const params = new URLSearchParams(window.location.search);
    const upgradedPlan = params.get('upgraded');
    if (upgradedPlan && PLAN_LABELS[upgradedPlan]) {
      setCongratsPlan(upgradedPlan);
      // Clean up URL
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
    };

    load();
  }, [router]);

  const handleSignOut = async () => {
    // Cookie is httpOnly — must clear it server-side
    await fetch('/api/client/signout', { method: 'POST' });
    router.push('/');
  };

  const handleDownloadReport = (jobId: string) => {
    window.open(`/api/client/download?jobId=${jobId}`, '_blank');
  };

  const handleChangePlan = async (targetPlan: string) => {
    // If there's a pending change, ask the user to confirm before proceeding
    if (client?.pending_plan_change) {
      const pendingLabel = client.pending_plan_change === 'cancel'
        ? 'cancel your subscription'
        : `switch to ${PLAN_LABELS[client.pending_plan_change] || client.pending_plan_change}`;
      const dateStr = client.pending_change_date
        ? new Date(client.pending_change_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'end of your billing cycle';
      const confirmed = window.confirm(
        `You currently have a pending change to ${pendingLabel} scheduled for ${dateStr}.\n\nWould you like to cancel that and switch to ${PLAN_LABELS[targetPlan] || targetPlan} instead?`
      );
      if (!confirmed) return;
    }

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
      if (data.success) {
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

  // Starter plan: limited portal — report downloads + upsell
  if (client?.plan === 'starter') {
    const completedReports = history.filter(r => r.status === 'completed');
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' }}>
        {/* Congratulations overlay */}
        {congratsPlan && <CongratsBanner plan={congratsPlan} onClose={handleCongratsClose} />}
        {/* Nav */}
        <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1rem clamp(1rem, 3vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50, gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', minWidth: 0 }}>
            <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none', flexShrink: 0 }}>
              presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
            </Link>
            <div style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.business_name || client.email}</span>
              <span style={{ padding: '2px 8px', background: '#1a1a1a', border: '1px solid #333', fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Starter</span>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#999', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', flexShrink: 0 }}>
            Sign out
          </button>
        </div>

        {/* Prominent pending-change banner — visible immediately on login */}
        <PendingChangeBanner client={client} onCancelPending={handleCancelPending} actionLoading={actionLoading} />

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem clamp(1rem, 3vw, 2rem) 4rem' }}>

          {/* Report repository */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Audit library</div>
                <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', color: '#F5F0E8', fontWeight: 600 }}>Your AI visibility audits</h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>{completedReports.length} audit{completedReports.length !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ border: '1px solid #111' }}>
              {completedReports.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                  {pendingJob
                    ? 'Your first audit is being prepared — check back shortly.'
                    : 'Your first audit will arrive by email once it is complete.'}
                </div>
              ) : (
                completedReports.map((report, i) => (
                  <div key={report.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderBottom: i < completedReports.length - 1 ? '1px solid #111' : 'none',
                    background: i === 0 ? '#0D0D0D' : 'transparent',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#F5F0E8' }}>
                          {report.completed_at ? fmt(report.completed_at) : fmt(report.created_at)}
                        </span>
                        {i === 0 && (
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#1a1400', border: '1px solid #3a2e00', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest</span>
                        )}
                      </div>
                      {report.overall_score !== null && report.grade && (
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          Score: <span style={{ color: '#C9A84C' }}>{report.overall_score}/100</span> · Grade {report.grade}
                        </div>
                      )}
                    </div>
                    {report.report_path ? (
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        style={{ background: 'none', border: '1px solid #555', color: '#999', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C9A84C'; (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#999'; (e.currentTarget as HTMLElement).style.borderColor = '#555'; }}
                      >
                        ↓ Download audit
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>Processing…</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Next audit / Inactive subscription banner */}
          {client.status === 'cancelled' ? (
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(204,68,68,0.06)',
              border: '1px solid rgba(204,68,68,0.2)',
              marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>No active subscription</div>
              <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, margin: '0 0 1rem' }}>
                Your previous reports are still available below. To generate a new audit, resubscribe to one of our plans.
              </p>
              <a
                href="/#pricing"
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
          ) : (
            <>
              {/* Next audit date */}
              {completedReports.length > 0 && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(201,168,76,0.04)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  marginBottom: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <div style={{ width: '6px', height: '6px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#AAAAAA' }}>
                    Your next audit will be available on{' '}
                    <span style={{ color: '#C9A84C', fontWeight: 600 }}>
                      {getNextAuditDate(completedReports[0].completed_at || completedReports[0].created_at)}
                    </span>
                  </span>
                </div>
              )}

              {/* Pending cancellation banner (Starter) */}
              {client.pending_plan_change === 'cancel' && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(204,68,68,0.06)',
                  border: '1px solid rgba(204,68,68,0.2)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#cc8888' }}>
                    Your subscription will end on {client.pending_change_date ? new Date(client.pending_change_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the end of your billing cycle'}. No further payments will be made.
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
                    {actionLoading ? 'Processing...' : 'Stay on Starter'}
                  </button>
                </div>
              )}

              {/* Plan options — all 3 plans, current highlighted */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your plan</div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {PLAN_ORDER.map(plan => {
                    const isCurrent = plan === 'starter';
                    const accentColor = plan === 'premium' ? '#9b6bcc' : '#C9A84C';
                    return (
                      <div key={plan} style={{
                        flex: 1,
                        minWidth: 'min(240px, 100%)',
                        padding: '1.25rem',
                        background: isCurrent ? '#0D0D0D' : '#0A0A0A',
                        border: isCurrent ? '2px solid #C9A84C' : '1px solid #1a1a1a',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ fontSize: '0.9rem', color: isCurrent ? '#F5F0E8' : accentColor, fontWeight: 600 }}>
                            {PLAN_LABELS[plan]} · {PLAN_PRICES[plan]}/mo
                          </div>
                          {isCurrent && (
                            <span style={{ fontSize: '0.65rem', color: '#C9A84C', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, background: 'rgba(201,168,76,0.12)', padding: '2px 8px' }}>
                              Current plan
                            </span>
                          )}
                          {!isCurrent && (
                            <span style={{ fontSize: '0.65rem', color: accentColor, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Upgrade</span>
                          )}
                        </div>
                        <ul style={{ margin: '0.5rem 0 1rem', padding: '0 0 0 1rem', fontSize: '0.8rem', color: isCurrent ? '#AAAAAA' : '#999', lineHeight: 1.7 }}>
                          {PLAN_FEATURES[plan]?.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        {isCurrent ? (
                          <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', color: '#666', border: '1px solid #222', background: '#111' }}>
                            Your current plan
                          </div>
                        ) : (
                          <button
                            onClick={() => handleChangePlan(plan)}
                            disabled={actionLoading}
                            style={{ background: accentColor, color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                          >
                            {actionLoading ? 'Processing…' : `Upgrade to ${PLAN_LABELS[plan]} →`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Upgrades are instant — you only pay the difference. Downgrades take effect at the end of your billing cycle.
                </p>
              </div>

              {/* Cancel */}
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Questions? <a href="mailto:hello@presenzia.ai" style={{ color: '#999', textDecoration: 'none' }}>hello@presenzia.ai</a>
                </p>
                {!showCancel ? (
                  <button
                    onClick={handleStartCancel}
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                    <CancelFlow
                      plan={client?.plan || 'starter'}
                      cancelStep={cancelStep}
                      setCancelStep={setCancelStep}
                      retentionEligible={retentionEligible}
                      actionLoading={actionLoading}
                      onAcceptRetention={handleAcceptRetention}
                      onConfirmCancel={handleConfirmCancel}
                      onChangePlan={handleChangePlan}
                      onSubmitFeedback={handleSubmitFeedback}
                      onClose={() => setShowCancel(false)}
                      cancelEndDate={cancelEndDate}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const platforms = latestJob?.platforms_json || [];
  const competitors = latestJob?.competitors_json || [];
  const completedCount = history.filter(r => r.status === 'completed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' }}>
      {/* Congratulations overlay */}
      {congratsPlan && <CongratsBanner plan={congratsPlan} onClose={handleCongratsClose} />}

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1rem clamp(1rem, 3vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50, gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', minWidth: 0 }}>
          <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none', flexShrink: 0 }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
          {client && (
            <div style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.business_name || client.email}</span>
              <span style={{ padding: '2px 8px', background: '#1a1a1a', border: '1px solid #333', fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                {PLAN_LABELS[client.plan] || client.plan}
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
              href="/#pricing"
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
            Your AI visibility audit is running — results will appear here within a few minutes.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '2rem' }}>
          {([
            { key: 'report', label: 'Latest Audit' },
            { key: 'history', label: `History (${completedCount})` },
            { key: 'chat', label: 'Ask AI' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.625rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #C9A84C' : '2px solid transparent',
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
          ))}
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
                  : 'Your first audit will be ready shortly. Check back in a few minutes or look for an email from us.'}
              </p>
            </div>
          ) : (
            <div>
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

              {/* Score trend graph */}
              {history.filter(r => r.status === 'completed' && r.overall_score !== null).length >= 2 && (
                <div style={{
                  background: '#0D0D0D',
                  border: '1px solid #1a1a1a',
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  marginTop: '1.25rem',
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#666',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}>
                    Score trend ({client?.plan === 'premium' ? 'daily' : 'weekly'} audits)
                  </div>
                  <ScoreTrendGraph reports={history} plan={client?.plan || 'growth'} />
                </div>
              )}

              {/* Next audit date */}
              {latestJob.completed_at && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(201,168,76,0.04)',
                  border: '1px solid rgba(201,168,76,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <div style={{ width: '5px', height: '5px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: '#999' }}>
                    Next audit: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{getNextAuditDate(latestJob.completed_at)}</span>
                  </span>
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

          {/* Plan options — always visible, all 3 plans, current highlighted */}
          {client && (
            <div id="plan-options" style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Your plan</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {PLAN_ORDER.map(plan => {
                  const isCurrent = plan === client.plan;
                  const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(client.plan);
                  const accentColor = plan === 'premium' ? '#9b6bcc' : '#C9A84C';
                  return (
                    <div key={plan} style={{
                      flex: 1,
                      minWidth: 'min(260px, 100%)',
                      padding: '1.25rem',
                      background: isCurrent ? '#0D0D0D' : '#0A0A0A',
                      border: isCurrent ? '2px solid #C9A84C' : '1px solid #1a1a1a',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.9rem', color: isCurrent ? '#F5F0E8' : isUpgrade ? accentColor : '#999', fontWeight: 600 }}>
                          {PLAN_LABELS[plan]} · {PLAN_PRICES[plan]}/mo
                        </div>
                        {isCurrent ? (
                          <span style={{ fontSize: '0.65rem', color: '#C9A84C', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, background: 'rgba(201,168,76,0.12)', padding: '2px 8px' }}>
                            Current plan
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: isUpgrade ? accentColor : '#666', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                            {isUpgrade ? 'Upgrade' : 'Downgrade'}
                          </span>
                        )}
                      </div>
                      <ul style={{ margin: '0.5rem 0 1rem', padding: '0 0 0 1rem', fontSize: '0.8rem', color: isCurrent ? '#AAAAAA' : '#999', lineHeight: 1.7 }}>
                        {PLAN_FEATURES[plan]?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                      {isCurrent ? (
                        <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', color: '#666', border: '1px solid #222', background: '#111' }}>
                          Your current plan
                        </div>
                      ) : isUpgrade ? (
                        <button
                          onClick={() => handleChangePlan(plan)}
                          disabled={actionLoading}
                          style={{ background: accentColor, color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                        >
                          {actionLoading ? 'Processing...' : `Upgrade to ${PLAN_LABELS[plan]} →`}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleChangePlan(plan)}
                            disabled={actionLoading}
                            style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                          >
                            {actionLoading ? 'Processing...' : `Switch to ${PLAN_LABELS[plan]}`}
                          </button>
                          <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', textAlign: 'center' }}>Takes effect at end of billing cycle</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                Upgrades are instant — you only pay the difference. Downgrades take effect at the end of your billing cycle.
              </p>
            </div>
          )}

          {/* Cancel */}
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
              actionLoading={actionLoading}
              onAcceptRetention={handleAcceptRetention}
              onConfirmCancel={handleConfirmCancel}
              onChangePlan={handleChangePlan}
              onSubmitFeedback={handleSubmitFeedback}
              onClose={() => setShowCancel(false)}
              cancelEndDate={cancelEndDate}
            />
          )}
        </div>
        ) : (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Questions? <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>
            </p>
          </div>
        )}
      </div>

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
        }
        @media (max-width: 480px) {
          .dash-platform-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
