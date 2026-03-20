"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const videosPerPage = 12;

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [videoFilter, setVideoFilter] = useState<"all" | "official">("official");
  const [page, setPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/videos", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }

        const data = await response.json();
        const videosArray = Array.isArray(data) ? data : data.videos || [];
        setVideos(videosArray);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos
  const filteredVideos = useMemo(() => {
    let result =
      videoFilter === "official"
        ? videos.filter((v) => v.isOfficial === true)
        : videos;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [videos, videoFilter, search]);

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const paginatedVideos = filteredVideos.slice(
    page * videosPerPage,
    (page + 1) * videosPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [videoFilter]);

  // NOTE: Header/Footer now come from src/app/layout.tsx (global)
  return (
    <>
      {/* ── Page hero ── */}
      <div className="bg-[#003399] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Play size={28} />
            Videos
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            Sheffield Wednesday highlights, interviews &amp; behind the scenes
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search videos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 sm:ml-auto">
            {(["official", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setVideoFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  videoFilter === f
                    ? "bg-[#003399] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "official" ? "SWFC Official" : "All Videos"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Video grid ── */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <Play size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Play size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No videos found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="block w-full text-left"
                  >
                    <Card className="overflow-hidden cursor-pointer group hover:shadow-md transition-shadow h-full flex flex-col">
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
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#003399] transition-colors leading-snug line-clamp-2">
                          {video.title}
                        </h3>

                        {video.channelTitle && (
                          <p className="text-xs text-gray-500 mt-2">
                            {video.channelTitle}
                          </p>
                        )}

                        <div className="text-xs text-gray-400 mt-auto pt-2">
                          {new Date(video.publishedAt).toLocaleDateString(
                            "en-GB",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                        page === i
                          ? "bg-[#003399] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Video Modal ── */}
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
    </>
  );
}