import { NextResponse } from "next/server";

export const runtime = "nodejs";

// If you want, replace this URL with ANY Wednesdayite item URL you see on your fan-zone page.
const URL =
  "https://www.wednesdayite.com/en/news/wednesdayite-news/item/4301-join-our-team-for-2025-26";

function preview(s: string, n = 1200) {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n) + "…" : flat;
}

export async function GET() {
  const res = await fetch(URL, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  const html = await res.text();

  // Pull out common Joomla article-info blocks (these are where the date usually lives)
  const articleInfo =
    html.match(
      /<dl\b[^>]*class=["'][^"']*article-info[^"']*["'][^>]*>[\s\S]*?<\/dl>/i
    )?.[0] ?? null;

  const metaTags = html
    .match(/<meta\b[^>]*>/gi)
    ?.filter((m) => /published|created|modified|date|time|article:/i.test(m))
    .slice(0, 40);

  return NextResponse.json({
    when: new Date().toISOString(),
    url: URL,
    status: res.status,
    contentType: res.headers.get("content-type"),
    found: {
      hasArticleInfoDl: Boolean(articleInfo),
      metaTagHits: metaTags?.length ?? 0,
    },
    articleInfoPreview: articleInfo ? preview(articleInfo) : null,
    metaTagsPreview: metaTags ? metaTags.map((m) => preview(m, 250)) : [],
  });
}