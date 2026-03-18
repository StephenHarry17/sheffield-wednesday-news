import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Keywords that indicate a Sheffield Wednesday article
const SWFC_KEYWORDS = [
  'sheffield wednesday',
  'swfc',
  'owls',
  'hillsborough',
];

// Keywords to exclude (false positives)
const EXCLUDE_KEYWORDS = [
  'beat sheffield wednesday',
  'defeated sheffield wednesday',
  'beating sheffield wednesday',
  'manchester united',
  'arsenal',
  'tottenham',
  'chelsea',
  'liverpool',
  'manchester city',
  'newcastle',
  'watford',
  'wrexham',
  'southampton',
  'matt fitzpatrick',
  'golf',
];

function isSheffieldWednesdayArticle(title: string, excerpt: string, content: string): boolean {
  const fullText = `${title} ${excerpt} ${content}`.toLowerCase();
  
  // Must contain at least one SWFC keyword
  const hasSWFCKeyword = SWFC_KEYWORDS.some(keyword => fullText.includes(keyword));
  if (!hasSWFCKeyword) return false;

  // Must NOT contain exclude keywords
  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(keyword => fullText.includes(keyword));
  if (hasExcludeKeyword) return false;

  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all articles
    const allArticles = await prisma.newsArticle.findMany();
    console.log(`Found ${allArticles.length} total articles`);

    let deletedCount = 0;
    let keptCount = 0;

    // Check each article
    for (const article of allArticles) {
      const isValid = isSheffieldWednesdayArticle(
        article.title,
        article.excerpt || '',
        article.content || ''
      );

      if (!isValid) {
        // Delete this article
        await prisma.newsArticle.delete({
          where: { id: article.id },
        });
        deletedCount++;
        console.log(`Deleted: ${article.title}`);
      } else {
        keptCount++;
      }
    }

    return NextResponse.json({
      message: 'Cleanup completed',
      deleted: deletedCount,
      kept: keptCount,
      total: allArticles.length,
    });
  } catch (error) {
    console.error('Error cleaning up articles:', error);
    return NextResponse.json({ error: 'Failed to cleanup articles' }, { status: 500 });
  }
}