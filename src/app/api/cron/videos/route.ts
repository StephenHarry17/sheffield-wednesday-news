import { prisma } from '@/lib/prisma';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function updateVideos() {
  try {
    console.log('Fetching videos from YouTube...');

    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=Sheffield+Wednesday+official&type=video&order=date&maxResults=50&relevanceLanguage=en&part=snippet`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return;
    }

    if (!data.items || data.items.length === 0) {
      console.log('No videos found');
      return;
    }

    console.log(`Found ${data.items.length} videos`);

    await prisma.video.deleteMany();

    const videos = data.items
      .filter((item: any) => item.id?.videoId && item.snippet)
      .map((item: any) => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        publishedAt: new Date(item.snippet.publishedAt),
        description: item.snippet.description || '',
      }));

    console.log(`Saving ${videos.length} videos to database`);

    if (videos.length > 0) {
      await prisma.video.createMany({
        data: videos,
      });
      console.log(`✓ Updated ${videos.length} videos`);
    }
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