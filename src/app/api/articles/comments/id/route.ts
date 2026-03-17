import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    const comment = await prisma.comment.update({
      where: { id: parseInt(params.id) },
      data: { content },
      include: { author: true },
    });
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.comment.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}