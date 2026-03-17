import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { author: true, article: true },
    });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
    }
    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: { author: true, article: true },
    });
    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
