import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createOTPChallenge, decodeOTPChallenge, OTP_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check client exists
  const { data: client } = await supabase
    .from('clients')
    .select('id, status, business_name')
    .eq('email', normalizedEmail)
    .single();

  // If client doesn't exist, tell them — no security risk for B2B audit tool
  if (!client) {
    return NextResponse.json({ error: 'no_account', message: 'No account found with this email. Get your free AI visibility score to get started.' }, { status: 404 });
  }

  // If a valid challenge already exists for this email, reuse it (resend same code).
  // This prevents "Send again" from invalidating the code from the first email.
  const existingRaw = req.cookies.get(OTP_COOKIE)?.value;
  const existingDecoded = existingRaw ? decodeOTPChallenge(existingRaw) : null;

  let code: string;
  let challenge: string;
  let isResend: boolean;

  if (existingDecoded?.valid && existingDecoded.email === normalizedEmail && existingDecoded.code) {
    code = existingDecoded.code;
    challenge = existingRaw!; // keep existing cookie — don't overwrite
    isResend = true;
  } else {
    code = String(Math.floor(100000 + Math.random() * 900000));
    challenge = createOTPChallenge(normalizedEmail, code);
    isResend = false;
  }

  // Send the code by email
  if (process.env.RESEND_API_KEY) {
    const businessLine = client.business_name ? `\nSigning in as: ${client.business_name}` : '';
    const result = await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      replyTo: 'hello@presenzia.ai',
      to: normalizedEmail,
      subject: `Your presenzia.ai login code: ${code}`,
      text: `Your presenzia.ai login code is: ${code}\n\nThis code expires in 30 minutes.${businessLine}\n\nIf you did not request this, you can safely ignore this email.\n\npresenzia.ai`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:480px;width:100%;">
  <tr><td style="padding:32px 32px 0;border-bottom:2px solid #C9A84C;">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;">presenzia<span style="color:#C9A84C;">.ai</span></span>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#555555;margin:0 0 8px;">Your login code</p>
    <p style="font-size:13px;color:#888888;margin:0 0 24px;line-height:1.5;">Use the code below to access your dashboard. It expires in 30 minutes.</p>
    <div style="background:#F9F9F9;border:1px solid #E0E0E0;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:0.3em;">
      <span style="font-size:36px;font-weight:700;color:#0A0A0A;font-family:Courier,monospace;">${code}</span>
    </div>
    ${client.business_name ? `<p style="font-size:13px;color:#888888;margin:0 0 16px;">Account: ${client.business_name}</p>` : ''}
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">If you did not request this code, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai · AI Visibility Audits · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });
    if (result.error) {
      console.error('Failed to send OTP email:', result.error);
    }
  }

  const res = NextResponse.json({ ok: true });

  // Only set a new cookie when creating a fresh challenge (not on resend)
  if (!isResend) {
    res.cookies.set(OTP_COOKIE, challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });
  }

  return res;
}
