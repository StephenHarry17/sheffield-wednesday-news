import { prisma } from "@/lib/prisma";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SWFC_CHANNEL_ID = "UCXRpYvFmY12TMKet-E0w_Cw"; // Official SWFC channel

type ChannelSource = {
  label: string;
  channelId?: string; // best if known
  handleOrName?: string; // fallback resolver (works well enough)
  isOfficial: boolean;
};

function requireYouTubeKey() {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY not configured");
  }
}

async function resolveChannelId(handleOrName: string): Promise<string | null> {
  requireYouTubeKey();

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(
    handleOrName
  )}&type=channel&maxResults=1&part=snippet`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();

  if (data?.error) {
    console.error("YouTube API Error resolving channel:", data.error);
    return null;
  }

  return data?.items?.[0]?.id?.channelId ?? null;
}

async function fetchChannelUploadsPlaylistId(channelId: string): Promise<string | null> {
  requireYouTubeKey();

  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${channelId}&part=contentDetails`;

  const channelResponse = await fetch(channelUrl, {
    headers: { Accept: "application/json" },
  });

  const channelData = await channelResponse.json();

  if (channelData?.error) {
    console.error("YouTube API Error fetching channel:", channelData.error);
    return null;
  }

  const uploadsPlaylistId =
    channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  return uploadsPlaylistId ?? null;
}

async function fetchChannelVideos(opts: {
  channelId: string;
  isOfficial: boolean;
  maxResults?: number;
}) {
  requireYouTubeKey();

  const uploadsPlaylistId = await fetchChannelUploadsPlaylistId(opts.channelId);
  if (!uploadsPlaylistId) return [];

  const maxResults = opts.maxResults ?? 25;

  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&part=snippet`;

  const playlistResponse = await fetch(playlistUrl, {
    headers: { Accept: "application/json" },
  });

  const playlistData = await playlistResponse.json();

  if (playlistData?.error) {
    console.error("YouTube API Error for channel playlist:", playlistData.error);
    return [];
  }

  if (!playlistData?.items?.length) return [];

  return playlistData.items
    .filter((item: any) => item.snippet?.resourceId?.videoId)
    .map((item: any) => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      publishedAt: new Date(item.snippet.publishedAt),
      description: item.snippet.description || "",
      channelTitle: item.snippet.channelTitle,
      isOfficial: opts.isOfficial,
    }));
}

async function fetchGeneralSWFCVideos() {
  requireYouTubeKey();

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=Sheffield+Wednesday&type=video&order=date&maxResults=50&relevanceLanguage=en&part=snippet`;

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();

  if (data?.error) {
    console.error("YouTube API Error for general search:", data.error);
    return [];
  }

  if (!data?.items?.length) return [];

  return data.items
    .filter((item: any) => item.id?.videoId && item.snippet)
    .map((item: any) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      publishedAt: new Date(item.snippet.publishedAt),
      description: item.snippet.description || "",
      channelTitle: item.snippet.channelTitle,
      isOfficial: false,
    }));
}

async function updateVideos() {
  requireYouTubeKey();

  console.log("Fetching videos from YouTube...");

  const sources: ChannelSource[] = [
    { label: "officialswfc", channelId: SWFC_CHANNEL_ID, isOfficial: true },

    // Creator channels (resolved by handle/name)
    { label: "@WTIDPOD", handleOrName: "WTIDPOD", isOfficial: false },
    { label: "@WhereOwlsWalk", handleOrName: "WhereOwlsWalk", isOfficial: false },
    { label: "@AllWednesdayPodcast", handleOrName: "AllWednesdayPodcast", isOfficial: false },
    { label: "@sheffcam4960", handleOrName: "sheffcam4960", isOfficial: false },
    { label: "@Punkchef41", handleOrName: "Punkchef41", isOfficial: false },
    { label: "@twwpodcast", handleOrName: "twwpodcast", isOfficial: false },
  ];

  // Resolve channel IDs where needed
  const resolvedSources: ChannelSource[] = [];
  for (const s of sources) {
    if (s.channelId) {
      resolvedSources.push(s);
      continue;
    }

    if (!s.handleOrName) continue;

    const channelId = await resolveChannelId(s.handleOrName);
    if (!channelId) {
      console.warn(`Could not resolve channelId for ${s.label} (${s.handleOrName})`);
      continue;
    }

    resolvedSources.push({ ...s, channelId });
  }

  const channelVideos: any[] = [];
  for (const s of resolvedSources) {
    const vids = await fetchChannelVideos({
      channelId: s.channelId!,
      isOfficial: s.isOfficial,
      maxResults: 25,
    });
    console.log(`Fetched ${vids.length} videos from ${s.label} (${s.channelId})`);
    channelVideos.push(...vids);
  }

  const generalVideos = await fetchGeneralSWFCVideos();
  console.log(`Fetched ${generalVideos.length} general search videos`);

  const allVideos = [...channelVideos, ...generalVideos];

  // Deduplicate by videoId, preferring official videos
  const byId = new Map<string, (typeof allVideos)[number]>();
  for (const v of allVideos) {
    const existing = byId.get(v.videoId);
    if (!existing) {
      byId.set(v.videoId, v);
      continue;
    }
    if (existing.isOfficial) continue;
    if (v.isOfficial) byId.set(v.videoId, v);
  }

  const uniqueVideos = Array.from(byId.values()).sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  console.log(`Total unique videos: ${uniqueVideos.length}`);

  if (uniqueVideos.length === 0) {
    console.log("No videos to save");
    return;
  }

  // Current approach: wipe and replace
  await prisma.video.deleteMany();
  await prisma.video.createMany({ data: uniqueVideos });

  console.log(`✓ Updated ${uniqueVideos.length} videos`);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateVideos();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating videos:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}