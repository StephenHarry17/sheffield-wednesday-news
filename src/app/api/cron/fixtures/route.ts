import { prisma } from '@/lib/prisma';

const SHEFFIELD_WEDNESDAY_ID = 345;

async function updateFixtures() {
  try {
    console.log('Fetching fixtures from Football-Data.org...');

    const response = await fetch(
      `https://api.football-data.org/v4/teams/${SHEFFIELD_WEDNESDAY_ID}/matches`,
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      }
    );

    console.log('Response status:', response.status);
    const data = await response.json();

    if (!data.matches) {
      console.log('No matches found in response');
      return;
    }

    console.log(`Found ${data.matches.length} matches`);

    await prisma.match.deleteMany();
    console.log('Deleted old matches');

    const matches = data.matches.map((match: any) => {
      const isHome = match.homeTeam.id === SHEFFIELD_WEDNESDAY_ID;
      const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
      const venue = isHome ? 'Home' : 'Away';

      return {
        opponent,
        venue,
        date: new Date(match.utcDate),
        competition: match.competition.name,
        status: match.status,
        result: match.score.fullTime.home !== null ? `${match.score.fullTime.home}-${match.score.fullTime.away}` : '',
      };
    });

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
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateFixtures();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}