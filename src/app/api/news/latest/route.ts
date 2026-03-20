import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const rawLimit = parseInt(
      request.nextUrl.searchParams.get('limit') || '10',
      10
    );
    const limit = Number.isNaN(rawLimit) ? 10 : Math.min(rawLimit, 100);

    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest articles' },
      { status: 500 }
    );
  }
}