'use client';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  ChevronRight,
  Play,
  Trophy,
  MessageSquare,
  ArrowRight,
  CalendarDays,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categories = ["All", "Latest", "Match Report", "Transfer", "Opinion", "Fan Zone", "Club News"];
const DEFAULT_ARTICLE_IMAGE = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80";

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
  const isNewsArticle = 'imageUrl' in article;
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
          <Badge>{article.category}</Badge>
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Fetch latest news
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingArticles(true);
        const response = await fetch('/api/news/latest?limit=50', { cache: 'no-store' });
        const data = await response.json();
        setLatestNews(data.articles || data);
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
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, latestNews]);

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
        {/* ── Category tabs ── */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-[#003399] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
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

        {/* ── Articles Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loadingArticles ? (
            <p className="text-gray-500 text-sm py-6 text-center col-span-full">Loading articles...</p>
          ) : filteredNews.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center col-span-full">
              No articles match your search.
            </p>
          ) : (
            filteredNews.map((item, i) => (
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
      </main>

      <Footer />
    </div>
  );
}