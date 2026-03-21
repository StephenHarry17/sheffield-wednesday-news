"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Clock3,
  FileText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SiteArticle {
  id: number;
  title: string;
  content: string;
  excerpt?: string | null;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author?: {
    id: number;
    email: string;
    name?: string | null;
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

function ArticleCard({ article }: { article: SiteArticle }) {
  const cleanContent = stripHtml(article.content || "");
  const excerpt =
    article.excerpt?.trim() ||
    cleanContent.slice(0, 140) + (cleanContent.length > 140 ? "..." : "");

  return (
    <Link href={`/article/${article.slug}`} className="block h-full">
      <Card className="h-full border-gray-200 hover:shadow-md transition-shadow group">
        <CardContent className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Badge className="bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/10">
              Article
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock3 size={12} />
              <span>{readingTime(cleanContent)} min read</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#003399] transition-colors line-clamp-2">
            {article.title}
          </h2>

          <p className="text-sm text-gray-600 leading-6 line-clamp-3 mb-4 flex-1">
            {excerpt}
          </p>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {formatDate(article.createdAt)}
            </div>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-[#003399]">
              Read article <ChevronRight size={14} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<SiteArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "updated">("newest");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/articles", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.articles)
            ? data.articles
            : [];

        const publishedOnly = items.filter((article: SiteArticle) => article.published);
        setArticles(publishedOnly);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = articles.filter((article) => {
      const cleanContent = stripHtml(article.content || "");
      return (
        article.title.toLowerCase().includes(query) ||
        (article.excerpt || "").toLowerCase().includes(query) ||
        cleanContent.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (sortBy === "updated") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [articles, search, sortBy]);

  const featuredArticle = filteredArticles[0] || null;
  const archiveArticles = featuredArticle
    ? filteredArticles.filter((article) => article.id !== featuredArticle.id)
    : [];

  const featuredExcerpt = featuredArticle
    ? featuredArticle.excerpt?.trim() ||
      stripHtml(featuredArticle.content || "").slice(0, 220) +
        (stripHtml(featuredArticle.content || "").length > 220 ? "..." : "")
    : "";

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#003399]/10">
            <FileText size={20} className="text-[#003399]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Articles
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Match previews, opinion, features and Sheffield Wednesday long-form content.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "newest"
                ? "bg-[#003399] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("updated")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "updated"
                ? "bg-[#003399] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recently updated
          </button>
          <button
            onClick={() => setSortBy("oldest")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "oldest"
                ? "bg-[#003399] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Oldest
          </button>
        </div>
      </section>

      {loading ? (
        <section className="py-12">
          <p className="text-sm text-gray-500 text-center">Loading articles...</p>
        </section>
      ) : filteredArticles.length === 0 ? (
        <section className="py-12">
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No articles found
              </h2>
              <p className="text-sm text-gray-600">
                Try a different search term or publish your first article to get started.
              </p>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {featuredArticle && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003399] via-[#002b80] to-[#00184d] shadow-lg">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FFFF00]/10 rounded-full blur-3xl" />

                <div className="relative p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-white text-[#003399] font-semibold">
                      Featured Article
                    </Badge>
                    <Badge className="bg-white/15 text-white border border-white/20">
                      {formatDate(featuredArticle.createdAt)}
                    </Badge>
                    <Badge className="bg-white/15 text-white border border-white/20">
                      {readingTime(stripHtml(featuredArticle.content || ""))} min read
                    </Badge>
                  </div>

                  <div className="max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-blue-100 text-base sm:text-lg leading-7 mb-6 max-w-2xl">
                      {featuredExcerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link href={`/article/${featuredArticle.slug}`}>
                        <Button
  size="lg"
  className="bg-[#001f66] text-white hover:bg-[#002b80] font-semibold shadow-md"
>
  Read article <ArrowRight size={16} className="ml-2" />
</Button>
                      </Link>

                      {featuredArticle.author?.name && (
                        <span className="text-sm text-blue-100">
                          By {featuredArticle.author.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Archive</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Browse all published Sheffield Wednesday articles.
                </p>
              </div>

              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {(archiveArticles.length > 0 ? archiveArticles : filteredArticles).map(
                (article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <ArticleCard article={article} />
                  </motion.div>
                )
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}