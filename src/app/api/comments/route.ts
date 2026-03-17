import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const comments = await prisma.comment.findMany({
      include: { author: true, article: true },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, articleId, authorId } = await request.json();
    if (!content || !articleId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: content, articleId, authorId' }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: { content, articleId, authorId },
      include: { author: true, article: true },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
