import cron from "node-cron";
import { prisma } from "@/lib/prisma";

const SHEFFIELD_WEDNESDAY_ID = 337;

// IMPORTANT: do not hardcode localhost for production
const APP_BASE_URL =
  process.env.APP_BASE_URL || "http://localhost:3000";

function cronAuthHeaders() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail loudly so you notice in logs
    throw new Error("CRON_SECRET is not set");
  }
  return { Authorization: `Bearer ${secret}` };
}

async function updateFixtures() {
  try {
    const key = process.env.FOOTBALL_DATA_API_KEY;
    if (!key) throw new Error("FOOTBALL_DATA_API_KEY is not set");

    const response = await fetch(
      `https://api.football-data.org/v4/teams/${SHEFFIELD_WEDNESDAY_ID}/matches`,
      { headers: { "X-Auth-Token": key } }
    );

    if (!response.ok) {
      throw new Error(`football-data.org returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.matches) {
      console.log("No matches found");
      return;
    }

    await prisma.match.deleteMany();

    const matches = data.matches.map((match: any) => ({
      opponent:
        match.awayTeam.name === "Sheffield Wednesday"
          ? match.homeTeam.name
          : match.awayTeam.name,
      venue: match.homeTeam.name === "Sheffield Wednesday" ? "Home" : "Away",
      date: new Date(match.utcDate),
      competition: match.competition.name,
      status: match.status,
      result:
        match.score.fullTime.home !== null
          ? `${match.score.fullTime.home}-${match.score.fullTime.away}`
          : "",
    }));

    await prisma.match.createMany({ data: matches });

    console.log(`Updated ${matches.length} fixtures`);
  } catch (error) {
    console.error("Error updating fixtures:", error);
  }
}

async function updateArticles() {
  try {
    const response = await fetch(`${APP_BASE_URL}/api/cron/articles`, {
      headers: cronAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    console.log(
      `Articles cron: ${data.saved ?? "?"} saved, ${data.errors ?? "?"} errors`
    );
  } catch (error) {
    console.error("Error updating articles:", error);
  }
}

async function updateVideos() {
  try {
    const response = await fetch(`${APP_BASE_URL}/api/cron/videos`, {
      headers: cronAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (data?.success) {
      console.log("Videos cron: success");
    } else {
      console.log(
        `Videos cron: failed${
          data?.error ? ` - ${data.error}` : response.ok ? "" : ` (${response.status})`
        }`
      );
    }
  } catch (error) {
    console.error("Error updating videos:", error);
  }
}

// --------------- Schedulers ---------------
// Note: In serverless deployments these will NOT run reliably.

export function startFixtureCron() {
  cron.schedule("0 * * * *", updateFixtures);
  console.log("Fixture cron job started (hourly)");
}

export function startArticlesCron() {
  cron.schedule("0 * * * *", updateArticles);
  console.log("Articles cron job started (hourly)");
}

export function startVideosCron() {
  cron.schedule("0 * * * *", updateVideos);
  console.log("Videos cron job started (hourly)");
}