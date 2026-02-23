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
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      to: normalizedEmail,
      subject: `Your login code: ${code}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
            presenzia<span style="color: #C9A84C;">.ai</span>
          </div>
          <div style="color: #555; font-size: 12px; margin-bottom: 32px;">Client portal</div>

          <h1 style="font-size: 20px; color: #F5F0E8; margin-bottom: 8px;">Your login code</h1>
          <p style="color: #AAAAAA; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
            Enter this code to access your dashboard. It expires in 10 minutes.
          </p>

          <div style="background: #111; border: 1px solid #222; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; color: #C9A84C; letter-spacing: 0.2em;">${code}</span>
          </div>

          ${client.business_name ? `<p style="color: #666; font-size: 13px;">Signing in as: ${client.business_name}</p>` : ''}
          <p style="color: #444; font-size: 12px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }).catch(err => console.error('Failed to send OTP email:', err));
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
