'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, Calendar, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  isBreaking: boolean;
  viewCount: number;
  category: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${id}`);
        if (!response.ok) throw new Error('Article not found');
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        setError('Failed to load article');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full py-8">
        {/* Back link */}
        <Link 
          href="/news" 
          className="inline-flex items-center gap-2 text-[#003399] hover:text-[#002080] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to News
        </Link>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading article...</p>
          </div>
        ) : error || !article ? (
          <div className="text-center py-16">
            <p className="text-red-600 font-semibold">{error || 'Article not found'}</p>
          </div>
        ) : (
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Article header */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              {article.isBreaking && (
                <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-100">
                  🔴 BREAKING NEWS
                </Badge>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Article meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#003399]" />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#003399]" />
                  <span>{article.viewCount.toLocaleString()} views</span>
                </div>
                <div className="text-xs">
                  <Badge className="border border-gray-300 text-gray-700">{article.source}</Badge>
                </div>
              </div>
            </div>

            {/* Featured image */}
            {article.imageUrl && (
              <div className="relative h-96 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Excerpt */}
              <p className="text-lg text-gray-700 italic font-medium leading-relaxed">
                {article.excerpt}
              </p>

              {/* Summary (limited to 4 lines) */}
              <div className="prose prose-sm sm:prose-base max-w-none">
                <div
                  className="text-gray-700 leading-relaxed space-y-4 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Call to action */}
              <div className="pt-6 border-t border-gray-200 bg-blue-50 rounded-lg p-4 sm:p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Read the complete article on the original source website.
                </p>
                <a 
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#003399] text-white px-6 py-2 rounded hover:bg-[#002080] transition-colors font-semibold"
                >
                  <ExternalLink size={16} />
                  Read Full Article on {article.source}
                </a>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}