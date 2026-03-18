import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSummary, analyzeArticleCategory } from '@/lib/gemini';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find articles without summaries
    const articlesWithoutSummary = await prisma.newsArticle.findMany({
      where: {
        summary: null,
        content: { not: null },
      },
      take: 5, // Process 5 at a time to avoid rate limits
    });

    if (articlesWithoutSummary.length === 0) {
      return NextResponse.json({ 
        message: 'No articles to enrich',
        processed: 0 
      });
    }

    let successCount = 0;
    const errors = [];

    for (const article of articlesWithoutSummary) {
      try {
        // Generate summary
        const summary = await generateSummary(
          article.content || article.excerpt || '',
          article.title
        );

        // Analyze and improve category
        const betterCategory = await analyzeArticleCategory(
          article.title,
          article.excerpt || ''
        );

        // Update article
        await prisma.newsArticle.update({
          where: { id: article.id },
          data: {
            summary,
            category: betterCategory,
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        errors.push({
          articleId: article.id,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      message: 'Articles enriched successfully',
      processed: successCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error enriching articles:', error);
    return NextResponse.json({ error: 'Failed to enrich articles' }, { status: 500 });
  }
}