"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Trophy,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ────────────────────────────────────────────────────────────────────

type Match = {
  id: string;
  date: string; // ISO: "YYYY-MM-DD"
  time: string; // e.g. "15:00"
  home: string;
  away: string;
  venue: string;
  competition: string;
  status: "FT" | "Upcoming";
  score?: string; // e.g. "2-1"
};

type TableEntry = {
  id: string;
  position: number;
  teamId: number;
  teamName: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string | null;
  competition: string;
  season?: string | null;
};

type Filter = "All" | "Results" | "Upcoming";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isSwfc(team: string) {
  return team === "Sheffield Wednesday";
}

function parseScore(score?: string): [number, number] | null {
  if (!score) return null;

  const parts = score.split("-").map((n) => Number(n.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;

  return [parts[0], parts[1]];
}

function resultColour(match: Match): "W" | "D" | "L" | "" {
  if (match.status !== "FT") return "";

  const parsed = parseScore(match.score);
  if (!parsed) return "";

  const [homeGoals, awayGoals] = parsed;
  const swfcIsHome = isSwfc(match.home);
  const swfcGoals = swfcIsHome ? homeGoals : awayGoals;
  const oppGoals = swfcIsHome ? awayGoals : homeGoals;

  if (swfcGoals > oppGoals) return "W";
  if (swfcGoals < oppGoals) return "L";
  return "D";
}

const resultBadgeClass: Record<"W" | "D" | "L", string> = {
  W: "bg-green-100 text-green-700",
  D: "bg-yellow-100 text-yellow-700",
  L: "bg-red-100 text-red-700",
};

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [monthIdx, setMonthIdx] = useState(0);

  const [table, setTable] = useState<TableEntry[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/matches", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to fetch matches: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Invalid matches format:", data);
          setAllMatches([]);
          return;
        }

        setAllMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setAllMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        setLoadingTable(true);

        const response = await fetch("/api/table", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to fetch table: ${response.status}`);
        }

        const data = await response.json();
        setTable(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching league table:", error);
        setTable([]);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchTable();
  }, []);

  const matchesByMonth: Record<string, Match[]> = useMemo(() => {
    const map: Record<string, Match[]> = {};

    for (const match of allMatches) {
      const key = match.date.slice(0, 7);
      if (!map[key]) map[key] = [];
      map[key].push(match);
    }

    return map;
  }, [allMatches]);

  const monthKeys = useMemo(() => Object.keys(matchesByMonth).sort(), [matchesByMonth]);

  const hasMonths = monthKeys.length > 0;

  useEffect(() => {
    if (monthKeys.length === 0) {
      setMonthIdx(0);
      return;
    }

    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const exactIdx = monthKeys.indexOf(currentKey);
    if (exactIdx >= 0) {
      setMonthIdx(exactIdx);
      return;
    }

    const nextFutureIdx = monthKeys.findIndex((key) => key > currentKey);
    if (nextFutureIdx >= 0) {
      setMonthIdx(nextFutureIdx);
      return;
    }

    setMonthIdx(monthKeys.length - 1);
  }, [monthKeys]);

  const safeMonthIdx = hasMonths ? Math.min(Math.max(monthIdx, 0), monthKeys.length - 1) : 0;
  const currentMonthKey = hasMonths ? monthKeys[safeMonthIdx] : undefined;

  const [year, month] = currentMonthKey?.split("-").map(Number) || [0, 0];

  const monthLabel = currentMonthKey
    ? `${monthLabels[month - 1]} ${year}`
    : "Fixtures";

  const matchesForMonth = useMemo(() => {
    const base = [...(matchesByMonth[currentMonthKey ?? ""] ?? [])].sort((a, b) => {
      const aTime = a.time || "00:00";
      const bTime = b.time || "00:00";

      const aDate = new Date(`${a.date}T${aTime}`).getTime();
      const bDate = new Date(`${b.date}T${bTime}`).getTime();

      return aDate - bDate;
    });

    return base.filter((m) => {
      if (filter === "Results" && m.status !== "FT") return false;
      if (filter === "Upcoming" && m.status !== "Upcoming") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const searchable = `${m.home} ${m.away} ${m.competition} ${m.venue}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [currentMonthKey, filter, search, matchesByMonth]);

  const season = useMemo(() => {
    if (allMatches.length === 0) return "Current";

    const sorted = [...allMatches].sort((a, b) => a.date.localeCompare(b.date));
    const firstMatch = sorted[0];

    const firstDate = new Date(`${firstMatch.date}T00:00:00`);
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth() + 1;

    const seasonStartYear = month >= 7 ? year : year - 1;
    return `${seasonStartYear}/${seasonStartYear + 1}`;
  }, [allMatches]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-4">
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#003399] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <CalendarDays size={28} />
            Fixtures &amp; Results
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            Sheffield Wednesday — {season} season
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => hasMonths && setMonthIdx((i) => Math.max(0, i - 1))}
                disabled={!hasMonths || safeMonthIdx === 0}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="font-semibold text-gray-800 w-40 text-center">
                {monthLabel}
              </span>

              <button
                onClick={() =>
                  hasMonths &&
                  setMonthIdx((i) => Math.min(monthKeys.length - 1, i + 1))
                }
                disabled={!hasMonths || safeMonthIdx === monthKeys.length - 1}
                className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

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

          <div className="relative w-full sm:w-96">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opponent, competition or venue..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003399]"
            />
          </div>
        </div>

        {matchesForMonth.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">
              No matches found for {monthLabel}
            </p>
            <p className="text-sm mt-1">
              Try adjusting the filter, refining your search, or navigating to another month.
            </p>
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
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm sm:text-base font-semibold flex-1 text-right ${
                                isSwfc(match.home) ? "text-[#003399]" : "text-gray-800"
                              }`}
                            >
                              {match.home}
                            </span>

                            <div className="flex-none w-16 text-center">
                              {match.status === "FT" ? (
                                <div>
                                  <span className="text-lg font-bold text-gray-900">
                                    {match.score ?? "—"}
                                  </span>
                                  <div className="text-xs text-gray-400">FT</div>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-sm font-semibold text-[#003399]">
                                    vs
                                  </span>
                                  <div className="text-xs text-gray-400">
                                    {match.time}
                                  </div>
                                </div>
                              )}
                            </div>

                            <span
                              className={`text-sm sm:text-base font-semibold flex-1 ${
                                isSwfc(match.away) ? "text-[#003399]" : "text-gray-800"
                              }`}
                            >
                              {match.away}
                            </span>
                          </div>
                        </div>

                        <div className="flex-none flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:w-36">
                          {match.status === "FT" && result ? (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${resultBadgeClass[result]}`}
                            >
                              {result === "W"
                                ? "Win"
                                : result === "D"
                                  ? "Draw"
                                  : "Loss"}
                            </span>
                          ) : (
                            <Badge className="bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20">
                              Upcoming
                            </Badge>
                          )}

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

        <ChampionshipTable table={table} loading={loadingTable} />

        <SeasonSummary matches={allMatches} season={season} />
      </main>
    </>
  );
}

// ── Championship table ────────────────────────────────────────────────────────

function ChampionshipTable({
  table,
  loading,
}: {
  table: TableEntry[];
  loading: boolean;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="p-4 sm:p-5">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-[#003399]" />
          Championship Table
        </h2>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">#</th>
                  <th className="px-3 py-3 text-left font-semibold">Team</th>
                  <th className="px-3 py-3 text-center font-semibold">P</th>
                  <th className="px-3 py-3 text-center font-semibold">W</th>
                  <th className="px-3 py-3 text-center font-semibold">D</th>
                  <th className="px-3 py-3 text-center font-semibold">L</th>
                  <th className="px-3 py-3 text-center font-semibold">GD</th>
                  <th className="px-3 py-3 text-center font-semibold">Pts</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                      Loading table...
                    </td>
                  </tr>
                ) : table.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                      No table data available.
                    </td>
                  </tr>
                ) : (
                  table.map((team) => {
                    const isSWFC = team.teamId === 345;

                    const zoneClass =
                      team.position <= 2
                        ? "border-l-4 border-l-green-500"
                        : team.position <= 6
                          ? "border-l-4 border-l-yellow-500"
                          : team.position >= 22
                            ? "border-l-4 border-l-red-500"
                            : "border-l-4 border-l-transparent";

                    return (
                      <tr
                        key={team.id}
                        className={`border-t border-gray-100 ${zoneClass} ${
                          isSWFC
                            ? "bg-[#003399]/10 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-3">{team.position}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{team.teamName}</td>
                        <td className="px-3 py-3 text-center">{team.playedGames}</td>
                        <td className="px-3 py-3 text-center">{team.won}</td>
                        <td className="px-3 py-3 text-center">{team.draw}</td>
                        <td className="px-3 py-3 text-center">{team.lost}</td>
                        <td className="px-3 py-3 text-center">{team.goalDifference}</td>
                        <td className="px-3 py-3 text-center font-bold">{team.points}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
            <span>Automatic promotion</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" />
            <span>Play-offs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
            <span>Relegation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Season summary ────────────────────────────────────────────────────────────

function SeasonSummary({
  matches,
  season,
}: {
  matches: Match[];
  season: string;
}) {
  const results = matches.filter((m) => m.status === "FT");

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of results) {
    const r = resultColour(m);

    if (r === "W") wins++;
    else if (r === "D") draws++;
    else if (r === "L") losses++;

    const parsed = parseScore(m.score);
    if (parsed) {
      const [h, a] = parsed;
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
          {season} Season at a Glance
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