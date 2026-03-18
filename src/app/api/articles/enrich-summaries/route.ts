import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    console.log('[Enrich] Starting enrichment process...');

    const articlesWithoutSummary = await prisma.newsArticle.findMany({
      where: {
        summary: null,
        content: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1, // CRITICAL: Only 1 per minute due to quota limit!
    });

    console.log(`[Enrich] Found ${articlesWithoutSummary.length} articles to enrich`);

    if (articlesWithoutSummary.length === 0) {
      return NextResponse.json({ 
        message: 'No articles to enrich',
        processed: 0,
        note: 'Quota: 1 req/min with Gemini 2 Flash',
      });
    }

    const article = articlesWithoutSummary[0];

    const prompt = `Analyze this Sheffield Wednesday article. Provide:
1. A 2-3 sentence summary
2. A category from: Match Report, Transfer, Opinion, Fan Zone, Club News, Latest

Title: ${article.title}
Excerpt: ${article.excerpt}

Return ONLY JSON:
{"summary": "text", "category": "text"}`;

    console.log('[Enrich] Calling Gemini API with gemini-2-flash...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    console.log('[Enrich] Gemini response received');

    let enrichedData;
    try {
      enrichedData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Enrich] Failed to parse JSON:', responseText);
      return NextResponse.json({
        error: 'Invalid JSON from Gemini',
        response: responseText,
      }, { status: 500 });
    }

    console.log(`[Enrich] Updating: ${article.title}`);

    await prisma.newsArticle.update({
      where: { id: article.id },
      data: {
        summary: enrichedData.summary,
        category: enrichedData.category,
      },
    });

    return NextResponse.json({
      message: 'Article enriched successfully',
      processed: 1,
      article: article.title.substring(0, 50),
      quota: '1 request per minute - schedule cron job accordingly',
    });

  } catch (error) {
    console.error('[Enrich] Error:', error);
    return NextResponse.json({ 
      error: 'Enrichment failed',
      details: String(error),
    }, { status: 500 });
  }
}