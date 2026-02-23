'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuditJob {
  id: string;
  status: string;
  overall_score: number | null;
  grade: string | null;
  completed_at: string | null;
  created_at: string;
  error: string | null;
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
  created_at: string;
  audit_jobs: AuditJob[];
}

interface Lead {
  id: string;
  email: string | null;
  business_name: string;
  business_type: string;
  location: string;
  plan: string;
  converted_at: string | null;
  created_at: string;
}

const PLAN_COLORS: Record<string, string> = {
  starter: '#3a7d44',
  growth: '#1a6fa8',
  premium: '#9b6b00',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#3a7d44',
  past_due: '#9b4a00',
  cancelled: '#555',
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: '0.7rem',
      padding: '2px 8px',
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'clients' | 'leads'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, lRes] = await Promise.all([
          fetch('/api/admin/clients'),
          fetch('/api/admin/leads'),
        ]);

        if (cRes.status === 401 || lRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        const cData = await cRes.json();
        const lData = await lRes.json();

        setClients(cData.clients || []);
        setLeads(lData.leads || []);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    document.cookie = '__presenzia_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const handleRetryAudit = async (jobId: string) => {
    setRetrying(jobId);
    try {
      await fetch('/api/admin/retry-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      // Reload data after triggering retry
      setTimeout(() => window.location.reload(), 1500);
    } finally {
      setRetrying(null);
    }
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const unconvertedLeads = leads.filter(l => !l.converted_at).length;
  const pendingAudits = clients.flatMap(c => c.audit_jobs).filter(j => j.status === 'pending' || j.status === 'running').length;

  const s = {
    page: { minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' },
    nav: { borderBottom: '1px solid #1A1A1A', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    brand: { fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', textDecoration: 'none' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' },
    stat: { background: '#111', border: '1px solid #1a1a1a', padding: '1.25rem 1.5rem' },
    statNum: { fontSize: '2rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 },
    statLabel: { fontSize: '0.7rem', color: '#666', marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
    tabs: { display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '1.5rem' },
    tab: (active: boolean) => ({
      padding: '0.6rem 1.5rem',
      background: 'none',
      border: 'none',
      borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
      color: active ? '#F5F0E8' : '#666',
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      cursor: 'pointer',
      fontWeight: active ? 600 : 400,
    }),
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: 'left' as const, padding: '0.6rem 1rem', fontSize: '0.65rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' as const, borderBottom: '1px solid #1a1a1a' },
    td: { padding: '0.875rem 1rem', borderBottom: '1px solid #111', fontSize: '0.85rem', color: '#CCCCCC', verticalAlign: 'top' as const },
  };

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <Link href="/" style={s.brand}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          <span style={{ color: '#444', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginLeft: '12px' }}>admin</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #333', color: '#666', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
        >
          Sign out
        </button>
      </div>

      <div style={s.main}>
        {error && (
          <div style={{ padding: '1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.stat}>
            <div style={s.statNum}>{clients.length}</div>
            <div style={s.statLabel}>Total clients</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{activeClients}</div>
            <div style={s.statLabel}>Active subscriptions</div>
          </div>
          <div style={s.stat}>
            <div style={{ ...s.statNum, color: unconvertedLeads > 0 ? '#888' : '#C9A84C' }}>{unconvertedLeads}</div>
            <div style={s.statLabel}>Unconverted leads</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{pendingAudits}</div>
            <div style={s.statLabel}>Audits running</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(tab === 'clients')} onClick={() => setTab('clients')}>
            Clients ({clients.length})
          </button>
          <button style={s.tab(tab === 'leads')} onClick={() => setTab('leads')}>
            Leads ({leads.filter(l => !l.converted_at).length} unconverted)
          </button>
        </div>

        {loading ? (
          <div style={{ color: '#555', padding: '3rem', textAlign: 'center' }}>Loading...</div>
        ) : tab === 'clients' ? (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Business</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Plan</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Latest audit</th>
                <th style={s.th}>Score</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#444', padding: '3rem' }}>No clients yet</td></tr>
              ) : clients.map(client => {
                const latestJob = client.audit_jobs
                  ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return (
                  <tr key={client.id}>
                    <td style={s.td}>
                      <div style={{ color: '#F5F0E8', fontWeight: 500 }}>{client.business_name || '—'}</div>
                      {client.location && <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>{client.location}</div>}
                    </td>
                    <td style={s.td}>
                      <a href={`mailto:${client.email}`} style={{ color: '#888', textDecoration: 'none' }}>{client.email}</a>
                    </td>
                    <td style={s.td}>
                      <Badge label={client.plan} color={PLAN_COLORS[client.plan] || '#555'} />
                    </td>
                    <td style={s.td}>
                      <Badge label={client.status} color={STATUS_COLORS[client.status] || '#555'} />
                    </td>
                    <td style={s.td}>
                      {latestJob ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Badge
                            label={latestJob.status}
                            color={
                              latestJob.status === 'completed' ? '#3a7d44' :
                              latestJob.status === 'running' ? '#C9A84C' :
                              latestJob.status === 'failed' ? '#9b1a1a' : '#555'
                            }
                          />
                          {latestJob.status === 'failed' && (
                            <button
                              onClick={() => handleRetryAudit(latestJob.id)}
                              disabled={retrying === latestJob.id}
                              title={latestJob.error || 'Retry audit'}
                              style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'none', border: '1px solid #555', color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                              {retrying === latestJob.id ? '…' : 'Retry'}
                            </button>
                          )}
                        </div>
                      ) : <span style={{ color: '#333' }}>—</span>}
                    </td>
                    <td style={s.td}>
                      {latestJob?.overall_score != null ? (
                        <span style={{ color: '#C9A84C', fontWeight: 600 }}>
                          {latestJob.overall_score}/100 <span style={{ color: '#666' }}>({latestJob.grade})</span>
                        </span>
                      ) : <span style={{ color: '#333' }}>—</span>}
                    </td>
                    <td style={{ ...s.td, color: '#555', fontSize: '0.8rem' }}>
                      {fmt(client.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Business</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Plan intent</th>
                <th style={s.th}>Location</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#444', padding: '3rem' }}>No leads yet</td></tr>
              ) : leads.map(lead => (
                <tr key={lead.id}>
                  <td style={s.td}>
                    <div style={{ color: '#F5F0E8', fontWeight: 500 }}>{lead.business_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>{lead.business_type}</div>
                  </td>
                  <td style={s.td}>
                    {lead.email
                      ? <a href={`mailto:${lead.email}`} style={{ color: '#888', textDecoration: 'none' }}>{lead.email}</a>
                      : <span style={{ color: '#333' }}>Not provided</span>
                    }
                  </td>
                  <td style={s.td}>
                    <Badge label={lead.plan} color={PLAN_COLORS[lead.plan] || '#555'} />
                  </td>
                  <td style={{ ...s.td, color: '#888' }}>{lead.location}</td>
                  <td style={s.td}>
                    <Badge
                      label={lead.converted_at ? 'Converted' : 'Dropped off'}
                      color={lead.converted_at ? '#3a7d44' : '#9b4a00'}
                    />
                  </td>
                  <td style={{ ...s.td, color: '#555', fontSize: '0.8rem' }}>
                    {fmt(lead.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
