import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!NEWSAPI_KEY) {
      return NextResponse.json({ error: 'NEWSAPI_KEY not configured' }, { status: 500 });
    }

    // Fetch from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=Sheffield+Wednesday&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from NewsAPI' }, { status: 500 });
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return NextResponse.json({ message: 'No articles found', saved: 0 });
    }

    // Save articles to database
    let savedCount = 0;
    for (const article of data.articles) {
      try {
        await prisma.newsArticle.upsert({
          where: { sourceUrl: article.url },
          update: { viewCount: { increment: 1 } },
          create: {
            title: article.title,
            excerpt: article.description,
            content: article.content,
            source: 'NewsAPI',
            sourceUrl: article.url,
            imageUrl: article.urlToImage,
            category: 'Latest',
            publishedAt: new Date(article.publishedAt),
          },
        });
        savedCount++;
      } catch (error) {
        console.error('Error saving article:', error);
      }
    }

    return NextResponse.json({
      message: 'Articles fetched successfully',
      saved: savedCount,
      total: data.articles.length,
    });
  } catch (error) {
    console.error('Error fetching NewsAPI articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}