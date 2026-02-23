import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createOTPChallenge, OTP_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check client exists with active subscription
  const { data: client } = await supabase
    .from('clients')
    .select('id, status, business_name')
    .eq('email', normalizedEmail)
    .single();

  // Always return ok to avoid leaking whether an email is registered
  if (!client || client.status !== 'active') {
    return NextResponse.json({ ok: true });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const challenge = createOTPChallenge(normalizedEmail, code);

  // Send the code by email
  if (process.env.RESEND_API_KEY) {
    const businessLine = client.business_name ? `\nSigning in as: ${client.business_name}` : '';
    const result = await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: normalizedEmail,
      subject: `Your presenzia.ai login code: ${code}`,
      text: `Your presenzia.ai login code is: ${code}\n\nThis code expires in 10 minutes.${businessLine}\n\nIf you did not request this, you can safely ignore this email.\n\npresenzia.ai`,
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
    <p style="font-size:13px;color:#888888;margin:0 0 24px;line-height:1.5;">Use the code below to access your dashboard. It expires in 10 minutes.</p>
    <div style="background:#F9F9F9;border:1px solid #E0E0E0;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:0.3em;">
      <span style="font-size:36px;font-weight:700;color:#0A0A0A;font-family:Courier,monospace;">${code}</span>
    </div>
    ${client.business_name ? `<p style="font-size:13px;color:#888888;margin:0 0 16px;">Account: ${client.business_name}</p>` : ''}
    <p style="font-size:12px;color:#AAAAAA;margin:0;line-height:1.6;">If you did not request this code, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:11px;color:#AAAAAA;margin:0;">presenzia.ai · AI Visibility Audits · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
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
  res.cookies.set(OTP_COOKIE, challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });
  return res;
}
