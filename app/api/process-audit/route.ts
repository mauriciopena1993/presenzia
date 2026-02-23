/**
 * Background audit processor.
 *
 * Called fire-and-forget from the webhook after a payment.
 * Protected by INTERNAL_API_SECRET — not callable from the browser.
 *
 * On Vercel Pro: set maxDuration = 300 (5 minutes) in vercel.json
 * On Vercel Hobby: free tier limit is 60s — consider upgrading or using Inngest
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runAudit, AuditConfig } from '@/lib/audit/runner';
import { generatePDFReport } from '@/lib/report/generate';
import { Resend } from 'resend';

// Allow up to 5 minutes for the audit to complete (Vercel Pro)
export const maxDuration = 300;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // Verify internal secret
  const secret = req.headers.get('x-internal-secret');
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await req.json();

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // Fetch the job + client
  const { data: job, error: jobError } = await supabase
    .from('audit_jobs')
    .select('*, clients(*)')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    console.error('Job not found:', jobId, jobError);
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const client = job.clients;

  if (!client?.business_name || !client?.business_type || !client?.location) {
    // Client hasn't filled in their business details yet — mark job as pending onboarding
    await supabase
      .from('audit_jobs')
      .update({ status: 'pending', error: 'Awaiting client onboarding details' })
      .eq('id', jobId);

    return NextResponse.json({ status: 'pending_onboarding' });
  }

  // Mark job as running
  await supabase
    .from('audit_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId);

  try {
    const config: AuditConfig = {
      businessName: client.business_name,
      businessType: client.business_type,
      location: client.location,
      keywords: client.keywords || [],
      website: client.website || undefined,
    };

    console.log(`🔍 Running audit for ${config.businessName} (job: ${jobId})`);

    // Run the audit (platforms run in parallel — takes ~60-120s)
    const { score } = await runAudit(config);

    // Generate PDF report
    const pdfBuffer = await generatePDFReport(config, score);

    // Store report in Supabase Storage
    const reportFileName = `${jobId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(reportFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload PDF:', uploadError);
    }

    // Update job with results
    await supabase
      .from('audit_jobs')
      .update({
        status: 'completed',
        overall_score: score.overall,
        grade: score.grade,
        summary: score.summary,
        platforms_json: score.platforms,
        competitors_json: score.topCompetitors,
        report_path: uploadError ? null : reportFileName,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`✅ Audit complete for ${config.businessName}: ${score.overall}/100 (${score.grade})`);

    // Send report by email
    if (client.email && process.env.RESEND_API_KEY) {
      await sendReportEmail(client.email, config.businessName, score.overall, score.grade, pdfBuffer, jobId);
    }

    return NextResponse.json({ status: 'completed', score: score.overall, grade: score.grade });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Audit failed for job ${jobId}:`, message);

    await supabase
      .from('audit_jobs')
      .update({
        status: 'failed',
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}

async function sendReportEmail(
  email: string,
  businessName: string,
  score: number,
  grade: string,
  pdfBuffer: Buffer,
  jobId: string,
) {
  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: email,
      subject: `Your AI Visibility Report | ${businessName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">presenzia<span style="color: #C9A84C;">.ai</span></div>
          <hr style="border-color: #222; margin: 20px 0;" />

          <h1 style="font-size: 24px; color: #F5F0E8; margin-bottom: 8px;">Your AI Visibility Report is ready</h1>
          <p style="color: #AAAAAA; font-size: 15px; line-height: 1.6;">
            We've completed your audit for <strong style="color: #F5F0E8;">${businessName}</strong>.
          </p>

          <div style="background: #111; border: 1px solid #222; padding: 24px; margin: 24px 0; text-align: center;">
            <div style="font-size: 48px; color: #C9A84C; font-weight: 700; line-height: 1;">${score}</div>
            <div style="font-size: 13px; color: #777; margin-top: 4px;">/ 100 AI Visibility Score</div>
            <div style="display: inline-block; background: #C9A84C; color: #0A0A0A; font-weight: 700;
                        padding: 4px 16px; margin-top: 12px; font-size: 14px;">Grade ${grade}</div>
          </div>

          <p style="color: #AAAAAA; font-size: 14px; line-height: 1.7;">
            Your full report is attached to this email as a PDF. It includes your platform-by-platform breakdown,
            competitor analysis, and actionable recommendations.
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 32px;">
            presenzia.ai | Ketzal LTD (Co. No. 14570156)<br />
            Report ID: ${jobId}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `presenzia-report-${businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log(`📧 Report emailed to ${email}`);
  } catch (err) {
    console.error('Failed to send report email:', err);
  }
}
