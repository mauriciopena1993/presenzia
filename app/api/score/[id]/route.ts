import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { FROM_EMAIL, REPLY_TO, freeScoreDelivery } from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Check if email is already associated with a paying client
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, business_name')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (existingClient) {
    return NextResponse.json({
      error: 'email_in_use',
      message: 'This email is already linked to an existing account. Please use a different email address, or log in to your dashboard to view your existing audit.',
    }, { status: 409 });
  }

  // Get the score data first (needed for the email)
  const { data: scoreData, error: fetchError } = await supabase
    .from('free_scores')
    .select('firm_name, score, grade, share_id')
    .eq('share_id', id)
    .single();

  if (fetchError || !scoreData) {
    return NextResponse.json({ error: 'Score not found' }, { status: 404 });
  }

  // Save email to the score record
  const { error } = await supabase
    .from('free_scores')
    .update({
      email: email.toLowerCase().trim(),
      contact_name: name || null,
    })
    .eq('share_id', id);

  if (error) {
    console.error('Failed to save email:', error);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }

  // Send immediate score delivery email (fire-and-forget, don't block the response)
  if (process.env.RESEND_API_KEY) {
    const emailContent = freeScoreDelivery(
      scoreData.firm_name,
      scoreData.score,
      scoreData.grade,
      scoreData.share_id,
      email.toLowerCase().trim(),
    );
    resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: email.toLowerCase().trim(),
      subject: emailContent.subject,
      html: emailContent.html,
    }).then(() => {
      console.log(`📧 Score delivery email sent to ${email} for ${scoreData.firm_name}`);
    }).catch((err) => {
      console.error('Failed to send score delivery email:', err);
    });
  }

  return NextResponse.json({ success: true });
}
