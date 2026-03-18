import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const breakingNews = await prisma.newsArticle.findMany({
      where: { isBreaking: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json(breakingNews);
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return NextResponse.json({ error: 'Failed to fetch breaking news' }, { status: 500 });
  }
}