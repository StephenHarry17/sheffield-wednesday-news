import { prisma } from "@/lib/prisma";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SWFC_CHANNEL_ID = "UCXRpYvFmY12TMKet-E0w_Cw";

type ChannelSource = {
  label: string;
  channelId: string;
  isOfficial: boolean;
};

function requireYouTubeKey() {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY not configured");
  }
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

  return channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
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

async function updateVideos() {
  requireYouTubeKey();

  const sources: ChannelSource[] = [
    { label: "officialswfc", channelId: SWFC_CHANNEL_ID, isOfficial: true },

    { label: "WTIDPOD", channelId: "UCWtTLF11cWSs8wY9KkyFwww", isOfficial: false },
    { label: "WhereOwlsWalk", channelId: "UCAMkzXeSrp3unli2khUwhAA", isOfficial: false },
    { label: "AllWednesdayPodcast", channelId: "UC5WjV_H-38kJmRs2y8No9Xg", isOfficial: false },
    { label: "sheffcam4960", channelId: "UCjM-o3trsEvca3O0VaDPVHA", isOfficial: false },
    { label: "Punkchef41", channelId: "UCWy5sfVbTtBw-0eOuBdqQQg", isOfficial: false },
    { label: "twwpodcast", channelId: "UC2_FmKP7VyIcoFV6rIT37oQ", isOfficial: false },
  ];

  const allVideos: any[] = [];

  for (const s of sources) {
    const vids = await fetchChannelVideos({
      channelId: s.channelId,
      isOfficial: s.isOfficial,
      maxResults: 25,
    });

    console.log(`Fetched ${vids.length} videos from ${s.label} (${s.channelId})`);
    allVideos.push(...vids);
  }

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

  if (uniqueVideos.length === 0) {
    console.log("No videos to save");
    return;
  }

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