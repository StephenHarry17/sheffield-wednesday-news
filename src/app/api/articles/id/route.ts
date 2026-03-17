import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(params.id) },
      include: { author: true, comments: true },
    });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content, excerpt, slug, published } = await request.json();
    const article = await prisma.article.update({
      where: { id: parseInt(params.id) },
      data: { title, content, excerpt, slug, published },
      include: { author: true },
    });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.article.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: 'Article deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}