import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import {
  isAdminEmail,
  createChallengeToken,
  decodeChallengeToken,
} from '@/lib/admin-auth';
import {
  createOTPChallenge,
  decodeOTPChallenge,
  OTP_COOKIE,
} from '@/lib/client-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const existingChallengeToken: string | undefined = body.existingChallengeToken;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // ── Admin flow ──────────────────────────────────────────────────────────────
  if (isAdminEmail(email)) {
    let otp: string;
    let challengeToken: string;

    if (existingChallengeToken) {
      const decoded = decodeChallengeToken(existingChallengeToken);
      if (decoded.valid && decoded.otp) {
        otp = decoded.otp;
        challengeToken = existingChallengeToken; // reuse — keeps first email's code valid
      } else {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        challengeToken = createChallengeToken(otp);
      }
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      challengeToken = createChallengeToken(otp);
    }

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'presenzia.ai <reports@presenzia.ai>',
        replyTo: 'hello@presenzia.ai',
        to: email,
        subject: `Your presenzia.ai login code: ${otp}`,
        text: `Your presenzia.ai login code is: ${otp}\n\nExpires in 30 minutes. Do not share it.\n\npresenzia.ai`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:480px;width:100%;">
  <tr><td style="padding:32px 32px 0;border-bottom:2px solid #C9A84C;">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:#C9A84C;">.ai</span></span>
    <span style="font-size:11px;color:#888;margin-left:8px;text-transform:uppercase;letter-spacing:0.08em;">Admin</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#555555;margin:0 0 8px;">Your login code</p>
    <p style="font-size:13px;color:#888888;margin:0 0 24px;">This code expires in 30 minutes.</p>
    <div style="background:#F9F9F9;border:1px solid #E0E0E0;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:0.3em;">
      <span style="font-size:36px;font-weight:700;color:#0A0A0A;font-family:Courier,monospace;">${otp}</span>
    </div>
    <p style="font-size:13px;color:#888888;margin:0;">Do not share this code. If you did not request it, ignore this email.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
      }).catch(err => console.error('Failed to send admin OTP email:', err));
    }

    return NextResponse.json({ ok: true, type: 'admin', challengeToken });
  }

  // ── Client flow ─────────────────────────────────────────────────────────────
  const { data: client } = await supabase
    .from('clients')
    .select('id, status, business_name')
    .eq('email', email)
    .single();

  // No account found — tell the user so they can sign up
  if (!client) {
    return NextResponse.json({ error: 'no_account' }, { status: 404 });
  }

  // Reuse existing valid challenge if same email (so resend doesn't invalidate first code)
  const existingRaw = req.cookies.get(OTP_COOKIE)?.value;
  const existingDecoded = existingRaw ? decodeOTPChallenge(existingRaw) : null;

  let code: string;
  let challenge: string;
  let isResend: boolean;

  if (existingDecoded?.valid && existingDecoded.email === email && existingDecoded.code) {
    code = existingDecoded.code;
    challenge = existingRaw!;
    isResend = true;
  } else {
    code = String(Math.floor(100000 + Math.random() * 900000));
    challenge = createOTPChallenge(email, code);
    isResend = false;
  }

  if (process.env.RESEND_API_KEY) {
    const businessLine = client.business_name ? `\nAccount: ${client.business_name}` : '';
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      replyTo: 'hello@presenzia.ai',
      to: email,
      subject: `Your presenzia.ai login code: ${code}`,
      text: `Your presenzia.ai login code is: ${code}\n\nExpires in 30 minutes.${businessLine}\n\nIf you did not request this, you can safely ignore this email.\n\npresenzia.ai`,
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
    }).catch(err => console.error('Failed to send client OTP email:', err));
  }

  const res = NextResponse.json({ ok: true, type: 'client' });

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
