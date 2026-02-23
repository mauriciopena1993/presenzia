import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  // Verify the job belongs to this client
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  if (!clientRow) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const { data: job } = await supabase
    .from('audit_jobs')
    .select('id, status, report_path, client_id')
    .eq('id', jobId)
    .eq('client_id', clientRow.id)
    .single();

  if (!job || !job.report_path) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('reports')
    .download(job.report_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'File not available' }, { status: 404 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="presenzia-report-${jobId}.pdf"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
