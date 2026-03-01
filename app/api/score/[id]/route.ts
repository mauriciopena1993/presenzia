import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Retrieve score results by share ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('free_scores')
    .select('*')
    .eq('share_id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Score not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: data.share_id,
    firmName: data.firm_name,
    city: data.city,
    specialty: data.specialty,
    score: data.score,
    grade: data.grade,
    topCompetitor: data.top_competitor_name ? {
      name: data.top_competitor_name,
      count: data.top_competitor_count,
    } : null,
    mentionsCount: data.results_json?.mentionsCount || 0,
    totalPrompts: data.results_json?.totalPrompts || 0,
    platformBreakdown: data.results_json?.platformBreakdown || [],
    hasEmail: !!data.email,
    createdAt: data.created_at,
  });
}

// POST: Save email to existing score (email gate)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('free_scores')
    .update({
      email,
      contact_name: name || null,
    })
    .eq('share_id', id);

  if (error) {
    console.error('Failed to save email:', error);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
