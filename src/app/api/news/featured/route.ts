import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const featured = await prisma.newsArticle.findMany({
      where: { featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(featured);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return NextResponse.json({ error: 'Failed to fetch featured articles' }, { status: 500 });
  }
}