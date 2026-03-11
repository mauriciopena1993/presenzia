/**
 * One-time script: Delete all data for test email addresses.
 * Run with: npx tsx scripts/cleanup-test-emails.ts
 */
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const EMAILS_TO_DELETE = [
  'mauriciopena1993@gmail.com',
  'mauriciopena1993@hotmail.com',
];

async function main() {
  // Load env vars from .env.local
  const { config } = await import('dotenv');
  config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  console.log('🧹 Starting cleanup for:', EMAILS_TO_DELETE.join(', '));
  console.log('─'.repeat(60));

  for (const email of EMAILS_TO_DELETE) {
    console.log(`\n📧 Cleaning up: ${email}`);

    // 1. Find clients for this email
    const { data: clients } = await supabase
      .from('clients')
      .select('id, email, stripe_subscription_id, stripe_customer_id')
      .eq('email', email);

    if (clients && clients.length > 0) {
      for (const client of clients) {
        console.log(`  🏢 Client found: ${client.id}`);

        // Cancel Stripe subscription
        if (stripe && client.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(client.stripe_subscription_id);
            console.log(`  💳 Stripe subscription cancelled: ${client.stripe_subscription_id}`);
          } catch (e: any) {
            console.log(`  ⚠️  Stripe sub cancel skipped: ${e.message}`);
          }
        }

        // Delete Stripe customer entirely
        if (stripe && client.stripe_customer_id) {
          try {
            await stripe.customers.del(client.stripe_customer_id);
            console.log(`  💳 Stripe customer deleted: ${client.stripe_customer_id}`);
          } catch (e: any) {
            console.log(`  ⚠️  Stripe customer delete skipped: ${e.message}`);
          }
        }

        // Get audit jobs for storage cleanup
        const { data: jobs } = await supabase
          .from('audit_jobs')
          .select('id, report_path')
          .eq('client_id', client.id);

        if (jobs && jobs.length > 0) {
          // Delete report files from storage
          const reportPaths = jobs.map(j => j.report_path).filter((p): p is string => !!p);
          if (reportPaths.length > 0) {
            await supabase.storage.from('reports').remove(reportPaths);
            console.log(`  📁 Deleted ${reportPaths.length} report file(s)`);
          }

          // Delete report_ratings
          const jobIds = jobs.map(j => j.id);
          const { count: ratingsCount } = await supabase
            .from('report_ratings')
            .delete()
            .in('audit_job_id', jobIds);
          console.log(`  ⭐ Deleted ${ratingsCount ?? 0} report rating(s)`);

          // Delete audit_jobs
          const { count: jobsCount } = await supabase
            .from('audit_jobs')
            .delete()
            .eq('client_id', client.id);
          console.log(`  📊 Deleted ${jobsCount ?? 0} audit job(s)`);
        }

        // Delete the client record
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', client.id);
        if (error) {
          console.error(`  ❌ Client delete error: ${error.message}`);
        } else {
          console.log(`  ✅ Client deleted`);
        }
      }
    } else {
      console.log(`  ℹ️  No client records found`);
    }

    // 2. Delete campaign_emails
    const { count: campaignCount } = await supabase
      .from('campaign_emails')
      .delete()
      .eq('recipient_email', email);
    console.log(`  📬 Deleted ${campaignCount ?? 0} campaign email(s)`);

    // 3. Delete free_scores
    const { count: scoresCount } = await supabase
      .from('free_scores')
      .delete()
      .eq('email', email);
    console.log(`  🎯 Deleted ${scoresCount ?? 0} free score(s)`);

    // 4. Delete leads
    const { count: leadsCount } = await supabase
      .from('leads')
      .delete()
      .eq('email', email);
    console.log(`  📋 Deleted ${leadsCount ?? 0} lead(s)`);

    // 5. Search and delete Stripe customers by email (may not be linked to a client)
    if (stripe) {
      try {
        const customers = await stripe.customers.list({ email, limit: 100 });
        for (const cust of customers.data) {
          // Cancel all subscriptions first
          const subs = await stripe.subscriptions.list({ customer: cust.id, limit: 100 });
          for (const sub of subs.data) {
            if (sub.status !== 'canceled') {
              await stripe.subscriptions.cancel(sub.id);
              console.log(`  💳 Stripe sub cancelled: ${sub.id}`);
            }
          }
          await stripe.customers.del(cust.id);
          console.log(`  💳 Stripe customer deleted: ${cust.id} (${cust.email})`);
        }
        if (customers.data.length === 0) {
          console.log(`  ℹ️  No Stripe customers found`);
        }
      } catch (e: any) {
        console.log(`  ⚠️  Stripe cleanup error: ${e.message}`);
      }
    } else {
      console.log(`  ⚠️  No STRIPE_SECRET_KEY — skipping Stripe cleanup`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('✅ Cleanup complete! Both emails are now fresh for testing.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
