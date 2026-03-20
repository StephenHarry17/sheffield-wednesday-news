export type FanZoneSource = "Wednesdayite" | "SWFC Trust";

export interface FanZoneItem {
  title: string;
  source: FanZoneSource;
  url: string;
  publishedAt: Date | null;
  description?: string;
}

export interface FanZoneFeed {
  items: FanZoneItem[];
  errors: string[];
}

/** Extract plain text from an HTML string. */
function extractText(html: string): string {
  return html
    .replace(/<script\b[^]*?<\/script\s*>/gi, "")
    .replace(/<style\b[^]*?<\/style\s*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(href: string, baseUrl: string): string {
  if (!href) return "";
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

// -------------------- Wednesdayite (fast scrape: listing only) --------------------

const WEDNESDAYITE_LIST =
  "https://www.wednesdayite.com/en/news/wednesdayite-news";
const WEDNESDAYITE_BASE = "https://www.wednesdayite.com/";

function parseWednesdayiteListing(html: string): Array<{
  title: string;
  url: string;
}> {
  const itemLinkRe =
    /<a\b[^>]*href=["']([^"']*\/en\/news\/wednesdayite-news\/item\/\d+-[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  const seen = new Set<string>();
  const results: Array<{ title: string; url: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = itemLinkRe.exec(html)) !== null) {
    const url = resolveUrl(m[1], WEDNESDAYITE_BASE);
    if (seen.has(url)) continue;

    const title = extractText(m[2]);
    if (!title) continue;
    if (title.toLowerCase() === "read more") continue;

    seen.add(url);
    results.push({ title, url });

    if (results.length >= 12) break;
  }

  return results;
}

export async function fetchWednesdayiteItems(): Promise<FanZoneItem[]> {
  const res = await fetch(WEDNESDAYITE_LIST, {
    next: { revalidate: 3600 }, // cache for 1 hour
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  if (!res.ok) throw new Error(`Wednesdayite listing returned ${res.status}`);

  const html = await res.text();
  const listing = parseWednesdayiteListing(html);

  // No per-item fetches => fast
  return listing.map(
    (entry) =>
      ({
        title: entry.title,
        source: "Wednesdayite",
        url: entry.url,
        publishedAt: null,
      }) satisfies FanZoneItem
  );
}

// -------------------- SWFC Trust (WP REST custom post type "news") --------------------

const SWFC_TRUST_NEWS_API =
  "https://swfctrust.co.uk/wp-json/wp/v2/news?per_page=12&_fields=link,title,excerpt,date_gmt,date";

function safeWpDate(s: unknown): Date | null {
  if (typeof s !== "string" || !s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function fetchSwfcTrustItems(): Promise<FanZoneItem[]> {
  const res = await fetch(SWFC_TRUST_NEWS_API, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`SWFC Trust news API returned ${res.status}`);

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json") && !ct.includes("+json")) {
    throw new Error(
      `SWFC Trust news API returned non-JSON content-type: ${ct}`
    );
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((p: any) => {
      const title = extractText(p?.title?.rendered ?? "");
      const description = p?.excerpt?.rendered
        ? extractText(p.excerpt.rendered).substring(0, 250) || undefined
        : undefined;

      const url = typeof p?.link === "string" ? p.link : "";
      const publishedAt = safeWpDate(p?.date_gmt) ?? safeWpDate(p?.date) ?? null;

      if (!title || !url) return null;

      return {
        title,
        source: "SWFC Trust" as const,
        url,
        publishedAt,
        description,
      } satisfies FanZoneItem;
    })
    .filter(Boolean) as FanZoneItem[];
}

// -------------------- Combined --------------------

export async function fetchFanZoneItems(): Promise<FanZoneFeed> {
  try {
    const errors: string[] = [];

    const [wednesdayiteResult, swfcTrustResult] = await Promise.allSettled([
      fetchWednesdayiteItems(),
      fetchSwfcTrustItems(),
    ]);

    const wednesdayiteItems: FanZoneItem[] =
      wednesdayiteResult.status === "fulfilled"
        ? wednesdayiteResult.value
        : (errors.push(
            "Could not load Wednesdayite updates. Please try again later."
          ),
          []);

    const swfcTrustItems: FanZoneItem[] =
      swfcTrustResult.status === "fulfilled"
        ? swfcTrustResult.value
        : (errors.push("Could not load SWFC Trust news. Please try again later."),
          []);

    const items = [...wednesdayiteItems, ...swfcTrustItems].sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    return { items, errors };
  } catch {
    return {
      items: [],
      errors: ["Fan Zone failed to load. Please try again later."],
    };
  }
}