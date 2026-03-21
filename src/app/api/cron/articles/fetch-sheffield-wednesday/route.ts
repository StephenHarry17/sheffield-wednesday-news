import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeArticleCategory } from "@/lib/gemini";

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

// Tuned for higher article volume
const DAYS_BACK = 14;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;

// Keywords that indicate a Sheffield Wednesday article
const SWFC_KEYWORDS = [
  "sheffield wednesday",
  "sheff wednesday",
  "swfc",
  "hillsborough",
  "wednesday fc",
];

// Keywords to exclude
const EXCLUDE_KEYWORDS = [
  "sheffield united",
  "sheffield wednesday avenue",
];

function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);

    const dropParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_id",
      "utm_name",
      "fbclid",
      "gclid",
    ];

    for (const p of dropParams) u.searchParams.delete(p);

    u.hash = "";
    u.hostname = u.hostname.replace(/^www\./, "");

    return u.toString();
  } catch {
    return url;
  }
}

function isSheffieldWednesdayArticle(
  title: string,
  excerpt: string,
  content: string
): boolean {
  const fullText = `${title} ${excerpt} ${content}`.toLowerCase();

  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
    fullText.includes(keyword)
  );
  if (hasExcludeKeyword) return false;

  const hasStrongKeyword = SWFC_KEYWORDS.some((keyword) =>
    fullText.includes(keyword)
  );

  if (hasStrongKeyword) return true;

  // Slightly looser fallback for articles that mention Sheffield + Wednesday context
  const hasSheffield = fullText.includes("sheffield");
  const hasWednesdayContext =
    fullText.includes("wednesday") ||
    fullText.includes("hillsborough") ||
    fullText.includes("swfc");

  return hasSheffield && hasWednesdayContext;
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
    console.error("Error deleting old articles:", error);
    return 0;
  }
}

function fromDateISO(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString();
}

async function fetchNewsApiEverything(query: string) {
  const from = fromDateISO(DAYS_BACK);
  const collected: any[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&sortBy=publishedAt&language=en&pageSize=${PAGE_SIZE}&page=${page}&from=${encodeURIComponent(
      from
    )}&apiKey=${NEWSAPI_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch NewsAPI for query "${query}" page ${page}: HTTP ${response.status}`
      );
      break;
    }

    const data = await response.json();
    const articles = data?.articles ?? [];

    if (articles.length === 0) {
      break;
    }

    console.log(
      `Found ${articles.length} raw articles for query "${query}" page ${page}`
    );

    const swArticles = articles.filter((article: any) =>
      isSheffieldWednesdayArticle(
        article.title || "",
        article.description || "",
        article.content || ""
      )
    );

    console.log(
      `Filtered to ${swArticles.length} SWFC articles for query "${query}" page ${page}`
    );

    collected.push(...swArticles);

    if (articles.length < PAGE_SIZE) break;
  }

  return collected;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (
      authHeader !== `Bearer ${CRON_SECRET}` &&
      key !== CRON_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!NEWSAPI_KEY) {
      return NextResponse.json(
        { error: "NEWSAPI_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("Starting Sheffield Wednesday article fetch...");

    const queries = [
      `"Sheffield Wednesday"`,
      `"Sheffield Wednesday FC"`,
      `"SWFC"`,
      `"Hillsborough" Sheffield Wednesday`,
      `"Sheffield Wednesday" transfer`,
      `"Sheffield Wednesday" injury`,
      `"Sheffield Wednesday" reaction`,
    ];

    let allArticles: any[] = [];

    for (const query of queries) {
      try {
        const articles = await fetchNewsApiEverything(query);
        allArticles = allArticles.concat(articles);
      } catch (error) {
        console.error(`Error fetching for query ${query}:`, error);
      }
    }

    const uniqueByUrl = new Map<string, any>();
    for (const a of allArticles) {
      if (!a?.url) continue;
      uniqueByUrl.set(canonicalizeUrl(a.url), a);
    }

    const uniqueArticles = Array.from(uniqueByUrl.values());

    console.log(
      `Total unique Sheffield Wednesday articles: ${uniqueArticles.length}`
    );

    if (uniqueArticles.length === 0) {
      return NextResponse.json({
        message: "No Sheffield Wednesday articles found",
        saved: 0,
        deleted: 0,
        debug: "No articles passed the filtering criteria",
      });
    }

    let savedCount = 0;
    let errorCount = 0;

    for (const article of uniqueArticles) {
      try {
        const sourceUrl = canonicalizeUrl(article.url);

        const category = await analyzeArticleCategory(
          article.title,
          article.description || ""
        );

        const fullContent = article.content
          ? `${article.description || ""}\n\n${article.content}`
          : article.description || "No content available";

        await prisma.newsArticle.upsert({
          where: { sourceUrl },
          update: {
            updatedAt: new Date(),
            title: article.title,
            excerpt: article.description,
            content: fullContent,
            imageUrl: article.urlToImage,
            category,
            publishedAt: article.publishedAt
              ? new Date(article.publishedAt)
              : undefined,
            source: article.source?.name || "NewsAPI",
          },
          create: {
            title: article.title,
            excerpt: article.description,
            content: fullContent,
            source: article.source?.name || "NewsAPI",
            sourceUrl,
            imageUrl: article.urlToImage,
            category,
            publishedAt: new Date(article.publishedAt),
          },
        });

        savedCount++;
      } catch (error) {
        console.error("Error saving article:", error);
        errorCount++;
      }
    }

    const deletedCount = await deleteOldArticles(30);

    console.log(
      `Saved ${savedCount} articles, ${errorCount} errors, deleted ${deletedCount} old articles`
    );

    return NextResponse.json({
      message: "Articles fetched and cleaned successfully",
      saved: savedCount,
      deleted: deletedCount,
      total: uniqueArticles.length,
      errors: errorCount,
      config: { DAYS_BACK, PAGE_SIZE, MAX_PAGES, queries: queries.length },
    });
  } catch (error) {
    console.error("Error fetching Sheffield Wednesday articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles", details: String(error) },
      { status: 500 }
    );
  }
}