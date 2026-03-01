import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PlatformScore {
  platform: string;
  score: number;
  promptsTested: number;
  promptsMentioned: number;
  avgPosition: number | null;
  competitors: string[];
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, jobId } = await req.json() as { messages: Message[]; jobId?: string };

  const { data: client } = await supabase
    .from('clients')
    .select('id, business_name, business_type, location, plan')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  let reportContext = '';
  if (jobId) {
    const { data: job } = await supabase
      .from('audit_jobs')
      .select('overall_score, grade, summary, platforms_json, competitors_json, completed_at')
      .eq('id', jobId)
      .eq('client_id', client.id)
      .single();

    if (job && job.overall_score !== null) {
      const platforms = (job.platforms_json as PlatformScore[]) || [];
      const competitors = (job.competitors_json as Array<{ name: string; count: number }>) || [];
      const date = job.completed_at ? new Date(job.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'recently';

      reportContext = `
## Their latest audit (completed ${date})
- Overall AI Visibility Score: ${job.overall_score}/100 (Grade: ${job.grade})
- Summary: ${job.summary || 'No summary available'}
- Platform breakdown:
${platforms.map(p => `  • ${p.platform}: ${p.score}/100 — mentioned in ${p.promptsMentioned}/${p.promptsTested} test prompts`).join('\n')}
${competitors.length > 0 ? `\n- Top competitors appearing instead: ${competitors.slice(0, 3).map(c => c.name).join(', ')}` : ''}
`;
    }
  }

  const systemPrompt = `You are an AI visibility expert helping ${client.business_name || 'this firm'} understand their presenzia.ai audit results and improve their AI presence.

Firm: ${client.business_name || 'Unknown'} (${client.business_type || 'financial advisory'}, ${client.location || 'UK'})
Plan: ${client.plan}
${reportContext}

Your role:
- Explain what the scores and results mean in clear, practical terms
- Give specific, actionable recommendations tailored to their business type and location
- Answer questions about how AI visibility works and how to improve it
- Be encouraging but honest about where there are gaps
- Keep responses concise (3–5 sentences for most answers)

If asked about billing, cancellation, or account management, direct them to hello@presenzia.ai.`;

  const recentMessages = (messages || []).slice(-10);
  const firstUserIdx = recentMessages.findIndex(m => m.role === 'user');
  const apiMessages = firstUserIdx >= 0 ? recentMessages.slice(firstUserIdx) : recentMessages;

  if (apiMessages.length === 0) {
    return NextResponse.json({ error: 'No message' }, { status: 400 });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    console.error('Claude API error:', response.status, response.statusText);
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ message: data.content[0]?.text || '' });
}
