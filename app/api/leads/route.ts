import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, contact_name, business_name, business_type, location, website, keywords, plan } = await req.json();

    if (!business_name || !business_type || !plan) {
      return NextResponse.json({ ok: true }); // Silent — don't block checkout
    }

    const keywordsArray = keywords
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : null;

    // If we have an email, upsert on email; otherwise just insert
    if (email) {
      await supabase
        .from('leads')
        .upsert({
          email: email.trim().toLowerCase(),
          contact_name: contact_name || null,
          business_name: business_name.trim(),
          business_type: business_type.trim(),
          location: location?.trim() || null,
          website: website?.trim() || null,
          keywords: keywordsArray,
          plan,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
          ignoreDuplicates: false,
        });
    } else {
      await supabase
        .from('leads')
        .insert({
          contact_name: contact_name || null,
          business_name: business_name.trim(),
          business_type: business_type.trim(),
          location: location?.trim() || null,
          website: website?.trim() || null,
          keywords: keywordsArray,
          plan,
        });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never block checkout
  }
}
