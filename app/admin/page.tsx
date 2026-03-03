'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── Interfaces ─── */

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insights_json: any | null;
  completed_at: string | null;
  created_at: string;
  error: string | null;
  report_path: string | null;
}

interface Rating {
  rating: number;
  comment: string | null;
  created_at: string;
  audit_job_id: string;
}

interface CampaignEmail {
  campaign_key: string;
  sent_at: string;
}

interface Client {
  id: string;
  email: string;
  plan: string;
  status: string;
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  website: string | null;
  keywords: string[] | null;
  description: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  pending_plan_change: string | null;
  pending_change_date: string | null;
  marketing_suppressed: boolean | null;
  last_retention_offer_at: string | null;
  created_at: string;
  updated_at: string;
  audit_jobs: AuditJob[];
  latest_rating: number | null;
  latest_comment: string | null;
  all_ratings: Rating[];
  campaign_emails: CampaignEmail[];
}

interface Lead {
  id: string;
  email: string | null;
  contact_name: string | null;
  business_name: string;
  business_type: string;
  location: string;
  website: string | null;
  keywords: string[] | null;
  plan: string;
  converted_at: string | null;
  converted_to_audit: boolean | null;
  converted_to_retainer: boolean | null;
  email_sequence_started: boolean | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface FreeScore {
  id: string;
  firm_name: string;
  postcode: string | null;
  city: string | null;
  region: string | null;
  specialty: string | null;
  email: string | null;
  contact_name: string | null;
  score: number;
  grade: string;
  top_competitor_name: string | null;
  top_competitor_count: number | null;
  share_id: string;
  converted_to_audit: boolean | null;
  converted_to_retainer: boolean | null;
  email_sequence_started: boolean | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

/* ─── Constants ─── */

const PLAN_COLORS: Record<string, string> = {
  audit: '#3a7d44',
  starter: '#3a7d44',
  growth: '#1a6fa8',
  premium: '#9b6b00',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#3a7d44',
  trialing: '#1a8fa8',
  past_due: '#9b4a00',
  cancelled: '#555',
};

/* ─── Helpers ─── */

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: '0.68rem',
      padding: '2px 8px',
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function TrialBadge() {
  return (
    <span style={{
      fontSize: '0.68rem',
      padding: '2px 8px',
      background: 'rgba(26,143,168,0.15)',
      color: '#1a8fa8',
      border: '1px solid rgba(26,143,168,0.4)',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      animation: 'trialPulse 2s infinite',
    }}>
      Free trial
    </span>
  );
}

/* ─── Export to CSV/Excel ─── */

function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  };
  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportClients(clients: Client[]) {
  const headers = ['Business Name', 'Email', 'Plan', 'Status', 'Location', 'Website', 'Keywords', 'Latest Score', 'Grade', 'Rating', 'Comment', 'Audits', 'Joined'];
  const rows = clients.map(c => {
    const latest = c.audit_jobs?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return [
      c.business_name || '',
      c.email,
      c.plan,
      c.status,
      c.location || '',
      c.website || '',
      (c.keywords || []).join('; '),
      latest?.overall_score?.toString() || '',
      latest?.grade || '',
      c.latest_rating?.toString() || '',
      c.latest_comment || '',
      c.audit_jobs?.length?.toString() || '0',
      fmt(c.created_at),
    ];
  });
  exportToCSV('presenzia-clients', headers, rows);
}

function exportLeads(leads: Lead[]) {
  const headers = ['Business Name', 'Contact', 'Email', 'Type', 'Location', 'Website', 'Plan Intent', 'Converted', 'Email Sequence', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Date'];
  const rows = leads.map(l => [
    l.business_name,
    l.contact_name || '',
    l.email || '',
    l.business_type,
    l.location,
    l.website || '',
    l.plan,
    l.converted_at ? 'Yes' : 'No',
    l.email_sequence_started ? 'Yes' : 'No',
    l.utm_source || '',
    l.utm_medium || '',
    l.utm_campaign || '',
    fmt(l.created_at),
  ]);
  exportToCSV('presenzia-leads', headers, rows);
}

function exportFreeScores(scores: FreeScore[]) {
  const headers = ['Firm Name', 'Email', 'Contact', 'City', 'Region', 'Specialty', 'Score', 'Grade', 'Top Competitor', 'Converted to Audit', 'Converted to Retainer', 'UTM Source', 'Date'];
  const rows = scores.map(s => [
    s.firm_name,
    s.email || '',
    s.contact_name || '',
    s.city || '',
    s.region || '',
    s.specialty || '',
    s.score.toString(),
    s.grade,
    s.top_competitor_name || '',
    s.converted_to_audit ? 'Yes' : 'No',
    s.converted_to_retainer ? 'Yes' : 'No',
    s.utm_source || '',
    fmt(s.created_at),
  ]);
  exportToCSV('presenzia-free-scores', headers, rows);
}

/* ─── Detail Modal ─── */

function DetailModal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(520px, 90vw)',
          height: '100vh',
          background: '#0D0D0D',
          borderLeft: '1px solid #1a1a1a',
          overflowY: 'auto',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          fontFamily: 'var(--font-inter, Inter, sans-serif)',
          color: '#F5F0E8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase' }}>Details</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}
          >
            &#10005;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === '') return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #111', fontSize: '0.82rem' }}>
      <span style={{ color: '#666', minWidth: '100px', flexShrink: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: '2px' }}>{label}</span>
      <span style={{ color: '#CCCCCC', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
      {title}{count != null ? ` (${count})` : ''}
    </div>
  );
}

function PlatformScoreBar({ platform }: { platform: PlatformScore }) {
  const barColor = platform.score >= 70 ? '#3a7d44' : platform.score >= 40 ? '#C9A84C' : '#9b1a1a';
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
        <span style={{ fontSize: '0.78rem', color: '#CCC' }}>{platform.platform}</span>
        <span style={{ fontSize: '0.72rem', color: barColor, fontWeight: 600 }}>{platform.score}/100</span>
      </div>
      <div style={{ height: '4px', background: '#1a1a1a', width: '100%' }}>
        <div style={{ height: '4px', background: barColor, width: `${platform.score}%`, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: '0.68rem', color: '#666', marginTop: '2px' }}>
        {platform.promptsMentioned}/{platform.promptsTested} prompts · {platform.avgPosition != null ? `avg pos ${platform.avgPosition.toFixed(1)}` : 'no position data'}
      </div>
    </div>
  );
}

function ScoreTrend({ jobs }: { jobs: AuditJob[] }) {
  const completed = jobs.filter(j => j.status === 'completed' && j.overall_score != null).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (completed.length < 2) return null;

  const maxScore = 100;
  const latest = completed[completed.length - 1].overall_score!;
  const previous = completed[completed.length - 2].overall_score!;
  const diff = latest - previous;
  const trend = diff > 0 ? `+${diff}` : `${diff}`;
  const trendColor = diff > 0 ? '#3a7d44' : diff < 0 ? '#cc4444' : '#888';

  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionHeader title="Score Trend" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>{latest}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: trendColor }}>{trend} pts</span>
        <span style={{ fontSize: '0.72rem', color: '#666' }}>from {previous}</span>
      </div>
      {/* Mini sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
        {completed.map((j, i) => {
          const h = Math.max(4, (j.overall_score! / maxScore) * 32);
          const isLatest = i === completed.length - 1;
          return (
            <div
              key={j.id}
              title={`${j.overall_score}/100 — ${j.completed_at ? fmt(j.completed_at) : fmt(j.created_at)}`}
              style={{
                width: Math.max(6, Math.floor(120 / completed.length)),
                height: `${h}px`,
                background: isLatest ? '#C9A84C' : '#333',
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const CAMPAIGN_LABELS: Record<string, string> = {
  'free_score_nurture': 'Free Score Nurture',
  'post_audit_rating_request': 'Post-Audit Rating Request',
  'happy_customer_referral': 'Happy Customer Referral',
  'dissatisfied_followup': 'Dissatisfied Follow-up',
  'win_back': 'Win-Back',
};

function ClientDetail({ client, onRetry, retrying }: { client: Client; onRetry: (id: string) => void; retrying: string | null }) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const sortedJobs = [...(client.audit_jobs || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        {client.business_name || 'Unnamed Client'}
      </h2>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Badge label={client.plan} color={PLAN_COLORS[client.plan] || '#555'} />
        {client.status === 'trialing' ? <TrialBadge /> : <Badge label={client.status} color={STATUS_COLORS[client.status] || '#555'} />}
        {client.pending_plan_change && (
          <Badge label={`Pending: ${client.pending_plan_change}`} color="#9b4a00" />
        )}
        {client.marketing_suppressed && (
          <Badge label="Marketing suppressed" color="#cc4444" />
        )}
      </div>

      {/* ── Business Information ── */}
      <div style={{ marginBottom: '1rem' }}>
        <DetailRow label="Email" value={<a href={`mailto:${client.email}`} style={{ color: '#C9A84C', textDecoration: 'none' }}>{client.email}</a>} />
        <DetailRow label="Type" value={client.business_type} />
        <DetailRow label="Location" value={client.location} />
        <DetailRow label="Website" value={client.website ? <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none' }}>{client.website}</a> : null} />
        <DetailRow label="Keywords" value={client.keywords?.length ? client.keywords.join(', ') : null} />
        <DetailRow label="Description" value={client.description} />
        <DetailRow label="Stripe Cust." value={client.stripe_customer_id ? <a href={`https://dashboard.stripe.com/customers/${client.stripe_customer_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: '0.75rem' }}>{client.stripe_customer_id}</a> : null} />
        <DetailRow label="Stripe Sub." value={client.stripe_subscription_id ? <a href={`https://dashboard.stripe.com/subscriptions/${client.stripe_subscription_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: '0.75rem' }}>{client.stripe_subscription_id}</a> : null} />
        <DetailRow label="Joined" value={fmt(client.created_at)} />
        <DetailRow label="Updated" value={fmt(client.updated_at)} />
        {client.pending_plan_change && (
          <DetailRow label="Pending" value={`${client.pending_plan_change} on ${client.pending_change_date ? fmt(client.pending_change_date) : 'end of cycle'}`} />
        )}
        {client.last_retention_offer_at && (
          <DetailRow label="Last offer" value={fmt(client.last_retention_offer_at)} />
        )}
      </div>

      {/* ── Score Trend ── */}
      <ScoreTrend jobs={sortedJobs} />

      {/* ── Latest Audit Summary ── */}
      {sortedJobs[0]?.status === 'completed' && sortedJobs[0]?.summary && (
        <div style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Latest Audit Summary" />
          <p style={{ fontSize: '0.82rem', color: '#AAA', lineHeight: 1.6, margin: 0 }}>
            {sortedJobs[0].summary}
          </p>
        </div>
      )}

      {/* ── Platform Scores (latest completed audit) ── */}
      {sortedJobs[0]?.status === 'completed' && sortedJobs[0]?.platforms_json && sortedJobs[0].platforms_json.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Platform Scores" />
          {sortedJobs[0].platforms_json.map(p => (
            <PlatformScoreBar key={p.platform} platform={p} />
          ))}
        </div>
      )}

      {/* ── Competitors (latest completed audit) ── */}
      {sortedJobs[0]?.status === 'completed' && sortedJobs[0]?.competitors_json && sortedJobs[0].competitors_json.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Top Competitors" count={sortedJobs[0].competitors_json.length} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {sortedJobs[0].competitors_json.slice(0, 10).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px solid #111' }}>
                <span style={{ color: '#CCC' }}>{c.name}</span>
                <span style={{ color: '#888', fontSize: '0.72rem' }}>{c.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Insights (latest completed audit) ── */}
      {sortedJobs[0]?.status === 'completed' && sortedJobs[0]?.insights_json && (
        <div style={{ marginBottom: '1rem' }}>
          <SectionHeader title="AI Insights" />
          <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            {sortedJobs[0].insights_json.strengths?.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#3a7d44', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Strengths</span>
                {sortedJobs[0].insights_json.strengths.map((s: string, i: number) => (
                  <div key={i} style={{ color: '#AAA', paddingLeft: '0.5rem' }}>• {s}</div>
                ))}
              </div>
            )}
            {sortedJobs[0].insights_json.weaknesses?.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#cc4444', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Weaknesses</span>
                {sortedJobs[0].insights_json.weaknesses.map((w: string, i: number) => (
                  <div key={i} style={{ color: '#AAA', paddingLeft: '0.5rem' }}>• {w}</div>
                ))}
              </div>
            )}
            {sortedJobs[0].insights_json.recommendations?.length > 0 && (
              <div>
                <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Recommendations</span>
                {sortedJobs[0].insights_json.recommendations.map((r: string, i: number) => (
                  <div key={i} style={{ color: '#AAA', paddingLeft: '0.5rem' }}>• {r}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ratings History ── */}
      {client.all_ratings && client.all_ratings.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Ratings" count={client.all_ratings.length} />
          {client.all_ratings.map((r, i) => (
            <div key={i} style={{ padding: '0.5rem', background: i === 0 ? '#111' : 'transparent', border: '1px solid #1a1a1a', marginBottom: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: r.rating >= 4 ? '#3a7d44' : r.rating === 3 ? '#C9A84C' : '#cc4444', fontSize: '0.9rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.75rem' }}>{r.rating}/5</span>
                  {i === 0 && <span style={{ fontSize: '0.6rem', color: '#C9A84C', fontWeight: 600 }}>LATEST</span>}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#666' }}>{fmt(r.created_at)}</span>
              </div>
              {r.comment && (
                <p style={{ fontSize: '0.78rem', color: '#999', fontStyle: 'italic', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Audit History (expandable) ── */}
      <div>
        <SectionHeader title="Audit History" count={sortedJobs.length} />
        {sortedJobs.length === 0 ? (
          <div style={{ color: '#888', fontSize: '0.82rem' }}>No audits yet</div>
        ) : sortedJobs.map((job, i) => (
          <div key={job.id} style={{
            padding: '0.75rem',
            background: i === 0 ? '#111' : 'transparent',
            border: '1px solid #1a1a1a',
            marginBottom: '0.5rem',
            cursor: job.status === 'completed' ? 'pointer' : 'default',
          }}
            onClick={() => job.status === 'completed' && setExpandedJob(expandedJob === job.id ? null : job.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {i === 0 && <span style={{ fontSize: '0.6rem', color: '#C9A84C', fontWeight: 600 }}>LATEST</span>}
                <Badge
                  label={job.status}
                  color={job.status === 'completed' ? '#3a7d44' : job.status === 'running' ? '#C9A84C' : job.status === 'failed' ? '#9b1a1a' : '#555'}
                />
                {job.status === 'completed' && (
                  <span style={{ fontSize: '0.6rem', color: '#666' }}>{expandedJob === job.id ? '▼' : '▶'}</span>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#888' }}>{job.completed_at ? fmt(job.completed_at) : fmt(job.created_at)}</span>
            </div>
            {job.overall_score != null && (
              <div style={{ fontSize: '0.82rem', color: '#F5F0E8', marginTop: '0.25rem' }}>
                Score: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{job.overall_score}/100</span> (Grade {job.grade})
              </div>
            )}
            {job.error && (
              <div style={{ fontSize: '0.72rem', color: '#cc4444', marginTop: '0.25rem' }}>Error: {job.error}</div>
            )}

            {/* Expanded details */}
            {expandedJob === job.id && job.status === 'completed' && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #222' }}>
                {job.summary && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase' }}>Summary</span>
                    <p style={{ fontSize: '0.78rem', color: '#AAA', margin: '0.2rem 0 0', lineHeight: 1.5 }}>{job.summary}</p>
                  </div>
                )}
                {job.platforms_json && job.platforms_json.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase' }}>Platforms</span>
                    <div style={{ marginTop: '0.3rem' }}>
                      {job.platforms_json.map(p => (
                        <div key={p.platform} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.15rem 0' }}>
                          <span style={{ color: '#CCC' }}>{p.platform}</span>
                          <span style={{ color: p.score >= 70 ? '#3a7d44' : p.score >= 40 ? '#C9A84C' : '#9b1a1a', fontWeight: 600 }}>{p.score}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {job.competitors_json && job.competitors_json.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase' }}>Competitors</span>
                    <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: '#AAA' }}>
                      {job.competitors_json.map(c => c.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              {job.status === 'failed' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRetry(job.id); }}
                  disabled={retrying === job.id}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'none', border: '1px solid #555', color: '#999', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {retrying === job.id ? 'Retrying...' : 'Retry'}
                </button>
              )}
              {job.report_path && (
                <a
                  href={`/api/client/download?job_id=${job.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', border: '1px solid #333', color: '#888', textDecoration: 'none', fontFamily: 'inherit' }}
                >
                  PDF
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Campaign Emails ── */}
      {client.campaign_emails && client.campaign_emails.length > 0 && (
        <div>
          <SectionHeader title="Campaign Emails Sent" count={client.campaign_emails.length} />
          {client.campaign_emails.map((ce, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0', borderBottom: '1px solid #111' }}>
              <span style={{ color: '#CCC' }}>{CAMPAIGN_LABELS[ce.campaign_key] || ce.campaign_key}</span>
              <span style={{ fontSize: '0.68rem', color: '#666' }}>{fmt(ce.sent_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        {lead.business_name}
      </h2>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Badge label={lead.plan} color={PLAN_COLORS[lead.plan] || '#555'} />
        <Badge
          label={lead.converted_at ? 'Converted' : 'Dropped off'}
          color={lead.converted_at ? '#3a7d44' : '#9b4a00'}
        />
        {lead.email_sequence_started && <Badge label="Email seq. started" color="#1a6fa8" />}
      </div>

      <DetailRow label="Contact" value={lead.contact_name} />
      <DetailRow label="Email" value={lead.email ? <a href={`mailto:${lead.email}`} style={{ color: '#C9A84C', textDecoration: 'none' }}>{lead.email}</a> : null} />
      <DetailRow label="Type" value={lead.business_type} />
      <DetailRow label="Location" value={lead.location} />
      <DetailRow label="Website" value={lead.website ? <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none' }}>{lead.website}</a> : null} />
      <DetailRow label="Keywords" value={lead.keywords?.length ? lead.keywords.join(', ') : null} />
      <DetailRow label="Plan intent" value={lead.plan} />
      {lead.converted_at && <DetailRow label="Converted" value={fmt(lead.converted_at)} />}
      {lead.converted_to_audit && <DetailRow label="Conv. to audit" value="Yes" />}
      {lead.converted_to_retainer && <DetailRow label="Conv. to retainer" value="Yes" />}
      <DetailRow label="Created" value={fmt(lead.created_at)} />

      {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>UTM Tracking</div>
          <DetailRow label="Source" value={lead.utm_source} />
          <DetailRow label="Medium" value={lead.utm_medium} />
          <DetailRow label="Campaign" value={lead.utm_campaign} />
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#111', border: '1px solid #1a1a1a', fontSize: '0.75rem', color: '#666' }}>
        Email history and replies will be available once Resend webhook tracking is configured.
      </div>
    </div>
  );
}

function FreeScoreDetail({ score }: { score: FreeScore }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        {score.firm_name}
      </h2>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Badge label={`Score: ${score.score}`} color={score.score >= 50 ? '#3a7d44' : score.score >= 25 ? '#C9A84C' : '#cc4444'} />
        <Badge label={`Grade ${score.grade}`} color={score.grade === 'A' || score.grade === 'B' ? '#3a7d44' : score.grade === 'C' ? '#C9A84C' : '#cc4444'} />
        {score.converted_to_audit && <Badge label="Converted" color="#3a7d44" />}
        {score.email && !score.converted_to_audit && <Badge label="Has email" color="#1a6fa8" />}
        {!score.email && <Badge label="No email" color="#555" />}
      </div>

      <DetailRow label="Email" value={score.email ? <a href={`mailto:${score.email}`} style={{ color: '#C9A84C', textDecoration: 'none' }}>{score.email}</a> : null} />
      <DetailRow label="Contact" value={score.contact_name} />
      <DetailRow label="City" value={score.city} />
      <DetailRow label="Region" value={score.region} />
      <DetailRow label="Postcode" value={score.postcode} />
      <DetailRow label="Specialty" value={score.specialty} />
      <DetailRow label="Score" value={<span style={{ color: '#C9A84C', fontWeight: 600 }}>{score.score}/100 (Grade {score.grade})</span>} />
      {score.top_competitor_name && (
        <DetailRow label="Top competitor" value={`${score.top_competitor_name} (${score.top_competitor_count} mentions)`} />
      )}
      <DetailRow label="Share link" value={<a href={`/score/${score.share_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none' }}>/score/{score.share_id}</a>} />
      <DetailRow label="Created" value={fmt(score.created_at)} />

      {score.email_sequence_started && <DetailRow label="Email seq." value="Started" />}

      {(score.utm_source || score.utm_medium || score.utm_campaign) && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>UTM Tracking</div>
          <DetailRow label="Source" value={score.utm_source} />
          <DetailRow label="Medium" value={score.utm_medium} />
          <DetailRow label="Campaign" value={score.utm_campaign} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'clients' | 'leads' | 'scores'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scores, setScores] = useState<FreeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);

  // Detail modal state
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [detailScore, setDetailScore] = useState<FreeScore | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, lRes, sRes] = await Promise.all([
          fetch('/api/admin/clients'),
          fetch('/api/admin/leads'),
          fetch('/api/admin/free-scores'),
        ]);

        if (cRes.status === 401 || lRes.status === 401 || sRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        const [cData, lData, sData] = await Promise.all([
          cRes.json(),
          lRes.json(),
          sRes.json(),
        ]);

        setClients(cData.clients || []);
        setLeads(lData.leads || []);
        setScores(sData.scores || []);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/signout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleRetryAudit = useCallback(async (jobId: string) => {
    setRetrying(jobId);
    try {
      await fetch('/api/admin/retry-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setRetrying(null);
    }
  }, []);

  const closeDetail = () => {
    setDetailClient(null);
    setDetailLead(null);
    setDetailScore(null);
  };

  const handleExport = () => {
    if (tab === 'clients') exportClients(clients);
    else if (tab === 'leads') exportLeads(leads);
    else exportFreeScores(scores);
  };

  /* Stats */
  const activeClients = clients.filter(c => c.status === 'active').length;
  const trialingClients = clients.filter(c => c.status === 'trialing').length;
  const unconvertedLeads = leads.filter(l => !l.converted_at).length;
  const pendingAudits = clients.flatMap(c => c.audit_jobs).filter(j => j.status === 'pending' || j.status === 'running').length;
  const freeScoresWithEmail = scores.filter(s => s.email).length;

  /* Styles */
  const s = {
    page: { minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' } as React.CSSProperties,
    nav: { borderBottom: '1px solid #1A1A1A', padding: '1rem clamp(1rem, 3vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
    brand: { fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none' } as React.CSSProperties,
    main: { maxWidth: '1400px', margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem)' } as React.CSSProperties,
    stat: { background: '#111', border: '1px solid #1a1a1a', padding: '1rem 1.25rem' } as React.CSSProperties,
    statNum: { fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#C9A84C', lineHeight: 1 } as React.CSSProperties,
    statLabel: { fontSize: '0.7rem', color: '#999', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' } as React.CSSProperties,
    tabs: { display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '1rem' } as React.CSSProperties,
    tab: (active: boolean): React.CSSProperties => ({
      padding: '0.6rem 1.25rem',
      background: 'none',
      border: 'none',
      borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
      color: active ? '#F5F0E8' : '#888',
      fontFamily: 'inherit',
      fontSize: '0.85rem',
      cursor: 'pointer',
      fontWeight: active ? 600 : 400,
    }),
    table: { width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
    th: { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.65rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' } as React.CSSProperties,
    td: { padding: '0.75rem', borderBottom: '1px solid #111', fontSize: '0.8rem', color: '#CCCCCC', verticalAlign: 'top' } as React.CSSProperties,
    viewBtn: { fontSize: '0.7rem', padding: '3px 10px', background: 'none', border: '1px solid #333', color: '#888', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      <style>{`
        .admin-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-bottom: 2rem; }
        .admin-table-desktop { display: block; }
        .admin-cards-mobile { display: none; }
        @media (max-width: 768px) {
          .admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-table-desktop { display: none !important; }
          .admin-cards-mobile { display: block !important; }
        }
        @keyframes trialPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .admin-view-btn:hover { border-color: #C9A84C !important; color: #C9A84C !important; }
        .admin-export-btn:hover { background: #C9A84C !important; color: #0A0A0A !important; }
        .admin-row:hover { background: #0D0D0D; }
      `}</style>

      {/* Detail modals */}
      {detailClient && (
        <DetailModal onClose={closeDetail}>
          <ClientDetail client={detailClient} onRetry={handleRetryAudit} retrying={retrying} />
        </DetailModal>
      )}
      {detailLead && (
        <DetailModal onClose={closeDetail}>
          <LeadDetail lead={detailLead} />
        </DetailModal>
      )}
      {detailScore && (
        <DetailModal onClose={closeDetail}>
          <FreeScoreDetail score={detailScore} />
        </DetailModal>
      )}

      <div style={s.nav}>
        <Link href="/" style={s.brand}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          <span style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginLeft: '12px' }}>admin</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #555', color: '#999', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
        >
          Sign out
        </button>
      </div>

      <div style={s.main}>
        {error && (
          <div style={{ padding: '1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', marginBottom: '2rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="admin-stats">
          <div style={s.stat}>
            <div style={s.statNum}>{clients.length}</div>
            <div style={s.statLabel}>Total clients</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{activeClients}</div>
            <div style={s.statLabel}>Active subs</div>
          </div>
          <div style={s.stat}>
            <div style={{ ...s.statNum, color: trialingClients > 0 ? '#1a8fa8' : '#C9A84C' }}>{trialingClients}</div>
            <div style={s.statLabel}>Free trials</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{freeScoresWithEmail}</div>
            <div style={s.statLabel}>Score leads</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{pendingAudits}</div>
            <div style={s.statLabel}>Audits running</div>
          </div>
        </div>

        {/* Tabs + Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={s.tabs}>
            <button style={s.tab(tab === 'clients')} onClick={() => setTab('clients')}>
              Clients ({clients.length})
            </button>
            <button style={s.tab(tab === 'leads')} onClick={() => setTab('leads')}>
              Leads ({unconvertedLeads} unconverted)
            </button>
            <button style={s.tab(tab === 'scores')} onClick={() => setTab('scores')}>
              Free Scores ({scores.length})
            </button>
          </div>
          <button
            className="admin-export-btn"
            onClick={handleExport}
            style={{
              background: 'none',
              border: '1px solid #333',
              color: '#999',
              padding: '0.4rem 1rem',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '1rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Export to CSV
          </button>
        </div>

        {loading ? (
          <div style={{ color: '#888', padding: '3rem', textAlign: 'center' }}>Loading...</div>
        ) : tab === 'clients' ? (
          <>
            {/* Desktop table */}
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Business</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Plan</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Score</th>
                    <th style={s.th}>Audits</th>
                    <th style={s.th}>Rating</th>
                    <th style={s.th}>Joined</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#888', padding: '3rem' }}>No clients yet</td></tr>
                  ) : clients.map(client => {
                    const latestJob = client.audit_jobs
                      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                    return (
                      <tr key={client.id} className="admin-row" style={{ cursor: 'pointer' }} onClick={() => setDetailClient(client)}>
                        <td style={s.td}>
                          <div style={{ color: '#F5F0E8', fontWeight: 500 }}>{client.business_name || '(unnamed)'}</div>
                          {client.location && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>{client.location}</div>}
                          {client.website && <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '1px' }}>{client.website}</div>}
                        </td>
                        <td style={s.td}>
                          <a href={`mailto:${client.email}`} style={{ color: '#888', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{client.email}</a>
                        </td>
                        <td style={s.td}>
                          <Badge label={client.plan} color={PLAN_COLORS[client.plan] || '#555'} />
                        </td>
                        <td style={s.td}>
                          {client.status === 'trialing' ? <TrialBadge /> : <Badge label={client.status} color={STATUS_COLORS[client.status] || '#555'} />}
                        </td>
                        <td style={s.td}>
                          {latestJob?.overall_score != null ? (
                            <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '0.82rem' }}>
                              {latestJob.overall_score}<span style={{ color: '#888', fontWeight: 400 }}>/100 ({latestJob.grade})</span>
                            </span>
                          ) : latestJob?.status === 'running' ? (
                            <Badge label="Running" color="#C9A84C" />
                          ) : latestJob?.status === 'failed' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Badge label="Failed" color="#9b1a1a" />
                              <button
                                onClick={e => { e.stopPropagation(); handleRetryAudit(latestJob.id); }}
                                disabled={retrying === latestJob.id}
                                style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'none', border: '1px solid #555', color: '#999', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {retrying === latestJob.id ? '...' : 'Retry'}
                              </button>
                            </div>
                          ) : <span style={{ color: '#888' }}>-</span>}
                        </td>
                        <td style={{ ...s.td, color: '#888' }}>
                          {client.audit_jobs?.length || 0}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {client.latest_rating != null ? (
                              <span style={{ color: client.latest_rating >= 4 ? '#3a7d44' : client.latest_rating === 3 ? '#C9A84C' : '#cc4444', fontWeight: 600 }}>
                                {'★'.repeat(client.latest_rating)} {client.latest_rating}/5
                              </span>
                            ) : <span style={{ color: '#888' }}>-</span>}
                            {client.marketing_suppressed && (
                              <span title="Marketing suppressed (dissatisfied)" style={{ fontSize: '0.6rem', background: 'rgba(204,68,68,0.15)', color: '#cc4444', padding: '1px 5px', borderRadius: '2px', fontWeight: 600, letterSpacing: '0.03em' }}>
                                FLAGGED
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...s.td, color: '#888', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {fmt(client.created_at)}
                        </td>
                        <td style={s.td}>
                          <button
                            className="admin-view-btn"
                            onClick={e => { e.stopPropagation(); setDetailClient(client); }}
                            style={s.viewBtn}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="admin-cards-mobile">
              {clients.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>No clients yet</div>
              ) : clients.map(client => {
                const latestJob = client.audit_jobs?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                return (
                  <div key={client.id} style={{ padding: '1rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setDetailClient(client)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ color: '#F5F0E8', fontWeight: 500, fontSize: '0.9rem' }}>{client.business_name || '(unnamed)'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{client.email}</div>
                      </div>
                      <button className="admin-view-btn" onClick={e => { e.stopPropagation(); setDetailClient(client); }} style={s.viewBtn}>View</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge label={client.plan} color={PLAN_COLORS[client.plan] || '#555'} />
                      {client.status === 'trialing' ? <TrialBadge /> : <Badge label={client.status} color={STATUS_COLORS[client.status] || '#555'} />}
                      {latestJob?.overall_score != null && <span style={{ fontSize: '0.75rem', color: '#C9A84C', fontWeight: 600 }}>{latestJob.overall_score}/100</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : tab === 'leads' ? (
          <>
            {/* Desktop table */}
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Business</th>
                    <th style={s.th}>Contact</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Plan intent</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Source</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#888', padding: '3rem' }}>No leads yet</td></tr>
                  ) : leads.map(lead => (
                    <tr key={lead.id} className="admin-row" style={{ cursor: 'pointer' }} onClick={() => setDetailLead(lead)}>
                      <td style={s.td}>
                        <div style={{ color: '#F5F0E8', fontWeight: 500 }}>{lead.business_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>{lead.business_type}</div>
                      </td>
                      <td style={{ ...s.td, color: '#999' }}>{lead.contact_name || '-'}</td>
                      <td style={s.td}>
                        {lead.email
                          ? <a href={`mailto:${lead.email}`} style={{ color: '#999', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{lead.email}</a>
                          : <span style={{ color: '#888' }}>-</span>
                        }
                      </td>
                      <td style={s.td}>
                        <Badge label={lead.plan} color={PLAN_COLORS[lead.plan] || '#555'} />
                      </td>
                      <td style={{ ...s.td, color: '#999' }}>{lead.location}</td>
                      <td style={s.td}>
                        <Badge
                          label={lead.converted_at ? 'Converted' : 'Dropped off'}
                          color={lead.converted_at ? '#3a7d44' : '#9b4a00'}
                        />
                      </td>
                      <td style={{ ...s.td, color: '#888', fontSize: '0.72rem' }}>{lead.utm_source || '-'}</td>
                      <td style={{ ...s.td, color: '#888', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {fmt(lead.created_at)}
                      </td>
                      <td style={s.td}>
                        <button
                          className="admin-view-btn"
                          onClick={e => { e.stopPropagation(); setDetailLead(lead); }}
                          style={s.viewBtn}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="admin-cards-mobile">
              {leads.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>No leads yet</div>
              ) : leads.map(lead => (
                <div key={lead.id} style={{ padding: '1rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setDetailLead(lead)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ color: '#F5F0E8', fontWeight: 500, fontSize: '0.9rem' }}>{lead.business_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{lead.email || 'No email'}</div>
                    </div>
                    <button className="admin-view-btn" onClick={e => { e.stopPropagation(); setDetailLead(lead); }} style={s.viewBtn}>View</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Badge label={lead.plan} color={PLAN_COLORS[lead.plan] || '#555'} />
                    <Badge label={lead.converted_at ? 'Converted' : 'Dropped off'} color={lead.converted_at ? '#3a7d44' : '#9b4a00'} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ─── FREE SCORES TAB ─── */
          <>
            <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Firm</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Score</th>
                    <th style={s.th}>Grade</th>
                    <th style={s.th}>Top Competitor</th>
                    <th style={s.th}>Converted</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#888', padding: '3rem' }}>No free scores yet</td></tr>
                  ) : scores.map(score => (
                    <tr key={score.id} className="admin-row" style={{ cursor: 'pointer' }} onClick={() => setDetailScore(score)}>
                      <td style={s.td}>
                        <div style={{ color: '#F5F0E8', fontWeight: 500 }}>{score.firm_name}</div>
                        {score.specialty && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>{score.specialty}</div>}
                      </td>
                      <td style={s.td}>
                        {score.email
                          ? <a href={`mailto:${score.email}`} style={{ color: '#999', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{score.email}</a>
                          : <span style={{ color: '#555' }}>No email</span>
                        }
                      </td>
                      <td style={{ ...s.td, color: '#999' }}>{score.city || score.region || '-'}</td>
                      <td style={s.td}>
                        <span style={{ color: score.score >= 50 ? '#3a7d44' : score.score >= 25 ? '#C9A84C' : '#cc4444', fontWeight: 600 }}>
                          {score.score}/100
                        </span>
                      </td>
                      <td style={s.td}>
                        <Badge label={`Grade ${score.grade}`} color={score.grade === 'A' || score.grade === 'B' ? '#3a7d44' : score.grade === 'C' ? '#C9A84C' : '#cc4444'} />
                      </td>
                      <td style={{ ...s.td, color: '#999', fontSize: '0.78rem' }}>
                        {score.top_competitor_name || '-'}
                      </td>
                      <td style={s.td}>
                        {score.converted_to_audit ? (
                          <Badge label="Converted" color="#3a7d44" />
                        ) : score.email ? (
                          <Badge label="Has email" color="#1a6fa8" />
                        ) : (
                          <span style={{ color: '#555', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ ...s.td, color: '#888', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {fmt(score.created_at)}
                      </td>
                      <td style={s.td}>
                        <button
                          className="admin-view-btn"
                          onClick={e => { e.stopPropagation(); setDetailScore(score); }}
                          style={s.viewBtn}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="admin-cards-mobile">
              {scores.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>No free scores yet</div>
              ) : scores.map(score => (
                <div key={score.id} style={{ padding: '1rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => setDetailScore(score)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ color: '#F5F0E8', fontWeight: 500, fontSize: '0.9rem' }}>{score.firm_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{score.email || 'No email'} {score.city && ` | ${score.city}`}</div>
                    </div>
                    <button className="admin-view-btn" onClick={e => { e.stopPropagation(); setDetailScore(score); }} style={s.viewBtn}>View</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge label={`${score.score}/100`} color={score.score >= 50 ? '#3a7d44' : score.score >= 25 ? '#C9A84C' : '#cc4444'} />
                    <Badge label={`Grade ${score.grade}`} color={score.grade === 'A' || score.grade === 'B' ? '#3a7d44' : score.grade === 'C' ? '#C9A84C' : '#cc4444'} />
                    {score.converted_to_audit && <Badge label="Converted" color="#3a7d44" />}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
