import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarDays,
  User,
  Clock3,
  Shield,
  ArrowLeft,
  Trophy,
  FileText,
} from "lucide-react";
import Link from "next/link";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeContent(content: string) {
  return content
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

function splitParagraphs(content: string) {
  return normalizeContent(content)
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractPrediction(content: string) {
  const normalized = normalizeContent(content);
  const match = normalized.match(/Prediction:\s*(.*)/i);
  return match ? match[1].trim() : null;
}

function getArticleImage(article: {
  heroImageUrl?: string | null;
  articleType?:
    | "news"
    | "match_preview"
    | "match_report"
    | "opinion"
    | "feature"
    | "transfer"
    | null;
}) {
  if (article.heroImageUrl) return article.heroImageUrl;

  switch (article.articleType) {
    case "match_preview":
      return "/images/defaults/match-preview.jpg";
    case "match_report":
      return "/images/defaults/match-report.jpg";
    case "opinion":
      return "/images/defaults/opinion.jpg";
    case "feature":
      return "/images/defaults/feature.jpg";
    case "transfer":
      return "/images/defaults/transfer.jpg";
    case "news":
    default:
      return "/images/defaults/news.jpg";
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      content: true,
      published: true,
      heroImageUrl: true,
      articleType: true,
    },
  });

  if (!article || !article.published) {
    return {
      title: "Article not found | WAWAW News",
      description: "The requested article could not be found.",
    };
  }

  const description = (
  article.excerpt ||
  normalizeContent(article.content).slice(0, 155) ||
  "Latest Sheffield Wednesday news and coverage from WAWAW News."
).trim();

  const image = getArticleImage(article);

  return {
    title: `${article.title} | WAWAW News`,
    description,
    openGraph: {
      title: `${article.title} | WAWAW News`,
      description,
      images: [image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | WAWAW News`,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
    },
  });

  if (!article || !article.published) {
    notFound();
  }

  const recentArticles = await prisma.article.findMany({
    where: {
      published: true,
      id: {
        not: article.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      articleType: true,
    },
  });

  const paragraphs = splitParagraphs(article.content);
  const prediction = extractPrediction(article.content);

  const cleanedParagraphs = paragraphs.filter(
    (p) => !p.toLowerCase().startsWith("prediction:")
  );

  const articleImage = getArticleImage(article);

  const articleTypeLabel =
    article.articleType === "match_preview"
      ? "Match Preview"
      : article.articleType === "match_report"
        ? "Match Report"
        : article.articleType === "opinion"
          ? "Opinion"
          : article.articleType === "feature"
            ? "Feature"
            : article.articleType === "transfer"
              ? "Transfer"
              : "Article";

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="bg-gradient-to-br from-[#003399] via-[#002b80] to-[#00184d] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to homepage
          </Link>

          <div className="mt-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFFF00] px-3 py-1 text-xs font-bold text-[#003399]">
                <Shield size={14} />
                {articleTypeLabel}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 border border-white/10">
                <Trophy size={14} />
                Sheffield Wednesday
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-blue-100 text-base sm:text-lg mt-4 max-w-3xl leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mt-6">
              <div className="inline-flex items-center gap-2">
                <User size={16} />
                <span>{article.author?.name || "Unknown author"}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                <span>
                  {new Date(article.createdAt).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                <span>
                  Updated{" "}
                  {new Date(article.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6">
        <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white">
          <img
            src={articleImage}
            alt={article.title}
            className="w-full h-[260px] sm:h-[340px] lg:h-[420px] object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="max-w-none">
              {cleanedParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[17px] leading-8 text-gray-700 mb-6 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <aside className="space-y-5">
            {prediction && (
              <div className="rounded-2xl border border-[#003399]/15 bg-[#003399]/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#003399] mb-2">
                  Prediction
                </p>
                <p className="text-lg font-bold text-gray-900">{prediction}</p>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Article details
              </p>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-[#003399] mt-0.5" />
                  <div>
                    <p className="text-gray-500">Author</p>
                    <p className="font-medium">
                      {article.author?.name || "Unknown author"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays size={16} className="text-[#003399] mt-0.5" />
                  <div>
                    <p className="text-gray-500">Published</p>
                    <p className="font-medium">
                      {new Date(article.createdAt).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Match Centre
              </p>
              <p className="text-sm text-gray-600 leading-6">
                Follow Sheffield Wednesday coverage, fixtures, previews, and
                post-match reaction across the site.
              </p>

              <div className="mt-4">
                <Link href="/matches">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#003399] hover:underline">
                    Go to fixtures & results
                    <ArrowLeft size={14} className="rotate-180" />
                  </span>
                </Link>
              </div>
            </div>

            {recentArticles.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  Recent articles
                </p>

                <div className="space-y-4">
                  {recentArticles.map((recentArticle) => {
                    const recentTypeLabel =
                      recentArticle.articleType === "match_preview"
                        ? "Match Preview"
                        : recentArticle.articleType === "match_report"
                          ? "Match Report"
                          : recentArticle.articleType === "opinion"
                            ? "Opinion"
                            : recentArticle.articleType === "feature"
                              ? "Feature"
                              : recentArticle.articleType === "transfer"
                                ? "Transfer"
                                : "Article";

                    return (
                      <Link
                        key={recentArticle.id}
                        href={`/article/${recentArticle.slug}`}
                        className="block group"
                      >
                        <div className="rounded-xl border border-gray-100 p-4 hover:border-[#003399]/20 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#003399] mb-2">
                            <FileText size={12} />
                            <span>{recentTypeLabel}</span>
                          </div>

                          <h3 className="text-sm font-semibold text-gray-900 leading-6 group-hover:text-[#003399] transition-colors line-clamp-2">
                            {recentArticle.title}
                          </h3>

                          {recentArticle.excerpt && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {recentArticle.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                            <CalendarDays size={12} />
                            <span>
                              {new Date(recentArticle.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}