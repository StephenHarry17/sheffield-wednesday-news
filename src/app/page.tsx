"use client";

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
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const DEFAULT_ARTICLE_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80";

interface Fixture {
  id: string;
  opponent: string;
  venue: string;
  date: string;
  competition: string;
}

interface Video {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  channelTitle?: string;
  isOfficial?: boolean;
}

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
  article:
    | NewsArticle
    | {
        category: string;
        title: string;
        image?: string;
        time: string;
        excerpt?: string;
      };
}

function ArticleCard({ article }: ArticleCardProps) {
  const isNewsArticle = "imageUrl" in article;
  const imageUrl = isNewsArticle ? article.imageUrl : (article as any).image;
  const finalImageUrl = imageUrl || DEFAULT_ARTICLE_IMAGE;

  const timeDisplay = isNewsArticle
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
        {"source" in article && (
          <div className="absolute top-3 left-3">
            <Badge>{(article as NewsArticle).source}</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-[#003399] transition-colors line-clamp-2">
          {article.title}
        </h3>

        {"excerpt" in article && (article as any).excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">
            {(article as any).excerpt}
          </p>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 mt-auto">
          <Clock3 size={12} />
          <span>{timeDisplay}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as any).articles)
  ) {
    return (data as any).articles as T[];
  }
  return [];
}

export default function SheffieldWednesdayNewsSite() {
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);

  const [videos, setVideos] = useState<Video[]>([]);
  const [videoFilter, setVideoFilter] = useState<"all" | "official">("official");
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoPage, setVideoPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [topStories, setTopStories] = useState<NewsArticle[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<string[]>(["All", "Today"]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  const videosPerPage = 6;
  const fixturesToShow = 5;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/news/featured", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setFeaturedArticles(toArray<NewsArticle>(data));
      } catch (error) {
        console.error("Error fetching featured articles:", error);
        setFeaturedArticles([]);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const response = await fetch("/api/news/latest?limit=3", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const articles = toArray<NewsArticle>(data);
        setTopStories(articles);
      } catch (error) {
        console.error("Error fetching top stories:", error);
        setTopStories([]);
      }
    };

    fetchTopStories();
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingArticles(true);

        const response = await fetch("/api/news/latest?limit=100", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const articles = toArray<NewsArticle>(data);

        setLatestNews(articles);

        const uniqueSources = Array.from(
          new Set(articles.map((a: NewsArticle) => a.source).filter(Boolean))
        ) as string[];

        setSources(["All", "Today", ...uniqueSources.sort()]);
      } catch (error) {
        console.error("Error fetching latest news:", error);
        setLatestNews([]);
        setSources(["All", "Today"]);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchLatest();
  }, []);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch("/api/matches", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!Array.isArray(data)) {
          setFixtures([]);
          return;
        }

        const now = new Date();
        const upcomingFixtures = data
          .filter((match: any) => new Date(match.date) > now)
          .slice(0, fixturesToShow)
          .map((match: any) => {
            const isHome =
              match.home.toLowerCase().includes("sheffield") ||
              match.home.toLowerCase().includes("swfc");
            const opponent = isHome ? match.away : match.home;

            return {
              id: match.id,
              opponent,
              venue: isHome ? "Home" : "Away",
              date: new Date(match.date).toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
              competition: match.competition,
            };
          });

        setFixtures(upcomingFixtures);
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        setFixtures([]);
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchFixtures();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const videosArray = Array.isArray(data) ? data : data.videos || [];
        setVideos(videosArray);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredNews = useMemo(() => {
    return latestNews.filter((item) => {
      let matchesSource = true;

      if (activeSource === "All") {
        matchesSource = true;
      } else if (activeSource === "Today") {
        const today = new Date().toDateString();
        const articleDate = new Date(item.publishedAt).toDateString();
        matchesSource = today === articleDate;
      } else {
        matchesSource = item.source === activeSource;
      }

      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());

      return matchesSource && matchesSearch;
    });
  }, [search, activeSource, latestNews]);

  const filteredVideos =
    videoFilter === "official"
      ? videos.filter((v) => v.isOfficial === true)
      : videos;

  const latestOfficialVideo = useMemo(() => {
    const official = videos.filter((v) => v.isOfficial === true);
    official.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return official[0] ?? null;
  }, [videos]);

  const featuredArticle = featuredArticles[0] || {
    category: "Latest",
    title: "Loading featured article...",
    summary: "Check back soon for the latest Sheffield Wednesday news",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80",
    publishedAt: new Date().toISOString(),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {featuredArticles.length > 0 ? (
          <Link
            href={`/news/${(featuredArticle as any).id || "#"}`}
            className="block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  featuredArticle.imageUrl ||
                  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80"
                }
                alt={featuredArticle.title}
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <Badge className="mb-3">{(featuredArticle as any).source}</Badge>
                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2 max-w-2xl">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-200 text-sm sm:text-base mb-4 max-w-xl">
                  {(featuredArticle as any).summary ||
                    (featuredArticle as any).excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Clock3 size={14} />
                    <span>
                      {new Date(
                        (featuredArticle as any).publishedAt
                      ).toLocaleDateString("en-GB", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#FFFF00] text-[#003399] hover:bg-yellow-300 font-semibold"
                  >
                    Read more <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ) : latestOfficialVideo ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedVideo(latestOfficialVideo)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedVideo(latestOfficialVideo);
              }
            }}
            className="block w-full text-left"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-lg cursor-pointer group bg-[#071433]">
              <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-[420px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latestOfficialVideo.thumbnail}
                  alt={latestOfficialVideo.title}
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latestOfficialVideo.thumbnail}
                  alt={latestOfficialVideo.title}
                  className="absolute inset-0 w-full h-full object-contain p-4 sm:p-6"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-black/30" />
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-lg">
                    <Play size={40} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#003399] via-[#002b80] to-[#00184d]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FFFF00]/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <Badge className="mb-4 w-fit bg-white text-[#003399]">
                    {latestOfficialVideo.channelTitle ?? "SWFC Official"}
                  </Badge>

                  <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-4 max-w-xl">
                    {latestOfficialVideo.title}
                  </h2>

                  {latestOfficialVideo.description && (
                    <p className="text-blue-100 text-sm sm:text-base mb-5 line-clamp-3 max-w-xl">
                      {latestOfficialVideo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                      <Clock3 size={14} />
                      <span>
                        {new Date(
                          latestOfficialVideo.publishedAt
                        ).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="bg-[#001f66] text-white hover:bg-[#002b80] font-semibold border border-white/20"
                    >
                      Watch now <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <a
            href="https://www.bbc.co.uk/iplayer/episode/m002rkn3/selling-sheffield-wednesday"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://ichef.bbci.co.uk/images/ic/1920x1080/m/m002rkn3.jpg"
                alt="Selling Sheffield Wednesday"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                  <Play size={40} className="text-white ml-1" fill="white" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <Badge className="mb-3 bg-red-600">BBC iPlayer</Badge>
                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2 max-w-2xl">
                  Selling Sheffield Wednesday
                </h2>
                <p className="text-gray-200 text-sm sm:text-base mb-4 max-w-xl">
                  Explore the fascinating history and stories behind Sheffield
                  Wednesday FC
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    className="bg-[#FFFF00] text-[#003399] hover:bg-yellow-300 font-semibold"
                  >
                    Watch on BBC <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </a>
        )}
      </motion.div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={20} className="text-[#003399]" />
            Top Stories
          </h2>
          <Link
            href="/news"
            className="text-sm text-[#003399] flex items-center gap-1 hover:underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {topStories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/news/${story.id}`}>
                <ArticleCard article={story} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-[#003399]" />
              Latest News
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
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

          {!searchOpen && (
            <div className="relative mb-5">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search latest news…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingArticles ? (
              <p className="text-gray-500 text-sm py-6 text-center col-span-full">
                Loading articles...
              </p>
            ) : filteredNews.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center col-span-full">
                No articles found.
              </p>
            ) : (
              filteredNews.slice(0, 6).map((item, i) => (
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
        </section>

        <aside className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarDays size={20} className="text-[#003399]" />
              Upcoming Fixtures
            </h2>

            <div className="space-y-3">
              {loadingFixtures ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Loading fixtures...
                </p>
              ) : fixtures.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No upcoming fixtures
                </p>
              ) : (
                fixtures.map((fixture) => (
                  <Card
                    key={fixture.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">
                          {fixture.competition}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            fixture.venue === "Home"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {fixture.venue}
                        </span>
                      </div>

                      <p className="font-semibold text-gray-900">
                        {fixture.venue === "Home" ? "SWFC" : fixture.opponent} vs{" "}
                        {fixture.venue === "Home" ? fixture.opponent : "SWFC"}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <CalendarDays size={12} />
                        <span>{fixture.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Play size={20} className="text-[#003399]" />
            Videos
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setVideoFilter("official");
                setVideoPage(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                videoFilter === "official"
                  ? "bg-[#003399] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              SWFC Official
            </button>

            <button
              onClick={() => {
                setVideoFilter("all");
                setVideoPage(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                videoFilter === "all"
                  ? "bg-[#003399] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Videos
            </button>
          </div>

          <Link
            href="/videos"
            className="text-sm text-[#003399] flex items-center gap-1 hover:underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {loadingVideos ? (
              <p className="text-gray-500 text-sm text-center py-4 col-span-full">
                Loading videos...
              </p>
            ) : filteredVideos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4 col-span-full">
                No videos available
              </p>
            ) : (
              filteredVideos
                .slice(
                  videoPage * videosPerPage,
                  (videoPage + 1) * videosPerPage
                )
                .map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="block w-full text-left"
                    >
                      <Card className="overflow-hidden cursor-pointer group hover:shadow-md transition-shadow h-full">
                        <div className="relative h-48">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play
                                size={20}
                                className="text-[#003399] ml-1"
                                fill="#003399"
                              />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                            {video.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                ))
            )}
          </div>

          {filteredVideos.length > videosPerPage && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setVideoPage(Math.max(0, videoPage - 1))}
                disabled={videoPage === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronRight size={18} className="rotate-180" />
                Previous
              </Button>

              <span className="text-sm text-gray-500">
                {videoPage + 1} /{" "}
                {Math.ceil(filteredVideos.length / videosPerPage)}
              </span>

              <Button
                onClick={() =>
                  setVideoPage(
                    Math.min(
                      Math.ceil(filteredVideos.length / videosPerPage) - 1,
                      videoPage + 1
                    )
                  )
                }
                disabled={
                  videoPage >=
                  Math.ceil(filteredVideos.length / videosPerPage) - 1
                }
                variant="outline"
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            </div>
          )}

          {selectedVideo && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedVideo(null)}
            >
              <div
                className="bg-white rounded-lg overflow-hidden max-w-4xl w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 z-10 text-gray-700 hover:text-gray-900 bg-white rounded-full p-2"
                  aria-label="Close video"
                >
                  <X size={24} />
                </button>

                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h3>
                  {selectedVideo.description && (
                    <p className="text-sm text-gray-600">
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}