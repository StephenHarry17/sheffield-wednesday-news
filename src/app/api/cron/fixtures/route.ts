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
      const home = isHome ? 'Sheffield Wednesday' : match.homeTeam.name;
      const away = isHome ? match.awayTeam.name : 'Sheffield Wednesday';
      
      // Parse date and time
      const utcDate = new Date(match.utcDate);
      const date = utcDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const time = utcDate.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
      
      // Determine status
      const status = match.status === 'FINISHED' ? 'FT' : 'Upcoming';
      
      // Get score if available
      const score = match.score.fullTime.home !== null 
        ? `${match.score.fullTime.home}-${match.score.fullTime.away}` 
        : null;

      return {
        home,
        away,
        date,
        time,
        venue: match.season?.name || 'TBA',
        competition: match.competition.name,
        score,
        status,
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