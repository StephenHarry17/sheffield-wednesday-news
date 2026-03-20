import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    let featured = await prisma.newsArticle.findMany({
      where: { featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    // 🔥 Fallback if no featured articles exist
    if (featured.length === 0) {
      console.log("No featured articles found, falling back to latest");

      featured = await prisma.newsArticle.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 5,
      });
    }

    return NextResponse.json(featured, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching featured articles:', error);

    return NextResponse.json(
      { error: 'Failed to fetch featured articles' },
      { status: 500 }
    );
  }
}