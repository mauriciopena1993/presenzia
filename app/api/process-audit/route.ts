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
import { generateInsights } from '@/lib/report/insights';
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
    const { results, score } = await runAudit(config);

    // Generate insights and PDF report
    const insights = generateInsights(config, score, results);
    const pdfBuffer = await generatePDFReport(config, score, results, insights);

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
      await sendReportEmail(
        client.email,
        config.businessName,
        score.overall,
        score.grade,
        pdfBuffer,
        jobId,
        score.summary,
        score.topCompetitors[0]?.name,
      );
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

    // ✉️ Alert admin on audit failure
    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: 'presenzia.ai <reports@presenzia.ai>',
        to: 'hello@presenzia.ai',
        subject: `🚨 Audit failed: ${client?.business_name || jobId}`,
        html: `<div style="font-family:Inter,sans-serif;max-width:560px;background:#0A0A0A;color:#F5F0E8;padding:40px;">
          <div style="font-size:18px;font-weight:600;border-bottom:2px solid #cc4444;padding-bottom:12px;margin-bottom:24px;">
            presenzia<span style="color:#C9A84C;">.ai</span> <span style="color:#999;font-size:12px;font-weight:400;">Audit failure alert</span>
          </div>
          <div style="background:#111;border:1px solid #cc444444;padding:20px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#999;font-size:12px;padding:6px 0;width:130px;">Job ID</td><td style="color:#F5F0E8;font-size:13px;">${jobId}</td></tr>
              <tr><td style="color:#999;font-size:12px;padding:6px 0;">Client</td><td style="color:#F5F0E8;font-size:13px;">${client?.business_name || '—'}</td></tr>
              <tr><td style="color:#999;font-size:12px;padding:6px 0;">Email</td><td style="color:#F5F0E8;font-size:13px;">${client?.email || '—'}</td></tr>
              <tr><td style="color:#999;font-size:12px;padding:6px 0;">Error</td><td style="color:#cc4444;font-size:13px;">${message}</td></tr>
            </table>
          </div>
          <p style="color:#888;font-size:12px;margin-top:16px;">Manual retry may be required. Check Vercel logs for full stack trace.</p>
        </div>`,
      }).catch(err => console.error('Failed to send audit failure email:', err));
    }

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
  summary?: string,
  topComp?: string,
) {
  const scoreBand = score >= 70 ? 'Strong' : score >= 45 ? 'Moderate' : score >= 25 ? 'Weak' : 'Not Visible';
  const scoreColor = score >= 70 ? '#4a9e6a' : score >= 45 ? '#C9A84C' : score >= 25 ? '#cc8833' : '#cc4444';

  const summaryHtml = summary
    ? `<p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;border-left:3px solid #C9A84C;padding-left:14px;">${summary}</p>`
    : '';

  const topCompHtml = topComp
    ? `<p style="font-size:13px;color:#888888;margin:0 0 24px;line-height:1.6;">We found that <strong style="color:#555555;">${topComp}</strong> is currently being recommended by AI platforms in your category. Your report includes a detailed competitor analysis with tips to close the gap.</p>`
    : '';

  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: email,
      subject: `Your AI Visibility Report: ${score}/100 (${scoreBand}) — ${businessName}`,
      text: `Your AI Visibility Report for ${businessName} is ready.\n\nAI Visibility Score: ${score}/100 — Grade ${grade} (${scoreBand})\n\n${summary ?? ''}\n\n${topComp ? `Top competitor detected: ${topComp}\n\n` : ''}Your full report is attached as a PDF. It includes your platform-by-platform breakdown, competitor analysis, and actionable recommendations.\n\nLog in to your dashboard at https://presenzia.ai/dashboard to view your results online.\n\npresenzia.ai | Ketzal LTD (Co. No. 14570156)\nReport ID: ${jobId}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:560px;width:100%;">
  <tr><td style="padding:28px 32px;border-bottom:2px solid #C9A84C;">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:#C9A84C;">.ai</span></span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h1 style="font-size:20px;color:#111111;margin:0 0 8px;font-weight:700;">Your AI Visibility Report is ready</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.6;">We have completed your audit for <strong>${businessName}</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;border:1px solid #E0E0E0;margin:0 0 24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:52px;font-weight:700;color:${scoreColor};line-height:1;font-family:Arial,sans-serif;">${score}</div>
        <div style="font-size:12px;color:#888888;margin:4px 0 12px;">/ 100 AI Visibility Score</div>
        <div style="display:inline-block;background:${scoreColor};color:#ffffff;font-weight:700;padding:5px 18px;font-size:12px;letter-spacing:0.05em;">${scoreBand.toUpperCase()} · Grade ${grade}</div>
      </td></tr>
    </table>

    ${summaryHtml}
    ${topCompHtml}

    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Your full report is attached to this email as a PDF. It includes your platform-by-platform breakdown, competitor analysis, and specific recommendations to improve your visibility.</p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#0A0A0A;padding:12px 24px;">
        <a href="https://presenzia.ai/dashboard" style="color:#C9A84C;text-decoration:none;font-size:13px;font-weight:700;">View your report online →</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai · Ketzal LTD (Co. No. 14570156) · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
    <p style="font-size:11px;color:#AAAAAA;margin:4px 0 0;">Report ID: ${jobId}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
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
