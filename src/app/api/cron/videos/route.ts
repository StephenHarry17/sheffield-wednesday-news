import { prisma } from '@/lib/prisma';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SWFC_CHANNEL_ID = 'UCXRpYvFmY12TMKet-E0w_Cw'; // Official SWFC channel

async function fetchOfficialChannelVideos() {
  try {
    // First, get the uploads playlist ID from the channel
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${SWFC_CHANNEL_ID}&part=contentDetails`;
    
    const channelResponse = await fetch(channelUrl, {
      headers: { 'Accept': 'application/json' },
    });

    const channelData = await channelResponse.json();
    
    if (channelData.error) {
      console.error('YouTube API Error fetching channel:', channelData.error);
      return [];
    }

    if (!channelData.items || channelData.items.length === 0) {
      console.log('Channel not found');
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    console.log(`Uploads playlist ID: ${uploadsPlaylistId}`);

    // Now fetch videos from the uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${uploadsPlaylistId}&maxResults=50&part=snippet`;
    
    const playlistResponse = await fetch(playlistUrl, {
      headers: { 'Accept': 'application/json' },
    });

    const playlistData = await playlistResponse.json();
    
    if (playlistData.error) {
      console.error('YouTube API Error for official channel:', playlistData.error);
      return [];
    }

    if (!playlistData.items || playlistData.items.length === 0) {
      console.log('No official videos found');
      return [];
    }

    console.log(`Found ${playlistData.items.length} official SWFC videos`);

    return playlistData.items
      .filter((item: any) => item.snippet?.resourceId?.videoId)
      .map((item: any) => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        publishedAt: new Date(item.snippet.publishedAt),
        description: item.snippet.description || '',
        channelTitle: item.snippet.channelTitle,
        isOfficial: true,
      }));
  } catch (error) {
    console.error('Error fetching official channel videos:', error);
    return [];
  }
}

async function fetchGeneralSWFCVideos() {
  try {
    // Fetch general SWFC videos from all channels
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=Sheffield+Wednesday&type=video&order=date&maxResults=50&relevanceLanguage=en&part=snippet`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API Error for general search:', data.error);
      return [];
    }

    if (!data.items || data.items.length === 0) {
      console.log('No general SWFC videos found');
      return [];
    }

    console.log(`Found ${data.items.length} general SWFC videos`);

    return data.items
      .filter((item: any) => item.id?.videoId && item.snippet)
      .map((item: any) => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        publishedAt: new Date(item.snippet.publishedAt),
        description: item.snippet.description || '',
        channelTitle: item.snippet.channelTitle,
        isOfficial: false,
      }));
  } catch (error) {
    console.error('Error fetching general SWFC videos:', error);
    return [];
  }
}

async function updateVideos() {
  try {
    console.log('Fetching videos from YouTube...');

    // Fetch official channel videos
    const officialVideos = await fetchOfficialChannelVideos();

    // Fetch general SWFC videos
    const generalVideos = await fetchGeneralSWFCVideos();

    // Combine all videos
    const allVideos = [...officialVideos, ...generalVideos];

    // Remove duplicates by videoId
    const uniqueVideos = Array.from(
      new Map(allVideos.map(v => [v.videoId, v])).values()
    );

    console.log(`Total unique videos: ${uniqueVideos.length} (${officialVideos.length} official, ${generalVideos.length} general)`);

    if (uniqueVideos.length === 0) {
      console.log('No videos to save');
      return;
    }

    // Clear old videos and save new ones
    await prisma.video.deleteMany();

    await prisma.video.createMany({
      data: uniqueVideos,
    });
    
    console.log(`✓ Updated ${uniqueVideos.length} videos`);
  } catch (error) {
    console.error('Error updating videos:', error);
    throw error;
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateVideos();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}