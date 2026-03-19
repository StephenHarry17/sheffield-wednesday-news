import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeArticleCategory } from '@/lib/gemini';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

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
  'manchester united',
  'arsenal',
  'tottenham',
  'chelsea',
  'liverpool',
  'manchester city',
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

async function deleteOldArticles(daysToKeep: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deleted = await prisma.newsArticle.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${deleted.count} articles older than ${daysToKeep} days`);
    return deleted.count;
  } catch (error) {
    console.error('Error deleting old articles:', error);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!NEWSAPI_KEY) {
      return NextResponse.json({ error: 'NEWSAPI_KEY not configured' }, { status: 500 });
    }

    console.log('Starting Sheffield Wednesday article fetch...');

    const queries = [
      '"Sheffield Wednesday"',
      'Sheffield Wednesday FC',
      'SWFC',
    ];

    let allArticles: any[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=100&apiKey=${NEWSAPI_KEY}`
        );

        if (!response.ok) {
          console.error(`Failed to fetch for query: ${query}`);
          continue;
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
          console.log(`No articles found for query: ${query}`);
          continue;
        }

        console.log(`Found ${data.articles.length} raw articles for query: ${query}`);

        // Filter to ensure articles are actually about Sheffield Wednesday
        const swArticles = data.articles.filter((article: any) => 
          isSheffieldWednesdayArticle(
            article.title || '',
            article.description || '',
            article.content || ''
          )
        );

        console.log(`Filtered to ${swArticles.length} Sheffield Wednesday articles for query: ${query}`);
        allArticles = allArticles.concat(swArticles);
      } catch (error) {
        console.error(`Error fetching for query ${query}:`, error);
      }
    }

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );

    console.log(`Total unique Sheffield Wednesday articles: ${uniqueArticles.length}`);

    // Log sample article dates for debugging
    console.log('Sample article dates:');
    uniqueArticles.slice(0, 5).forEach((article: any) => {
      console.log(`  - "${article.title.substring(0, 50)}..." published: ${article.publishedAt}`);
    });

    if (uniqueArticles.length === 0) {
      return NextResponse.json({ 
        message: 'No Sheffield Wednesday articles found', 
        saved: 0,
        deleted: 0,
        debug: 'No articles passed the filtering criteria'
      });
    }

    // Save articles to database
    let savedCount = 0;
    let errorCount = 0;

    for (const article of uniqueArticles) {
      try {
        // Analyze category with Gemini
        const category = await analyzeArticleCategory(
          article.title,
          article.description || ''
        );

        await prisma.newsArticle.upsert({
          where: { sourceUrl: article.url },
          update: { 
            viewCount: { increment: 1 },
            updatedAt: new Date(),
          },
          create: {
            title: article.title,
            excerpt: article.description,
            content: article.content,
            source: article.source.name || 'NewsAPI',
            sourceUrl: article.url,
            imageUrl: article.urlToImage,
            category,
            publishedAt: new Date(article.publishedAt),
          },
        });
        savedCount++;
      } catch (error) {
        console.error('Error saving article:', error);
        errorCount++;
      }
    }

    // Delete articles older than 30 days
    const deletedCount = await deleteOldArticles(30);

    console.log(`Saved ${savedCount} articles, ${errorCount} errors, deleted ${deletedCount} old articles`);

    return NextResponse.json({
      message: 'Articles fetched and cleaned successfully',
      saved: savedCount,
      deleted: deletedCount,
      total: uniqueArticles.length,
      errors: errorCount,
    });
  } catch (error) {
    console.error('Error fetching Sheffield Wednesday articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles', details: String(error) }, { status: 500 });
  }
}