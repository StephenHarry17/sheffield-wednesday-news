"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, X, ChevronRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type CreatorKey =
  | "All"
  | "Official"
  | "WTID"
  | "Where Owls Walk"
  | "All Wednesday Podcast"
  | "sheffcam4960"
  | "Punkchef41"
  | "TWW Podcast";

const CREATOR_MATCHERS: Record<
  Exclude<CreatorKey, "All">,
  { label: string; matches: (v: Video) => boolean; href?: string }
> = {
  Official: {
    label: "officialswfc",
    matches: (v) => v.isOfficial === true || textOf(v).includes("officialswfc"),
    href: "https://www.youtube.com/@officialswfc",
  },
  WTID: {
    label: "WTIDPOD",
    matches: (v) => textOf(v).includes("wtid") || textOf(v).includes("wtidpod"),
    href: "https://www.youtube.com/@WTIDPOD",
  },
  "Where Owls Walk": {
    label: "Where Owls Walk",
    matches: (v) => textOf(v).includes("where owls walk"),
    href: "https://www.youtube.com/@WhereOwlsWalk",
  },
  "All Wednesday Podcast": {
    label: "All Wednesday Podcast",
    matches: (v) => textOf(v).includes("all wednesday"),
    href: "https://www.youtube.com/@AllWednesdayPodcast",
  },
  sheffcam4960: {
    label: "sheffcam4960",
    matches: (v) =>
      textOf(v).includes("sheffcam4960") || textOf(v).includes("sheffcam"),
    href: "https://www.youtube.com/@sheffcam4960",
  },
  Punkchef41: {
    label: "Punkchef41",
    matches: (v) =>
      textOf(v).includes("punkchef41") || textOf(v).includes("punkchef"),
    href: "https://www.youtube.com/@Punkchef41",
  },
  "TWW Podcast": {
    label: "twwpodcast",
    matches: (v) => textOf(v).includes("tww") || textOf(v).includes("twwpodcast"),
    href: "https://www.youtube.com/@twwpodcast",
  },
};

function textOf(v: Video): string {
  return `${v.channelTitle ?? ""} ${v.title ?? ""} ${v.description ?? ""}`.toLowerCase();
}

export default function OpinionPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [creator, setCreator] = useState<CreatorKey>("All");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/videos", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const videosArray = Array.isArray(data) ? data : data.videos || [];
        setVideos(videosArray);
      } catch (e) {
        console.error("Error fetching videos for opinion page:", e);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const creatorKeys = useMemo<CreatorKey[]>(() => {
    return [
      "All",
      "Official",
      "WTID",
      "Where Owls Walk",
      "All Wednesday Podcast",
      "sheffcam4960",
      "Punkchef41",
      "TWW Podcast",
    ];
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...videos].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (creator === "All") return sorted;

    const matcher = CREATOR_MATCHERS[creator as Exclude<CreatorKey, "All">]?.matches;
    if (!matcher) return sorted;

    return sorted.filter(matcher);
  }, [videos, creator]);

  const hero = filtered[0] ?? null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Opinion</h1>
        <p className="text-sm text-gray-600">
          A curated feed of Sheffield Wednesday creators (podcasts, fan channels,
          match reactions). Content is provided by third parties and may not
          reflect the views of Sheffield Wednesday FC.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {creatorKeys.map((key) => {
          const active = creator === key;
          const href =
            key !== "All"
              ? CREATOR_MATCHERS[key as Exclude<CreatorKey, "All">]?.href
              : undefined;

          return (
            <button
              key={key}
              onClick={() => setCreator(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                active
                  ? "bg-[#003399] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={href ? `Source: ${href}` : undefined}
            >
              {key}
            </button>
          );
        })}
      </div>

      {hero && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedVideo(hero)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedVideo(hero);
              }
            }}
            className="block w-full text-left"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-lg cursor-pointer group bg-[#071433]">
              <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.thumbnail}
                  alt={hero.title}
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.thumbnail}
                  alt={hero.title}
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
                    {hero.channelTitle ?? "YouTube"}
                  </Badge>

                  <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-4 max-w-xl">
                    {hero.title}
                  </h2>

                  {hero.description && (
                    <p className="text-blue-100 text-sm sm:text-base mb-5 line-clamp-3 max-w-xl">
                      {hero.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                      <Clock3 size={14} />
                      <span>
                        {new Date(hero.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="bg-[#001f66] text-white hover:bg-[#002b80] font-semibold border border-white/20 shadow-sm hover:shadow-md transition-all"
                    >
                      Watch now <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Latest</h2>
          <Link href="/videos" className="text-sm text-[#003399] hover:underline">
            Browse all videos
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm py-6">Loading creator videos…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm py-6">
            No videos found for this creator yet. (This depends on what your
            `/api/videos` is currently ingesting.)
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 18).map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => setSelectedVideo(video)}
                  className="block w-full text-left"
                >
                  <Card className="overflow-hidden cursor-pointer group hover:shadow-md transition-shadow h-full">
                    <div className="relative">
                      <div className="relative w-full aspect-video bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play
                            size={20}
                            className="text-[#003399] ml-1"
                            fill="#003399"
                          />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-gray-100 text-gray-700">
                          {video.channelTitle ?? "YouTube"}
                        </Badge>
                        {video.isOfficial && (
                          <Badge className="bg-[#003399]">Official</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(video.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

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

            <div className="p-4 space-y-2">
              <h3 className="font-bold text-lg text-gray-900">
                {selectedVideo.title}
              </h3>
              {selectedVideo.description && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}