'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (error || !article) return <p className="text-center py-8 text-red-600">{error || 'Article not found'}</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/news" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to News
        </Link>

        <article className="bg-white rounded-lg shadow-md p-8">
          {article.isBreaking && (
            <span className="inline-block mb-4 px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
              BREAKING NEWS
            </span>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

          <div className="flex justify-between items-center text-sm text-gray-600 mb-6 pb-6 border-b">
            <div>
              <p>
                <strong>Source:</strong>{' '}
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {article.source}
                </a>
              </p>
              <p>
                <strong>Category:</strong> {article.category}
              </p>
            </div>
            <div className="text-right">
              <p>👁️ {article.viewCount} views</p>
              <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
            </div>
          </div>

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6 italic">{article.excerpt}</p>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}