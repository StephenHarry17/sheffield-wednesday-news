import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.article.findMany({
      include: { author: true, comments: true },
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, excerpt, slug, authorId } = await request.json();
    const article = await prisma.article.create({
      data: { title, content, excerpt, slug, authorId },
      include: { author: true },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}