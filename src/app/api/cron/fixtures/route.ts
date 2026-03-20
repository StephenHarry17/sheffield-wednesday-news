import { prisma } from '@/lib/prisma';

const SHEFFIELD_WEDNESDAY_ID = 345;

async function updateFixtures() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY is missing from your .env file');
    }

    console.log('Fetching fixtures from Football-Data.org...');

    const response = await fetch(
      `https://api.football-data.org/v4/teams/${SHEFFIELD_WEDNESDAY_ID}/matches`,
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
        cache: 'no-store',
      }
    );

    const rawText = await response.text();

    console.log('Response status:', response.status);
    console.log('Raw API response:', rawText);

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`The API did not return valid JSON: ${rawText}`);
    }

    if (!response.ok) {
      throw new Error(`Football API error ${response.status}: ${rawText}`);
    }

    if (!Array.isArray(data.matches)) {
      throw new Error(`No matches array found in API response: ${rawText}`);
    }

    console.log(`Found ${data.matches.length} matches`);

    const matches = data.matches.map((match: any) => {
      const isHome = match.homeTeam?.id === SHEFFIELD_WEDNESDAY_ID;

      const home = isHome
        ? 'Sheffield Wednesday'
        : match.homeTeam?.name || 'Unknown';

      const away = isHome
        ? match.awayTeam?.name || 'Unknown'
        : 'Sheffield Wednesday';

      const utcDate = new Date(match.utcDate);

      const date = utcDate.toISOString().split('T')[0];

      const time = utcDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const status = match.status === 'FINISHED' ? 'FT' : 'Upcoming';

      const score =
        match.score?.fullTime?.home != null &&
        match.score?.fullTime?.away != null
          ? `${match.score.fullTime.home}-${match.score.fullTime.away}`
          : null;

      return {
        home,
        away,
        date,
        time,
        venue: 'TBA',
        competition: match.competition?.name || 'Unknown Competition',
        score,
        status,
      };
    });

    if (matches.length === 0) {
      throw new Error('No matches returned from API - aborting update to avoid wiping DB');
    }

    await prisma.match.deleteMany();
    console.log('Deleted old matches');

    await prisma.match.createMany({
      data: matches,
    });

    console.log(`Updated ${matches.length} fixtures`);
  } catch (error) {
    console.error('Error updating fixtures:', error);
    throw error;
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    key !== process.env.CRON_SECRET
  ) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateFixtures();
    return Response.json({ success: true });
  } catch (error) {
    console.error('GET route error:', error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}