import { NextRequest, NextResponse } from 'next/server';
import { runAudit, AuditConfig } from '@/lib/audit/runner';

export async function POST(req: NextRequest) {
  // Protect against open abuse — require internal secret
  const secret = req.headers.get('x-internal-secret');
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { businessName, businessType, location, keywords, website } = body;

    // Validate required fields
    if (!businessName || !businessType || !location) {
      return NextResponse.json(
        { error: 'businessName, businessType, and location are required' },
        { status: 400 }
      );
    }

    const config: AuditConfig = {
      businessName,
      businessType,
      location,
      keywords: keywords || [],
      website,
    };

    // Run the audit (this will take 2-5 minutes for a full run)
    const { results, score } = await runAudit(config);

    return NextResponse.json({
      success: true,
      score: score.overall,
      grade: score.grade,
      summary: score.summary,
      platforms: score.platforms,
      topCompetitors: score.topCompetitors,
      totalPrompts: score.totalPrompts,
      mentionedInCount: score.mentionedInCount,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Audit failed. Please try again.' },
      { status: 500 }
    );
  }
}
