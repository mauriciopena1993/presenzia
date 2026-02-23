import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdminEmail, createChallengeToken } from '@/lib/admin-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !isAdminEmail(email)) {
    // Return generic message to avoid email enumeration
    return NextResponse.json({ sent: true });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const challengeToken = createChallengeToken(otp);

  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: email,
      subject: `Admin login code: ${otp}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 24px;">
            presenzia<span style="color: #C9A84C;">.ai</span>
          </div>
          <p style="color: #AAAAAA; font-size: 14px; margin-bottom: 24px;">Your admin login code:</p>
          <div style="background: #111; border: 1px solid #2a2a2a; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #C9A84C;">${otp}</span>
          </div>
          <p style="color: #555; font-size: 12px;">This code expires in 5 minutes. Do not share it.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ sent: true, challengeToken });
}
