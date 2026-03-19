'use client';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  ChevronRight,
  MessageSquare,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DEFAULT_ARTICLE_IMAGE = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80";
const ARTICLES_PER_PAGE = 12;

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  category: string;
  summary: string;
  isBreaking: boolean;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface ArticleCardProps {
  article: NewsArticle | {
    category: string;
    title: string;
    image?: string;
    time: string;
    excerpt?: string;
  };
}

function ArticleCard({ article }: ArticleCardProps) {
  const isNewsArticle = 'sourceUrl' in article;
  const imageUrl = isNewsArticle ? article.imageUrl : (article as any).image;
  const finalImageUrl = imageUrl || DEFAULT_ARTICLE_IMAGE;
  const timeDisplay = isNewsArticle 
    ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : (article as any).time;
  const source = isNewsArticle ? article.source : (article as any).category;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer h-full flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={finalImageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge>{source}</Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-[#003399] transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 mt-auto">
          <Clock3 size={12} />
          <span>{timeDisplay}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("All");
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<string[]>(['All', 'Today']);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch latest news
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingArticles(true);
        const response = await fetch('/api/news/latest?limit=100', { cache: 'no-store' });
        const data = await response.json();
        const articles = data.articles || data;
        setLatestNews(articles);
        
        // Extract unique sources
        const uniqueSources = Array.from(new Set(articles.map((a: NewsArticle) => a.source))) as string[];
setSources(['All', 'Today', ...uniqueSources.sort()]);
        
        setCurrentPage(1); // Reset to first page
      } catch (error) {
        console.error('Error fetching latest news:', error);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchLatest();
  }, []);

  const filteredNews = useMemo(() => {
    return latestNews.filter((item) => {
      let matchesSource = true;
      
      if (activeSource === 'All') {
        matchesSource = true;
      } else if (activeSource === 'Today') {
        // Show only articles from today
        const today = new Date().toDateString();
        const articleDate = new Date(item.publishedAt).toDateString();
        matchesSource = today === articleDate;
      } else {
        // Filter by source name
        matchesSource = item.source === activeSource;
      }

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());
      
      return matchesSource && matchesSearch;
    });
  }, [search, activeSource, latestNews]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeSource]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />

      {/* ── Page Hero ── */}
      <div className="bg-[#003399] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <MessageSquare size={28} />
            Latest News
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            Sheffield Wednesday — The latest Owls updates and stories
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* ── Source filter tabs ── */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSource === source
                  ? "bg-[#003399] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search news…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* ── Result count ── */}
        <div className="text-sm text-gray-500">
          {loadingArticles ? (
            'Loading...'
          ) : (
            <>
              Showing {paginatedNews.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ARTICLES_PER_PAGE, filteredNews.length)} of {filteredNews.length} articles
            </>
          )}
        </div>

        {/* ── Articles Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loadingArticles ? (
            <p className="text-gray-500 text-sm py-6 text-center col-span-full">Loading articles...</p>
          ) : paginatedNews.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center col-span-full">
              No articles found.
            </p>
          ) : (
            paginatedNews.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/news/${item.id}`}>
                  <ArticleCard article={item} />
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 flex items-center gap-2"
            >
              <ChevronRight size={16} className="rotate-180" />
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 ${currentPage === page ? "bg-[#003399] text-white" : ""}`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}