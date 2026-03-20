import { NextResponse } from "next/server";

export const runtime = "nodejs";

const URLS = {
  page: "https://swfctrust.co.uk/news/",
  base: "https://swfctrust.co.uk/",
};

function preview(s: string, n = 350) {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n) + "…" : flat;
}

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
    .trim();
}

function resolveUrl(href: string) {
  try {
    return new URL(href, URLS.page).toString();
  } catch {
    return href;
  }
}

export async function GET() {
  const res = await fetch(URLS.page, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  const html = await res.text();

  // Collect hrefs
  const hrefRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const hrefs: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = hrefRe.exec(html)) !== null && hrefs.length < 400) {
    hrefs.push(resolveUrl(m[1]));
  }

  // Filter down to likely post URLs (exclude /category/, /tag/, etc.)
  const postUrls = Array.from(
    new Set(
      hrefs.filter((u) => {
        if (!u.startsWith(URLS.base)) return false;
        if (u === URLS.page) return false;
        if (u.includes("/category/")) return false;
        if (u.includes("/tag/")) return false;
        if (u.includes("/author/")) return false;
        if (u.includes("/page/")) return false;
        if (u.includes("#")) return false;
        // posts are usually at root like https://swfctrust.co.uk/some-slug/
        const path = new URL(u).pathname;
        const parts = path.split("/").filter(Boolean);
        return parts.length === 1; // single slug
      })
    )
  ).slice(0, 30);

  // For each post url, capture nearby snippet and attempt to find a title + time
  const samples = postUrls.map((url) => {
    const idx = html.indexOf(url);
    const nearby =
      idx >= 0
        ? html.substring(Math.max(0, idx - 600), Math.min(html.length, idx + 1200))
        : "";

    const timeMatch = nearby.match(/<time[^>]+datetime=["']([^"']+)["']/i);
    const titleFromAnchorMatch = nearby.match(
      /<a\b[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/i
    );

    return {
      url,
      publishedAt: timeMatch ? timeMatch[1] : null,
      titleGuess: titleFromAnchorMatch ? extractText(titleFromAnchorMatch[1]) : null,
      nearbyPreview: preview(nearby),
    };
  });

  return NextResponse.json({
    when: new Date().toISOString(),
    status: res.status,
    contentType: res.headers.get("content-type"),
    totalHrefsScanned: hrefs.length,
    postUrlsCount: postUrls.length,
    postUrls,
    samples,
  });
}