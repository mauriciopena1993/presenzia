import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { session_id, business_name, business_type, location, keywords, website } = await req.json();

    if (!session_id || !business_name || !business_type || !location) {
      return NextResponse.json(
        { error: 'session_id, business_name, business_type, and location are required' },
        { status: 400 }
      );
    }

    // Verify the Stripe session is paid
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const customerId = stripeSession.customer as string;

    // Find the client in Supabase
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (clientError || !client) {
      console.error('Client not found for customer:', customerId, clientError);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Parse keywords: accept array or comma-separated string
    let parsedKeywords: string[] = [];
    if (Array.isArray(keywords)) {
      parsedKeywords = keywords.filter(Boolean);
    } else if (typeof keywords === 'string' && keywords.trim()) {
      parsedKeywords = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }

    // Update client with business details
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        business_name: business_name.trim(),
        business_type: business_type.trim(),
        location: location.trim(),
        keywords: parsedKeywords.length > 0 ? parsedKeywords : null,
        website: website?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateError) {
      console.error('Failed to update client:', updateError);
      return NextResponse.json({ error: 'Failed to save details' }, { status: 500 });
    }

    // Find any pending audit jobs for this client and trigger them
    const { data: pendingJobs } = await supabase
      .from('audit_jobs')
      .select('id')
      .eq('client_id', client.id)
      .eq('status', 'pending');

    if (pendingJobs && pendingJobs.length > 0) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      for (const job of pendingJobs) {
        fetch(`${appUrl}/api/process-audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({ jobId: job.id }),
        }).catch(err => console.error('Failed to trigger audit for job:', job.id, err));
      }
      console.log(`🚀 Triggered ${pendingJobs.length} audit job(s) for client ${client.id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
