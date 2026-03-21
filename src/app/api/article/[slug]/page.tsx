import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#003399] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-200 mb-3">
            Match Centre
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-3xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-blue-100 text-base sm:text-lg mt-4 max-w-2xl">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100 mt-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author?.name || "Unknown author"}</span>
            </div>

            <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}