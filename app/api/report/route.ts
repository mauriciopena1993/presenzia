/**
 * PDF report download endpoint.
 * Returns the PDF for a given job ID.
 * Protected by INTERNAL_API_SECRET (for server-to-server use)
 * or by a client's Supabase auth token (for the dashboard).
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // Allow access via internal secret (server-to-server)
  const secret = req.headers.get('x-internal-secret');
  const isInternalRequest = secret && secret === process.env.INTERNAL_API_SECRET;

  if (!isInternalRequest) {
    // In future: verify Supabase auth token and check client owns this job
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the job
  const { data: job, error } = await supabase
    .from('audit_jobs')
    .select('id, status, report_path, client_id')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'completed' || !job.report_path) {
    return NextResponse.json(
      { error: 'Report not ready', status: job.status },
      { status: 404 }
    );
  }

  // Download from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('reports')
    .download(job.report_path);

  if (downloadError || !fileData) {
    console.error('Failed to download report:', downloadError);
    return NextResponse.json({ error: 'Report file not found' }, { status: 404 });
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
