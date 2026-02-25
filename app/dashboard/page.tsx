'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
}

interface HistoryReport {
  id: string;
  status: string;
  overall_score: number | null;
  grade: string | null;
  completed_at: string | null;
  created_at: string;
  report_path: string | null;
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
  starter: ['Monthly AI visibility audit', 'Delivered by email (PDF)'],
  growth: ['Everything in Starter', 'Live dashboard (weekly updates)', 'AI audit assistant', 'Competitor deep-dive', 'Priority email support'],
  premium: ['Everything in Growth', 'Daily dashboard updates', 'Dedicated account manager', 'Monthly 1:1 strategy call', 'Custom prompt testing'],
};

const PLAN_ORDER = ['starter', 'growth', 'premium'];

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

function PlatformBar({ platform }: { platform: PlatformScore }) {
  const [tooltip, setTooltip] = useState(false);
  const pct = Math.round(platform.score);
  const isFound = platform.score > 0;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: isFound ? '#F5F0E8' : '#999' }}>{platform.platform}</span>
          <div
            style={{ position: 'relative', cursor: 'help' }}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          >
            <span style={{ fontSize: '0.75rem', color: '#888', border: '1px solid #555', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>?</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>{platform.promptsMentioned}/{platform.promptsTested} prompts</span>
          <span style={{ fontSize: '0.75rem', color: isFound ? scoreColor(platform.score) : '#888', letterSpacing: '0.05em' }}>
            {isFound ? 'Visible' : 'Not found'}
          </span>
        </div>
      </div>
      <div style={{ height: '4px', background: '#222', borderRadius: '2px' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isFound ? scoreColor(platform.score) : '#2a2a2a',
          borderRadius: '2px',
          transition: 'width 1s ease',
        }} />
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
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelStep, setCancelStep] = useState<'offer' | 'confirming' | 'done' | 'saved'>('offer');
  const [actionLoading, setActionLoading] = useState(false);
  const [retentionEligible, setRetentionEligible] = useState(true);

  useEffect(() => {
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

  const handleUpgrade = async (targetPlan: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/client/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan }),
      });
      const data = await res.json();
      if (data.success) {
        setClient(prev => prev ? { ...prev, plan: targetPlan } : null);
        setShowUpgrade(false);
        window.location.reload();
      } else {
        alert(data.error || 'Upgrade failed. Please contact hello@presenzia.ai');
      }
    } catch {
      alert('Something went wrong. Please contact hello@presenzia.ai');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCancel = async () => {
    setShowCancel(true);
    // Check if 50% retention offer is eligible (3-month cooldown)
    try {
      const res = await fetch('/api/client/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-retention' }),
      });
      const data = await res.json();
      setRetentionEligible(data.eligible !== false);
      setCancelStep(data.eligible !== false ? 'offer' : 'confirming');
    } catch {
      // If check fails, default to showing the offer
      setRetentionEligible(true);
      setCancelStep('offer');
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
        setCancelStep('done');
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

          {/* Upgrade section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Upgrade your plan</div>

            <div style={{ marginBottom: '0.75rem', padding: '1.25rem 1.5rem', background: '#0a0a00', border: '1px solid #2a2000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#C9A84C', fontWeight: 600, marginBottom: '6px' }}>Growth Plan · £199/mo</div>
                  <div style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.6 }}>
                    Weekly dashboard updates, competitor tracking, AI audit assistant, and priority support.
                  </div>
                </div>
                <button
                  onClick={() => handleUpgrade('growth')}
                  disabled={actionLoading}
                  style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {actionLoading ? 'Processing…' : 'Upgrade now'}
                </button>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', background: '#0a000a', border: '1px solid #1a001a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#9b6bcc', fontWeight: 600, marginBottom: '6px' }}>Premium Plan · £599/mo</div>
                  <div style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.6 }}>
                    Daily updates, dedicated account manager, monthly strategy call, custom prompt testing.
                  </div>
                </div>
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={actionLoading}
                  style={{ background: '#9b6bcc', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {actionLoading ? 'Processing…' : 'Upgrade now'}
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
              Upgrades take effect immediately. You only pay the difference for the rest of your billing cycle.
            </p>
          </div>

          {/* Cancel */}
          {!showCancel ? (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Questions? <a href="mailto:hello@presenzia.ai" style={{ color: '#999', textDecoration: 'none' }}>hello@presenzia.ai</a>
              </p>
              <button
                onClick={handleStartCancel}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
              >
                Cancel subscription
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a' }}>
              {cancelStep === 'offer' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Before you go…</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
                    We'd hate to see you leave. How about <span style={{ color: '#C9A84C', fontWeight: 600 }}>50% off your next month</span>? Stay and keep tracking your AI visibility while you see the results from your latest audit.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleAcceptRetention}
                      disabled={actionLoading}
                      style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
                    >
                      {actionLoading ? 'Applying…' : 'Yes, give me 50% off'}
                    </button>
                    <button
                      onClick={() => setCancelStep('confirming')}
                      disabled={actionLoading}
                      style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      No thanks, cancel anyway
                    </button>
                    <button
                      onClick={() => setShowCancel(false)}
                      style={{ background: 'none', border: 'none', color: '#555', padding: '0.5rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Never mind
                    </button>
                  </div>
                </>
              )}
              {cancelStep === 'confirming' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Are you sure?</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Your subscription will remain active until the end of your current billing period. After that, you will lose access to audits and your dashboard.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={actionLoading}
                      style={{ background: '#cc4444', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
                    >
                      {actionLoading ? 'Cancelling…' : 'Confirm cancellation'}
                    </button>
                    {retentionEligible && (
                      <button
                        onClick={() => { setCancelStep('offer'); }}
                        disabled={actionLoading}
                        style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Wait, show me the 50% offer
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancel(false)}
                      style={{ background: 'none', border: 'none', color: '#555', padding: '0.5rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Never mind
                    </button>
                  </div>
                </>
              )}
              {cancelStep === 'done' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Subscription cancelled</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6 }}>
                    Your subscription has been cancelled and will end at the close of your current billing period. You will continue to have access until then. If you change your mind, contact <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
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
                    onClick={() => setShowCancel(false)}
                    style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #333', color: '#999', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem) 4rem' }}>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>

              {/* Left column: Score + Platforms + Summary + Download */}
              <div>
                <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1.75rem', marginBottom: '1.25rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>presenzia.ai</div>
                      <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1rem', color: '#F5F0E8' }}>AI Visibility Audit</div>
                      {latestJob.completed_at && (
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '3px' }}>
                          {client?.business_name} · {fmt(latestJob.completed_at)}
                        </div>
                      )}
                    </div>
                    {latestJob.overall_score !== null && latestJob.grade && (
                      <ScoreGauge score={latestJob.overall_score} grade={latestJob.grade} />
                    )}
                  </div>

                  {/* Platform breakdown */}
                  {platforms.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                        Platform breakdown
                        <span style={{ color: '#888', marginLeft: '0.5rem', textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>(hover ? for details)</span>
                      </div>
                      {platforms.map(p => <PlatformBar key={p.platform} platform={p} />)}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {latestJob.summary && (
                  <div style={{ padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Summary</div>
                    <p style={{ color: '#AAAAAA', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{latestJob.summary}</p>
                  </div>
                )}

                {/* Download PDF */}
                {latestJob.report_path && (
                  <button
                    onClick={() => handleDownloadReport(latestJob.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: '1px solid #333',
                      color: '#AAAAAA',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.color = '#AAAAAA'; }}
                  >
                    ↓ Download audit
                  </button>
                )}

                {/* Next audit date */}
                {latestJob.completed_at && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.875rem 1rem',
                    background: 'rgba(201,168,76,0.04)',
                    border: '1px solid rgba(201,168,76,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                  }}>
                    <div style={{ width: '6px', height: '6px', background: '#C9A84C', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: '#AAAAAA' }}>
                      Next audit: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{getNextAuditDate(latestJob.completed_at)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Right column: Competitors + Chat */}
              <div>
                {/* Competitors */}
                {competitors.length > 0 && (
                  <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                      Competitors appearing instead of you
                    </div>
                    {competitors.slice(0, 5).map((comp, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < Math.min(4, competitors.length - 1) ? '1px solid #111' : 'none', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#CCCCCC' }}>{comp.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>{comp.count} mention{comp.count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Discuss your results
                  </div>
                  <ChatPane jobId={latestJob.id} businessName={client?.business_name || ''} />
                </div>
              </div>
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
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1a1a1a' }}>
          {/* Upgrade options (only show plans above current) */}
          {client && PLAN_ORDER.indexOf(client.plan) < PLAN_ORDER.length - 1 && (
            <div style={{ marginBottom: '2rem' }}>
              {!showUpgrade ? (
                <button
                  onClick={() => setShowUpgrade(true)}
                  style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Upgrade your plan
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Available upgrades</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {PLAN_ORDER.filter(p => PLAN_ORDER.indexOf(p) > PLAN_ORDER.indexOf(client.plan)).map(plan => (
                      <div key={plan} style={{ flex: 1, minWidth: 'min(260px, 100%)', padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a' }}>
                        <div style={{ fontSize: '0.9rem', color: plan === 'premium' ? '#9b6bcc' : '#C9A84C', fontWeight: 600, marginBottom: '4px' }}>
                          {PLAN_LABELS[plan]} · {PLAN_PRICES[plan]}/mo
                        </div>
                        <ul style={{ margin: '0.5rem 0 1rem', padding: '0 0 0 1rem', fontSize: '0.8rem', color: '#999', lineHeight: 1.7 }}>
                          {PLAN_FEATURES[plan]?.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        <button
                          onClick={() => handleUpgrade(plan)}
                          disabled={actionLoading}
                          style={{ background: plan === 'premium' ? '#9b6bcc' : '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit', width: '100%' }}
                        >
                          {actionLoading ? 'Processing…' : `Upgrade to ${PLAN_LABELS[plan]}`}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                    Upgrades take effect immediately. You only pay the difference for the rest of your billing cycle.
                  </p>
                  <button onClick={() => setShowUpgrade(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.25rem' }}>
                    Hide upgrade options
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cancel */}
          {!showCancel ? (
            <button
              onClick={handleStartCancel}
              style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Cancel subscription
            </button>
          ) : (
            <div style={{ padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a', maxWidth: '500px' }}>
              {cancelStep === 'offer' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Before you go…</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
                    We'd hate to see you leave. How about <span style={{ color: '#C9A84C', fontWeight: 600 }}>50% off your next month</span>? Stay and keep tracking your AI visibility while you see the results from your latest audit.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={handleAcceptRetention} disabled={actionLoading} style={{ background: '#C9A84C', color: '#0A0A0A', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                      {actionLoading ? 'Applying…' : 'Yes, give me 50% off'}
                    </button>
                    <button onClick={() => setCancelStep('confirming')} disabled={actionLoading} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      No thanks, cancel anyway
                    </button>
                    <button onClick={() => setShowCancel(false)} style={{ background: 'none', border: 'none', color: '#555', padding: '0.5rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Never mind
                    </button>
                  </div>
                </>
              )}
              {cancelStep === 'confirming' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Are you sure?</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Your subscription will remain active until the end of your current billing period. After that, you will lose access to audits and your dashboard.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={handleConfirmCancel} disabled={actionLoading} style={{ background: '#cc4444', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                      {actionLoading ? 'Cancelling…' : 'Confirm cancellation'}
                    </button>
                    {retentionEligible && (
                      <button onClick={() => setCancelStep('offer')} disabled={actionLoading} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Wait, show me the 50% offer
                      </button>
                    )}
                    <button onClick={() => setShowCancel(false)} style={{ background: 'none', border: 'none', color: '#555', padding: '0.5rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Never mind
                    </button>
                  </div>
                </>
              )}
              {cancelStep === 'done' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem' }}>Subscription cancelled</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6 }}>
                    Your subscription will end at the close of your current billing period. You will continue to have access until then. If you change your mind, contact <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
                  </p>
                </>
              )}
              {cancelStep === 'saved' && (
                <>
                  <div style={{ fontSize: '0.9rem', color: '#C9A84C', fontWeight: 600, marginBottom: '0.5rem' }}>Discount applied!</div>
                  <p style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.6 }}>
                    Your next month is 50% off. We're glad you're staying! Keep implementing the actions from your latest audit and watch your AI visibility improve.
                  </p>
                  <button onClick={() => setShowCancel(false)} style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #333', color: '#999', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
