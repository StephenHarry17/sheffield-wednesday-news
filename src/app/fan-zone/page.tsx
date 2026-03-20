import Link from "next/link";
import { ExternalLink, AlertTriangle, Users } from "lucide-react";
import {
  fetchFanZoneItems,
  type FanZoneItem,
  type FanZoneSource,
} from "@/lib/fanZone";

export const runtime = "nodejs";
export const revalidate = 3600; // revalidate every hour

export const metadata = {
  title: "Fan Zone | Sheffield Wednesday News",
  description:
    "Latest news and updates from the Wednesdayite and SWFC Supporters Trust fan communities.",
};

function formatDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SOURCE_COLORS: Record<FanZoneSource, string> = {
  Wednesdayite: "bg-[#003399] text-white",
  "SWFC Trust": "bg-yellow-400 text-gray-900",
};

const ALL_SOURCES: FanZoneSource[] = ["Wednesdayite", "SWFC Trust"];

function parseSourceParam(
  source: string | string[] | undefined
): FanZoneSource | "all" {
  if (!source) return "all";
  const value = Array.isArray(source) ? source[0] : source;

  if (value === "Wednesdayite") return "Wednesdayite";
  if (value === "SWFCTrust" || value === "SWFC Trust") return "SWFC Trust";

  return "all";
}

function FanZoneCard({ item }: { item: FanZoneItem }) {
  const dateStr = formatDate(item.publishedAt);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${SOURCE_COLORS[item.source]}`}
        >
          {item.source}
        </span>
        {dateStr && <span className="text-xs text-gray-400">{dateStr}</span>}
      </div>

      <p className="font-semibold text-gray-900 group-hover:text-[#003399] transition-colors line-clamp-3">
        {item.title}
      </p>

      {item.description && (
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
          {item.description}
        </p>
      )}

      <span className="mt-auto flex items-center gap-1 text-xs font-medium text-[#003399] group-hover:underline">
        Read more <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

export default async function FanZonePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const selected = parseSourceParam(sp.source);

  const { items, errors } = await fetchFanZoneItems();

  const filteredItems =
    selected === "all" ? items : items.filter((i) => i.source === selected);

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Page header */}
      <div className="bg-[#003399] py-10 px-4 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Fan Zone</h1>
              <p className="mt-1 text-sm text-blue-200">
                Latest updates from the Wednesdayite community and SWFC
                Supporters&apos; Trust
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {/* Filters (replace legend) */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-medium mr-1">Source:</span>

          <Link
            href="/fan-zone"
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              selected === "all"
                ? "border-gray-300 bg-gray-100 text-gray-900"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </Link>

          {ALL_SOURCES.map((src) => {
            const active = selected === src;
            const href =
              src === "SWFC Trust"
                ? "/fan-zone?source=SWFCTrust"
                : "/fan-zone?source=Wednesdayite";

            return (
              <Link
                key={src}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? SOURCE_COLORS[src]
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {src}
              </Link>
            );
          })}

          <span className="ml-auto text-xs text-gray-500">
            Showing {filteredItems.length} of {items.length}
          </span>
        </div>

        {/* Error banners */}
        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Feed grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <FanZoneCard key={`${item.source}-${item.url}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium">No items for this source.</p>
            <p className="mt-1 text-sm">Try selecting another source.</p>
          </div>
        )}
      </div>
    </main>
  );
}