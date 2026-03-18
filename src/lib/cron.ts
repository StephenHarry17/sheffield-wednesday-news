import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

const SHEFFIELD_WEDNESDAY_ID = 337; // Football-Data.org ID for Sheffield Wednesday

async function updateFixtures() {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${SHEFFIELD_WEDNESDAY_ID}/matches`,
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      }
    );

    const data = await response.json();

    if (!data.matches) {
      console.log('No matches found');
      return;
    }

    // Clear old matches and add new ones
    await prisma.match.deleteMany();

    const matches = data.matches.map((match: any) => ({
      opponent: match.awayTeam.name === 'Sheffield Wednesday' ? match.homeTeam.name : match.awayTeam.name,
      venue: match.homeTeam.name === 'Sheffield Wednesday' ? 'Home' : 'Away',
      date: new Date(match.utcDate),
      competition: match.competition.name,
      status: match.status,
      result: match.score.fullTime.home !== null ? `${match.score.fullTime.home}-${match.score.fullTime.away}` : '',
    }));

    await prisma.match.createMany({
      data: matches,
    });

    console.log(`Updated ${matches.length} fixtures`);
  } catch (error) {
    console.error('Error updating fixtures:', error);
  }
}

// Run every day at 2 AM
export function startFixtureCron() {
  cron.schedule('0 2 * * *', updateFixtures);
  console.log('Fixture cron job started');
}