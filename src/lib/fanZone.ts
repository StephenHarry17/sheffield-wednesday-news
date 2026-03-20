export type FanZoneSource = 'Wednesdayite' | 'SWFC Trust';

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

/** Extract text content from an XML/HTML tag, handling CDATA sections. */
function extractTagContent(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*<\\/${tag}>`,
    'i',
  );
  const match = xml.match(re);
  if (!match) return '';
  return (match[1] ?? match[2] ?? '').trim();
}

/**
 * Extract plain text from an HTML string.
 * The output is used exclusively as React JSX text content (never via
 * dangerouslySetInnerHTML), so React's automatic escaping prevents any
 * residual HTML from being interpreted as markup.
 */
function extractText(html: string): string {
  return html
    // Remove script and style block content entirely (including space before ">")
    .replace(/<script\b[^]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^]*?<\/style\s*>/gi, '')
    // Strip remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode entities — &amp; is decoded last to avoid double-unescaping
    // (e.g. &amp;lt; → &lt;, not <)
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Numeric decimal entities (e.g. &#8217; → ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    // Numeric hex entities (e.g. &#x2019; → ')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .trim();
}

/** Parse RSS XML into FanZoneItems. */
function parseRssItems(xml: string, source: FanZoneSource): FanZoneItem[] {
  const items: FanZoneItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];

    const rawTitle = extractTagContent(block, 'title');
    const title = extractText(rawTitle);
    if (!title) continue;

    // <link> in RSS is tricky: sometimes it's text, sometimes wrapped in CDATA
    let url = extractTagContent(block, 'link');
    if (!url) {
      // Try atom:link with href
      const atomLink = block.match(/<(?:atom:)?link[^>]+href=["']([^"']+)["']/i);
      if (atomLink) url = atomLink[1];
    }
    if (!url) continue;

    const pubDateStr = extractTagContent(block, 'pubDate') || extractTagContent(block, 'dc:date');
    const publishedAt = pubDateStr ? new Date(pubDateStr) : null;

    const rawDesc = extractTagContent(block, 'description');
    const description = rawDesc
      ? extractText(rawDesc).substring(0, 250) || undefined
      : undefined;

    items.push({ title, source, url, publishedAt, description });
  }

  return items;
}

/** Try to discover an RSS/Atom feed URL from HTML <link rel="alternate"> tags. */
function discoverFeedUrl(html: string, baseUrl: string): string | null {
  // Pattern: rel="alternate" before type="..."
  const reRelFirst =
    /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["'][^>]*\/?>/i;
  // Pattern: href="..." before type="..."
  const reHrefFirst =
    /<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+rel=["']alternate["'][^>]*\/?>/i;

  const mRelFirst = reRelFirst.exec(html);
  const mHrefFirst = reHrefFirst.exec(html);
  const href = mRelFirst?.[1] ?? mHrefFirst?.[1] ?? null;
  if (!href) return null;

  if (href.startsWith('http')) return href;
  // Resolve relative URL
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

/** Scrape SWFC Trust news listing page for article links, dates and titles. */
function scrapeSwfcTrustHtml(html: string): FanZoneItem[] {
  const items: FanZoneItem[] = [];
  const seen = new Set<string>();

  // WordPress entry title pattern: <h2 class="entry-title"><a href="...">Title</a></h2>
  // Also handles <h3 class="..."> variants
  const titleLinkRe =
    /<(?:h[123456])[^>]*class="[^"]*(?:entry-title|post-title)[^"]*"[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let m: RegExpExecArray | null;
  while ((m = titleLinkRe.exec(html)) !== null) {
    const url = m[1];
    const title = extractText(m[2]);
    if (!title || !url || seen.has(url)) continue;
    seen.add(url);

    items.push({ title, source: 'SWFC Trust', url, publishedAt: null });
  }

  // If the above didn't work, try a broader pattern: article > a with a heading
  if (items.length === 0) {
    // Look for <article> blocks and grab first <a href> + first heading text
    const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    while ((m = articleRe.exec(html)) !== null) {
      const block = m[1];
      const linkMatch = block.match(/<a[^>]+href=["'](https?:[^"']+)["'][^>]*>/i);
      const headingMatch = block.match(/<(?:h[1-6])[^>]*>([\s\S]*?)<\/(?:h[1-6])>/i);
      const timeMatch = block.match(/<time[^>]+datetime=["']([^"']+)["']/i);

      if (!linkMatch || !headingMatch) continue;
      const url = linkMatch[1];
      const title = extractText(headingMatch[1]);
      if (!title || seen.has(url)) continue;
      seen.add(url);

      const publishedAt = timeMatch ? new Date(timeMatch[1]) : null;
      items.push({ title, source: 'SWFC Trust', url, publishedAt });
    }
  }

  // Now try to extract dates for items that don't have one yet
  // WordPress <time class="entry-date" datetime="..."> pattern
  const withDates: FanZoneItem[] = items.map((item) => {
    if (item.publishedAt) return item;
    // Find the block of HTML near this URL
    const urlIndex = html.indexOf(item.url);
    if (urlIndex === -1) return item;
    const nearby = html.substring(
      Math.max(0, urlIndex - 500),
      Math.min(html.length, urlIndex + 1000),
    );
    const timeMatch = nearby.match(/<time[^>]+datetime=["']([^"']+)["']/i);
    if (timeMatch) {
      return { ...item, publishedAt: new Date(timeMatch[1]) };
    }
    return item;
  });

  return withDates;
}

const WEDNESDAYITE_RSS = 'https://www.wednesdayite.com/en/news/rss?start=0';
const SWFC_TRUST_NEWS = 'https://swfctrust.co.uk/news/';

/** Fetch and parse Wednesdayite RSS feed. */
export async function fetchWednesdayiteItems(): Promise<FanZoneItem[]> {
  const res = await fetch(WEDNESDAYITE_RSS, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Wednesdayite RSS returned ${res.status}`);
  const xml = await res.text();
  return parseRssItems(xml, 'Wednesdayite');
}

/** Fetch and parse SWFC Trust news (RSS if discoverable, otherwise scrape HTML). */
export async function fetchSwfcTrustItems(): Promise<FanZoneItem[]> {
  // Step 1: Fetch the news page HTML
  const htmlRes = await fetch(SWFC_TRUST_NEWS, { next: { revalidate: 3600 } });
  if (!htmlRes.ok) throw new Error(`SWFC Trust news page returned ${htmlRes.status}`);
  const html = await htmlRes.text();

  // Step 2: Try to discover an RSS/Atom feed
  const feedUrl = discoverFeedUrl(html, SWFC_TRUST_NEWS);
  if (feedUrl) {
    const feedRes = await fetch(feedUrl, { next: { revalidate: 3600 } });
    if (feedRes.ok) {
      const xml = await feedRes.text();
      const parsed = parseRssItems(xml, 'SWFC Trust');
      if (parsed.length > 0) return parsed;
    }
  }

  // Step 3: Fall back to HTML scraping
  return scrapeSwfcTrustHtml(html);
}

/** Fetch items from both sources, combining results. Errors from individual sources are captured. */
export async function fetchFanZoneItems(): Promise<FanZoneFeed> {
  const errors: string[] = [];

  const [wednesdayiteResult, swfcTrustResult] = await Promise.allSettled([
    fetchWednesdayiteItems(),
    fetchSwfcTrustItems(),
  ]);

  const wednesdayiteItems: FanZoneItem[] = (() => {
    if (wednesdayiteResult.status === 'fulfilled') return wednesdayiteResult.value;
    errors.push('Could not load Wednesdayite feed. Please try again later.');
    return [];
  })();

  const swfcTrustItems: FanZoneItem[] = (() => {
    if (swfcTrustResult.status === 'fulfilled') return swfcTrustResult.value;
    errors.push('Could not load SWFC Trust news. Please try again later.');
    return [];
  })();

  // Merge and sort by date descending (items without dates go last)
  const items = [...wednesdayiteItems, ...swfcTrustItems].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  return { items, errors };
}
