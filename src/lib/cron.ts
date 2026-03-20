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

    await prisma.match.deleteMany();

    const matches = data.matches.map((match: any) => ({
      opponent:
        match.awayTeam.name === 'Sheffield Wednesday'
          ? match.homeTeam.name
          : match.awayTeam.name,
      venue: match.homeTeam.name === 'Sheffield Wednesday' ? 'Home' : 'Away',
      date: new Date(match.utcDate),
      competition: match.competition.name,
      status: match.status,
      result:
        match.score.fullTime.home !== null
          ? `${match.score.fullTime.home}-${match.score.fullTime.away}`
          : '',
    }));

    await prisma.match.createMany({ data: matches });

    console.log(`Updated ${matches.length} fixtures`);
  } catch (error) {
    console.error('Error updating fixtures:', error);
  }
}

async function updateArticles() {
  try {
    const response = await fetch(`http://localhost:3000/api/cron/articles`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await response.json();
    console.log(`Articles cron: ${data.saved} saved, ${data.errors} errors`);
  } catch (error) {
    console.error('Error updating articles:', error);
  }
}

async function updateVideos() {
  try {
    const response = await fetch(`http://localhost:3000/api/cron/videos`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await response.json();
    if (data?.success) {
      console.log('Videos cron: success');
    } else {
      console.log(`Videos cron: failed ${data?.error ? `- ${data.error}` : ''}`);
    }
  } catch (error) {
    console.error('Error updating videos:', error);
  }
}

// Run fixtures every hour (minute 0)
export function startFixtureCron() {
  cron.schedule('0 * * * *', updateFixtures);
  console.log('Fixture cron job started (hourly)');
}

// Run articles every hour (minute 0)
export function startArticlesCron() {
  cron.schedule('0 * * * *', updateArticles);
  console.log('Articles cron job started (hourly)');
}

// Run videos every hour (minute 0)
export function startVideosCron() {
  cron.schedule('0 * * * *', updateVideos);
  console.log('Videos cron job started (hourly)');
}