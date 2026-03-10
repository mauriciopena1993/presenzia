import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token).valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // First get the client email for campaign_emails cleanup
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('email')
    .eq('id', id)
    .single();

  if (fetchError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Delete campaign_emails by recipient_email (no FK cascade)
  await supabase
    .from('campaign_emails')
    .delete()
    .eq('recipient_email', client.email);

  // Delete the client (cascade handles audit_jobs and report_ratings)
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
