import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    return Response.json(matches, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return Response.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}