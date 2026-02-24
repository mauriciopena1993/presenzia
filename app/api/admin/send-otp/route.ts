import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdminEmail, createChallengeToken, decodeChallengeToken } from '@/lib/admin-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, existingChallengeToken } = await req.json();

  if (!email || !isAdminEmail(email)) {
    // Return generic message to avoid email enumeration
    return NextResponse.json({ sent: true });
  }

  // If a valid challengeToken is provided (resend scenario), reuse the same OTP
  // so the first email's code stays valid even after clicking "Send again"
  let otp: string;
  let challengeToken: string;

  if (existingChallengeToken) {
    const decoded = decodeChallengeToken(existingChallengeToken);
    if (decoded.valid && decoded.otp) {
      otp = decoded.otp;
      challengeToken = existingChallengeToken; // keep same token
    } else {
      // Token expired or invalid — generate fresh
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      challengeToken = createChallengeToken(otp);
    }
  } else {
    // Fresh request — generate new OTP
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    challengeToken = createChallengeToken(otp);
  }

  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: email,
      subject: `Your presenzia.ai admin code: ${otp}`,
      text: `Your presenzia.ai admin login code is: ${otp}\n\nThis code expires in 30 minutes. Do not share it.\n\npresenzia.ai`,
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
    <p style="font-size:14px;color:#555555;margin:0 0 8px;">Admin login code</p>
    <p style="font-size:13px;color:#888888;margin:0 0 24px;">This code expires in 30 minutes.</p>
    <div style="background:#F9F9F9;border:1px solid #E0E0E0;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:0.3em;">
      <span style="font-size:36px;font-weight:700;color:#0A0A0A;font-family:Courier,monospace;">${otp}</span>
    </div>
    <p style="font-size:12px;color:#AAAAAA;margin:0;">Do not share this code. If you did not request it, ignore this email.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:11px;color:#AAAAAA;margin:0;">presenzia.ai · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ sent: true, challengeToken });
}
