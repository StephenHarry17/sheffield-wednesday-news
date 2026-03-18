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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const featuredArticle = {
  category: "Match Report",
  title: "Wednesday produce statement win under the Hillsborough lights",
  summary:
    "A dominant second-half display, a relentless press, and a packed South Stand atmosphere give the Owls a night to remember.",
  image:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80",
  time: "2 hours ago",
};

const topStories = [
  {
    category: "Transfer",
    title: "Three realistic summer targets Sheffield Wednesday should be watching",
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    time: "4 hours ago",
  },
  {
    category: "Opinion",
    title: "Why Wednesday's midfield balance is finally starting to click",
    image:
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=900&q=80",
    time: "6 hours ago",
  },
  {
    category: "Fan Zone",
    title: "What the Wednesday faithful made of the latest performance",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
    time: "8 hours ago",
  },
];

const latestNews = [
  {
    category: "Latest",
    title: "Injury boost as key defender returns to full training",
    excerpt:
      "A timely return ahead of a crucial run of fixtures gives the Owls more stability at the back.",
    time: "1 hour ago",
  },
  {
    category: "Matches",
    title: "Five tactical moments that changed the game for Wednesday",
    excerpt:
      "From pressing triggers to aggressive wide overloads, these were the moments that swung control.",
    time: "3 hours ago",
  },
  {
    category: "Transfers",
    title: "Loan market could be decisive again as planning begins early",
    excerpt:
      "Recruitment will likely focus on athleticism, depth, and players capable of raising the technical floor.",
    time: "5 hours ago",
  },
  {
    category: "Fan Zone",
    title: "Best away-day chants, ranked by Wednesday supporters",
    excerpt:
      "A look at the songs, atmosphere, and rituals that make following the Owls what it is.",
    time: "9 hours ago",
  },
  {
    category: "Opinion",
    title: "Should Wednesday build around youth or experience next season?",
    excerpt:
      "There is no perfect answer, but the trade-offs are becoming clearer with every performance.",
    time: "11 hours ago",
  },
  {
    category: "Club",
    title: "Inside the week: training intensity, recovery, and preparation",
    excerpt:
      "Small details in schedule design can make a major difference over the course of a demanding season.",
    time: "13 hours ago",
  },
];

const categories = ["All", "Latest", "Matches", "Transfers", "Opinion", "Fan Zone", "Club"];

interface Fixture {
  id: number;
  opponent: string;
  venue: string;
  date: string;
  competition: string;
}

interface Video {
  id: number;
  title: string;
  videoId: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
}

interface ArticleCardProps {
  article: {
    category: string;
    title: string;
    image?: string;
    time: string;
    excerpt?: string;
  };
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
      {article.image && (
        <div className="relative h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge>{article.category}</Badge>
          </div>
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        {!article.image && (
          <Badge>{article.category}</Badge>
        )}
        <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-[#003399] transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
          <Clock3 size={12} />
          <span>{article.time}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SheffieldWednesdayNewsSite() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoPage, setVideoPage] = useState(0);
  const videosPerPage = 6;

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch('/api/matches', {
          cache: 'no-store',
        });
        const data = await response.json();
        
        const now = new Date();
        const upcomingFixtures = data
          .filter((match: any) => new Date(match.date) > now)
          .slice(0, 3)
          .map((match: any) => ({
            id: match.id,
            opponent: match.opponent,
            venue: match.venue,
            date: new Date(match.date).toLocaleDateString('en-GB', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            competition: match.competition,
          }));
        
        setFixtures(upcomingFixtures);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchFixtures();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
        const data = await response.json();
        console.log('Fetched videos:', data.length);
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredNews = useMemo(() => {
    return latestNews.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-12 flex-1">
        {/* ── Featured Article ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredArticle.image}
              alt={featuredArticle.title}
              className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <Badge className="mb-3">{featuredArticle.category}</Badge>
              <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2 max-w-2xl">
                {featuredArticle.title}
              </h2>
              <p className="text-gray-200 text-sm sm:text-base mb-4 max-w-xl">
                {featuredArticle.summary}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <Clock3 size={14} />
                  <span>{featuredArticle.time}</span>
                </div>
                <Button size="sm" className="bg-[#FFFF00] text-[#003399] hover:bg-yellow-300 font-semibold">
                  Read more <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Top Stories ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-[#003399]" />
              Top Stories
            </h2>
            <button className="text-sm text-[#003399] flex items-center gap-1 hover:underline">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {topStories.map((story, i) => (
              <motion.div
                key={story.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ArticleCard article={story} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Latest News + Fixtures sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest News */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#003399]" />
                Latest News
              </h2>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Inline search (when header search is closed) */}
            {!searchOpen && (
              <div className="relative mb-5">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search latest news…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <div className="space-y-3">
              {filteredNews.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">
                  No articles match your search.
                </p>
              ) : (
                filteredNews.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <Badge>{item.category}</Badge>
                          <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-[#003399] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 pt-0.5">
                            <Clock3 size={12} />
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-[#003399] transition-colors mt-1 shrink-0" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Sidebar – Fixtures */}
          <aside className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-[#003399]" />
                Upcoming Fixtures
              </h2>
              <div className="space-y-3">
                {loadingFixtures ? (
                  <p className="text-gray-500 text-sm text-center py-4">Loading fixtures...</p>
                ) : fixtures.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No upcoming fixtures</p>
                ) : (
                  fixtures.map((fixture) => (
                    <Card key={`${fixture.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{fixture.competition}</span>
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

        {/* ── Videos ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Play size={20} className="text-[#003399]" />
              Videos
            </h2>
            <a 
              href="https://www.youtube.com/@officialswfc/videos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#003399] flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight size={14} />
            </a>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {loadingVideos ? (
                <p className="text-gray-500 text-sm text-center py-4 col-span-full">Loading videos...</p>
              ) : videos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4 col-span-full">No videos available</p>
              ) : (
                videos.slice(videoPage * videosPerPage, (videoPage + 1) * videosPerPage).map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
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
                              <Play size={20} className="text-[#003399] ml-1" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                            {video.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pagination arrows */}
            {videos.length > videosPerPage && (
              <div className="flex items-center justify-between mt-6">
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
                  {videoPage + 1} / {Math.ceil(videos.length / videosPerPage)}
                </span>

                <Button
                  onClick={() => setVideoPage(Math.min(Math.ceil(videos.length / videosPerPage) - 1, videoPage + 1))}
                  disabled={videoPage >= Math.ceil(videos.length / videosPerPage) - 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}