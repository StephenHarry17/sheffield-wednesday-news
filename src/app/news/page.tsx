'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  X,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navLinks = ["Home", "News", "Matches", "Transfers", "Opinion", "Fan Zone", "Club"];

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  isBreaking: boolean;
  viewCount: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [page, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/news/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
        : `/api/news?page=${page}`;

      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* ── Header/Navigation ── */}
      <header className="sticky top-0 z-50 bg-[#003399] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-[#FFFF00] text-[#003399] font-black text-lg w-9 h-9 rounded flex items-center justify-center select-none">
                SW
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">
                Sheffield Wednesday News
              </span>
              <span className="font-bold text-base tracking-tight sm:hidden">
                SW News
              </span>
            </div>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const href =
                  link === "Home"
                    ? "/"
                    : link === "News"
                    ? "/news"
                    : link === "Matches"
                    ? "/matches"
                    : `/${link.toLowerCase().replace(" ", "-")}`;

                return (
                  <Link
                    key={link}
                    href={href}
                    className="px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    {link}
                  </Link>
                );
              })}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Toggle search"
              >
                <Search size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 md:hidden"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-3 flex flex-col gap-1"
            >
              {navLinks.map((link) => {
                const href =
                  link === "Home"
                    ? "/"
                    : link === "News"
                    ? "/news"
                    : link === "Matches"
                    ? "/matches"
                    : `/${link.toLowerCase().replace(" ", "-")}`;

                return (
                  <Link
                    key={link}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm"
                  >
                    {link}
                  </Link>
                );
              })}
            </motion.nav>
          )}

          {/* Search bar */}
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-3"
            >
              <Input
                placeholder="Search news…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900"
                autoFocus
              />
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sheffield Wednesday News</h1>
          <p className="text-gray-600">Latest news and updates about SWFC</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399]"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#003399] text-white rounded-lg hover:bg-[#002266]"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Loading */}
        {loading && <p className="text-center text-gray-600">Loading articles...</p>}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/news/${article.id}`}>
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {article.isBreaking && (
                        <span className="inline-block mb-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          BREAKING
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{article.source}</span>
                        <span>👁️ {article.viewCount}</span>
                      </div>
                      <time className="text-xs text-gray-400 mt-2 block">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </time>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && (
          <p className="text-center text-gray-600 py-8">No articles found</p>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#003399] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFFF00] text-[#003399] font-black text-lg w-9 h-9 rounded flex items-center justify-center select-none">
                SW
              </div>
              <div>
                <p className="font-bold">Sheffield Wednesday News</p>
                <p className="text-blue-200 text-xs">Your home for the latest Owls updates</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm">Up the Owls! 🦉</p>
          </div>
        </div>
      </footer>
    </div>
  );
}