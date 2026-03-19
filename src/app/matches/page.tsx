"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ── Types ────────────────────────────────────────────────────────────────────

type Match = {
  id: number;
  date: string; // ISO: "YYYY-MM-DD"
  time: string; // e.g. "15:00"
  home: string;
  away: string;
  venue: string;
  competition: string;
  status: "FT" | "Upcoming";
  score?: string; // e.g. "2-1"
};

type Filter = "All" | "Results" | "Upcoming";

// ── Static data ───────────────────────────────────────────────────────────────

const allMatches: Match[] = [
  // ── August 2024 ──────────────────────────────────────────────────────────
  {
    id: 1,
    date: "2024-08-10",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Sunderland",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "1-1",
  },
  {
    id: 2,
    date: "2024-08-17",
    time: "15:00",
    home: "Stoke City",
    away: "Sheffield Wednesday",
    venue: "bet365 Stadium",
    competition: "Championship",
    status: "FT",
    score: "0-2",
  },
  {
    id: 3,
    date: "2024-08-24",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Cardiff City",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "3-0",
  },
  // ── September 2024 ───────────────────────────────────────────────────────
  {
    id: 4,
    date: "2024-09-14",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Middlesbrough",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-2",
  },
  {
    id: 5,
    date: "2024-09-21",
    time: "15:00",
    home: "Bristol City",
    away: "Sheffield Wednesday",
    venue: "Ashton Gate",
    competition: "Championship",
    status: "FT",
    score: "1-3",
  },
  {
    id: 6,
    date: "2024-09-28",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Burnley",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "1-2",
  },
  // ── October 2024 ─────────────────────────────────────────────────────────
  {
    id: 7,
    date: "2024-10-05",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Derby County",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-0",
  },
  {
    id: 8,
    date: "2024-10-19",
    time: "15:00",
    home: "Norwich City",
    away: "Sheffield Wednesday",
    venue: "Carrow Road",
    competition: "Championship",
    status: "FT",
    score: "2-2",
  },
  {
    id: 9,
    date: "2024-10-26",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Leeds United",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "1-0",
  },
  // ── November 2024 ────────────────────────────────────────────────────────
  {
    id: 10,
    date: "2024-11-02",
    time: "15:00",
    home: "Blackburn Rovers",
    away: "Sheffield Wednesday",
    venue: "Ewood Park",
    competition: "Championship",
    status: "FT",
    score: "0-1",
  },
  {
    id: 11,
    date: "2024-11-09",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Hull City",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-1",
  },
  {
    id: 12,
    date: "2024-11-23",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Luton Town",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "0-0",
  },
  // ── December 2024 ────────────────────────────────────────────────────────
  {
    id: 13,
    date: "2024-12-07",
    time: "15:00",
    home: "Coventry City",
    away: "Sheffield Wednesday",
    venue: "Coventry Building Society Arena",
    competition: "Championship",
    status: "FT",
    score: "1-2",
  },
  {
    id: 14,
    date: "2024-12-14",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Preston North End",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "3-1",
  },
  {
    id: 15,
    date: "2024-12-21",
    time: "15:00",
    home: "Swansea City",
    away: "Sheffield Wednesday",
    venue: "Swansea.com Stadium",
    competition: "Championship",
    status: "FT",
    score: "0-2",
  },
  {
    id: 16,
    date: "2024-12-26",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Plymouth Argyle",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "1-0",
  },
  // ── January 2025 ─────────────────────────────────────────────────────────
  {
    id: 17,
    date: "2025-01-04",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Watford",
    venue: "Hillsborough",
    competition: "FA Cup",
    status: "FT",
    score: "2-1",
  },
  {
    id: 18,
    date: "2025-01-11",
    time: "15:00",
    home: "Millwall",
    away: "Sheffield Wednesday",
    venue: "The Den",
    competition: "Championship",
    status: "FT",
    score: "1-1",
  },
  {
    id: 19,
    date: "2025-01-18",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "QPR",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-0",
  },
  {
    id: 20,
    date: "2025-01-25",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Tottenham Hotspur",
    venue: "Hillsborough",
    competition: "FA Cup",
    status: "FT",
    score: "0-1",
  },
  // ── February 2025 ────────────────────────────────────────────────────────
  {
    id: 21,
    date: "2025-02-01",
    time: "15:00",
    home: "Portsmouth",
    away: "Sheffield Wednesday",
    venue: "Fratton Park",
    competition: "Championship",
    status: "FT",
    score: "0-3",
  },
  {
    id: 22,
    date: "2025-02-08",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Oxford United",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-0",
  },
  {
    id: 23,
    date: "2025-02-15",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "West Brom",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "1-1",
  },
  {
    id: 24,
    date: "2025-02-22",
    time: "15:00",
    home: "Watford",
    away: "Sheffield Wednesday",
    venue: "Vicarage Road",
    competition: "Championship",
    status: "FT",
    score: "2-3",
  },
  // ── March 2025 ───────────────────────────────────────────────────────────
  {
    id: 25,
    date: "2025-03-01",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Ipswich Town",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "2-1",
  },
  {
    id: 26,
    date: "2025-03-08",
    time: "15:00",
    home: "Rotherham United",
    away: "Sheffield Wednesday",
    venue: "AESSEAL New York Stadium",
    competition: "Championship",
    status: "FT",
    score: "1-2",
  },
  {
    id: 27,
    date: "2025-03-15",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Burnley",
    venue: "Hillsborough",
    competition: "Championship",
    status: "FT",
    score: "0-0",
  },
  {
    id: 28,
    date: "2025-03-21",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Leeds United",
    venue: "Hillsborough",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 29,
    date: "2025-03-24",
    time: "19:45",
    home: "Norwich City",
    away: "Sheffield Wednesday",
    venue: "Carrow Road",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 30,
    date: "2025-03-28",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Hull City",
    venue: "Hillsborough",
    competition: "Championship",
    status: "Upcoming",
  },
  // ── April 2025 ───────────────────────────────────────────────────────────
  {
    id: 31,
    date: "2025-04-05",
    time: "15:00",
    home: "Coventry City",
    away: "Sheffield Wednesday",
    venue: "Coventry Building Society Arena",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 32,
    date: "2025-04-12",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Stoke City",
    venue: "Hillsborough",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 33,
    date: "2025-04-18",
    time: "19:45",
    home: "Derby County",
    away: "Sheffield Wednesday",
    venue: "Pride Park",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 34,
    date: "2025-04-21",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Middlesbrough",
    venue: "Hillsborough",
    competition: "Championship",
    status: "Upcoming",
  },
  {
    id: 35,
    date: "2025-04-26",
    time: "15:00",
    home: "Sheffield Wednesday",
    away: "Sunderland",
    venue: "Hillsborough",
    competition: "Championship",
    status: "Upcoming",
  },
  // ── May 2025 ─────────────────────────────────────────────────────────────
  {
    id: 36,
    date: "2025-05-03",
    time: "15:00",
    home: "Bristol City",
    away: "Sheffield Wednesday",
    venue: "Ashton Gate",
    competition: "Championship",
    status: "Upcoming",
  },
];

// Build a map of "YYYY-MM" → Match[]
const matchesByMonth: Record<string, Match[]> = {};
for (const match of allMatches) {
  const key = match.date.slice(0, 7);
  if (!matchesByMonth[key]) matchesByMonth[key] = [];
  matchesByMonth[key].push(match);
}

// Sorted unique month keys
const monthKeys = Object.keys(matchesByMonth).sort();

const monthLabels = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function isSwfc(team: string) {
  return team === "Sheffield Wednesday";
}

function resultColour(match: Match): string {
  if (match.status !== "FT" || !match.score) return "";
  const [homeGoals, awayGoals] = match.score.split("-").map(Number);
  const swfcIsHome = isSwfc(match.home);
  const swfcGoals = swfcIsHome ? homeGoals : awayGoals;
  const oppGoals = swfcIsHome ? awayGoals : homeGoals;
  if (swfcGoals > oppGoals) return "W";
  if (swfcGoals < oppGoals) return "L";
  return "D";
}

const resultBadgeClass: Record<string, string> = {
  W: "bg-green-100 text-green-700",
  D: "bg-yellow-100 text-yellow-700",
  L: "bg-red-100 text-red-700",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [monthIdx, setMonthIdx] = useState(() => {
    // Default to current/closest month
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const idx = monthKeys.indexOf(currentKey);
    return idx >= 0 ? idx : monthKeys.length - 1;
  });

  const currentMonthKey = monthKeys[monthIdx];
  const [year, month] = currentMonthKey.split("-").map(Number);
  const monthLabel = `${monthLabels[month - 1]} ${year}`;

  const matchesForMonth = useMemo(() => {
    const base = matchesByMonth[currentMonthKey] ?? [];
    return base.filter((m) => {
      if (filter === "Results" && m.status !== "FT") return false;
      if (filter === "Upcoming" && m.status !== "Upcoming") return false;
      if (search) {
        const q = search.toLowerCase();
        const searchable = `${m.home} ${m.away} ${m.competition} ${m.venue}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [currentMonthKey, filter, search]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />

      {/* ── Page hero ── */}
      <div className="bg-[#003399] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <CalendarDays size={28} />
            Fixtures &amp; Results
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            Sheffield Wednesday — 2024/25 season
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Month navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-gray-800 w-40 text-center">{monthLabel}</span>
            <button
              onClick={() => setMonthIdx((i) => Math.min(monthKeys.length - 1, i + 1))}
              disabled={monthIdx === monthKeys.length - 1}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 sm:ml-auto">
            {(["All", "Results", "Upcoming"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === f
                    ? "bg-[#003399] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Match list ── */}
        {matchesForMonth.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No matches found for {monthLabel}</p>
            <p className="text-sm mt-1">Try adjusting the filter or navigating to another month.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchesForMonth.map((match, i) => {
              const result = resultColour(match);
              const swfcIsHome = isSwfc(match.home);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Date / time column */}
                        <div className="flex-none sm:w-36 text-sm text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1 font-medium text-gray-700">
                            <CalendarDays size={14} className="text-[#003399]" />
                            {formatDate(match.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock3 size={14} className="text-gray-400" />
                            {match.time}
                          </div>
                        </div>

                        {/* Teams + score */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {/* Home team */}
                            <span
                              className={`text-sm sm:text-base font-semibold flex-1 text-right ${
                                isSwfc(match.home) ? "text-[#003399]" : "text-gray-800"
                              }`}
                            >
                              {match.home}
                            </span>

                            {/* Score / KO */}
                            <div className="flex-none w-16 text-center">
                              {match.status === "FT" ? (
                                <div>
                                  <span className="text-lg font-bold text-gray-900">
                                    {match.score}
                                  </span>
                                  <div className="text-xs text-gray-400">FT</div>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-sm font-semibold text-[#003399]">
                                    vs
                                  </span>
                                  <div className="text-xs text-gray-400">{match.time}</div>
                                </div>
                              )}
                            </div>

                            {/* Away team */}
                            <span
                              className={`text-sm sm:text-base font-semibold flex-1 ${
                                isSwfc(match.away) ? "text-[#003399]" : "text-gray-800"
                              }`}
                            >
                              {match.away}
                            </span>
                          </div>
                        </div>

                        {/* Meta column */}
                        <div className="flex-none flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:w-36">
                          {/* Result badge or Upcoming */}
                          {match.status === "FT" && result ? (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${resultBadgeClass[result]}`}
                            >
                              {result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
                            </span>
                          ) : (
                            <Badge className="bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20">
                              Upcoming
                            </Badge>
                          )}

                          {/* H/A badge */}
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              swfcIsHome
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {swfcIsHome ? "Home" : "Away"}
                          </span>
                        </div>
                      </div>

                      {/* Competition / venue row */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Trophy size={12} />
                          {match.competition}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {match.venue}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Season summary strip ── */}
        <SeasonSummary />
      </main>

      <Footer />
    </div>
  );
}

// ── Season summary ────────────────────────────────────────────────────────────

function SeasonSummary() {
  const results = allMatches.filter((m) => m.status === "FT");
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

  for (const m of results) {
    const r = resultColour(m);
    if (r === "W") wins++;
    else if (r === "D") draws++;
    else if (r === "L") losses++;

    if (m.score) {
      const [h, a] = m.score.split("-").map(Number);
      const swfcIsHome = isSwfc(m.home);
      goalsFor += swfcIsHome ? h : a;
      goalsAgainst += swfcIsHome ? a : h;
    }
  }

  const stats = [
    { label: "Played", value: results.length },
    { label: "Won", value: wins, colour: "text-green-600" },
    { label: "Drawn", value: draws, colour: "text-yellow-600" },
    { label: "Lost", value: losses, colour: "text-red-600" },
    { label: "GF", value: goalsFor },
    { label: "GA", value: goalsAgainst },
    {
      label: "GD",
      value: goalsFor - goalsAgainst,
      colour: goalsFor - goalsAgainst >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <Card className="mt-6">
      <CardContent className="p-4 sm:p-5">
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-[#003399]" />
          2024/25 Season at a Glance
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-xl font-bold ${s.colour ?? "text-gray-900"}`}>
                {s.value}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}