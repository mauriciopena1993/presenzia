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

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(3rem, 8vw, 4.5rem)',
        color: '#C9A84C',
        lineHeight: 1,
        fontWeight: 600,
      }}>
        {score}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px', letterSpacing: '0.05em' }}>/ 100</div>
      <div style={{
        display: 'inline-block',
        marginTop: '12px',
        padding: '4px 16px',
        background: (GRADE_COLORS[grade] || '#C9A84C') + '22',
        border: `1px solid ${(GRADE_COLORS[grade] || '#C9A84C')}55`,
        color: GRADE_COLORS[grade] || '#C9A84C',
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
          <span style={{ fontSize: '0.875rem', color: isFound ? '#F5F0E8' : '#888' }}>{platform.platform}</span>
          <div
            style={{ position: 'relative', cursor: 'help' }}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          >
            <span style={{ fontSize: '0.7rem', color: '#555', border: '1px solid #333', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>?</span>
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
                width: '240px',
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
          <span style={{ fontSize: '0.75rem', color: '#555' }}>{platform.promptsMentioned}/{platform.promptsTested} prompts</span>
          <span style={{ fontSize: '0.7rem', color: isFound ? '#C9A84C' : '#444', letterSpacing: '0.05em' }}>
            {isFound ? 'Visible' : 'Not found'}
          </span>
        </div>
      </div>
      <div style={{ height: '4px', background: '#222', borderRadius: '2px' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isFound ? '#C9A84C' : '#2a2a2a',
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
        <span style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          AI Report Assistant
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
            <div style={{ padding: '0.625rem 0.875rem', background: '#161616', border: '1px solid #222', color: '#555', fontSize: '0.85rem' }}>
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
            color: input.trim() && !chatLoading ? '#0A0A0A' : '#555',
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

  const handleSignOut = () => {
    document.cookie = '__presenzia_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  const handleDownloadReport = (jobId: string) => {
    window.open(`/api/client/download?jobId=${jobId}`, '_blank');
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
        <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none' }}>
              presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
            </Link>
            <div style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {client.business_name || client.email}
              <span style={{ padding: '2px 8px', background: '#1a1a1a', border: '1px solid #222', fontSize: '0.65rem', color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starter</span>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#666', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
            Sign out
          </button>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>

          {/* Report repository */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Report library</div>
                <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', color: '#F5F0E8', fontWeight: 600 }}>Your AI visibility reports</h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#555' }}>{completedReports.length} report{completedReports.length !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ border: '1px solid #111' }}>
              {completedReports.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>
                  {pendingJob
                    ? 'Your first report is being prepared — check back shortly.'
                    : 'Your first report will arrive by email once your audit is complete.'}
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
                          <span style={{ fontSize: '0.6rem', padding: '2px 8px', background: '#1a1400', border: '1px solid #3a2e00', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest</span>
                        )}
                      </div>
                      {report.overall_score !== null && report.grade && (
                        <div style={{ fontSize: '0.75rem', color: '#555' }}>
                          Score: <span style={{ color: '#C9A84C' }}>{report.overall_score}/100</span> · Grade {report.grade}
                        </div>
                      )}
                    </div>
                    {report.report_path ? (
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C9A84C'; (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.borderColor = '#333'; }}
                      >
                        ↓ Download PDF
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#444' }}>Processing…</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upgrade banner */}
          <div style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem', background: '#0a0a00', border: '1px solid #2a2000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#C9A84C', fontWeight: 600, marginBottom: '2px' }}>Want a live dashboard?</div>
              <div style={{ fontSize: '0.8rem', color: '#777' }}>See your scores online, track progress month by month, and get weekly updates.</div>
            </div>
            <Link href="/#pricing" style={{ fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid #C9A84C44', padding: '0.4rem 1rem' }}>
              View Growth plan →
            </Link>
          </div>

          <div style={{ padding: '1rem 1.5rem', background: '#0a000a', border: '1px solid #1a001a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#9b6bcc', fontWeight: 600, marginBottom: '2px' }}>Want AI-powered guidance?</div>
              <div style={{ fontSize: '0.8rem', color: '#777' }}>Ask an AI expert questions about your report — what the scores mean and exactly what to do next.</div>
            </div>
            <Link href="/#pricing" style={{ fontSize: '0.8rem', color: '#9b6bcc', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid #9b6bcc44', padding: '0.4rem 1rem' }}>
              View Growth & Premium →
            </Link>
          </div>

          <p style={{ textAlign: 'center', color: '#333', fontSize: '0.75rem', marginTop: '2.5rem' }}>
            Questions about upgrading? <a href="mailto:hello@presenzia.ai" style={{ color: '#555', textDecoration: 'none' }}>hello@presenzia.ai</a>
          </p>
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
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none' }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
          {client && (
            <div style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {client.business_name || client.email}
              <span style={{ padding: '2px 8px', background: '#1a1a1a', border: '1px solid #222', fontSize: '0.65rem', color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {PLAN_LABELS[client.plan] || client.plan}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: '1px solid #2a2a2a', color: '#666', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
        >
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>

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
            { key: 'report', label: 'Latest Report' },
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
                color: activeTab === tab.key ? '#F5F0E8' : '#555',
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
                {pendingJob ? 'Your first audit is running…' : 'Your report is on its way'}
              </div>
              <p style={{ color: '#777', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
                {pendingJob
                  ? 'Your AI visibility audit is processing. Results will appear here automatically.'
                  : 'Your first report will be ready shortly. Check back in a few minutes or look for an email from us.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

              {/* Left column: Score + Platforms + Summary + Download */}
              <div>
                <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1.75rem', marginBottom: '1.25rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>presenzia.ai</div>
                      <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1rem', color: '#F5F0E8' }}>AI Visibility Report</div>
                      {latestJob.completed_at && (
                        <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '3px' }}>
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
                      <div style={{ fontSize: '0.6rem', color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                        Platform breakdown
                        <span style={{ color: '#444', marginLeft: '0.5rem', textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem' }}>(hover ? for details)</span>
                      </div>
                      {platforms.map(p => <PlatformBar key={p.platform} platform={p} />)}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {latestJob.summary && (
                  <div style={{ padding: '1.25rem', background: '#0D0D0D', border: '1px solid #1a1a1a', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Summary</div>
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
                    ↓ Download PDF report
                  </button>
                )}
              </div>

              {/* Right column: Competitors + Chat */}
              <div>
                {/* Competitors */}
                {competitors.length > 0 && (
                  <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                      Competitors appearing instead of you
                    </div>
                    {competitors.slice(0, 5).map((comp, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < Math.min(4, competitors.length - 1) ? '1px solid #111' : 'none', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#CCCCCC' }}>{comp.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#555' }}>{comp.count} mention{comp.count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat */}
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
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
              <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>No reports yet.</div>
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
                        <span style={{ fontSize: '0.6rem', padding: '2px 8px', background: '#1a1400', border: '1px solid #3a2e00', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Latest
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>
                      {report.status === 'completed' ? 'Completed' : report.status === 'running' ? 'Running…' : report.status === 'pending' ? 'Queued' : 'Failed'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {report.overall_score !== null && report.grade && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', color: '#C9A84C', fontWeight: 700, lineHeight: 1 }}>{report.overall_score}</div>
                        <div style={{ fontSize: '0.65rem', color: '#555' }}>/ 100 · Grade {report.grade}</div>
                      </div>
                    )}
                    {report.report_path && (
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        style={{ background: 'none', border: '1px solid #333', color: '#777', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C9A84C'; (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#777'; (e.currentTarget as HTMLElement).style.borderColor = '#333'; }}
                      >
                        ↓ PDF
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
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Ask anything about your results — what the scores mean, how competitors are outranking you, and exactly what to do to improve.
              </p>
              <ChatPane jobId={latestJob.id} businessName={client?.business_name || ''} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
              Chat will be available once your first report is ready.
            </div>
          )
        )}
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
