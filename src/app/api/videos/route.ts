import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return Response.json(videos, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return Response.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}