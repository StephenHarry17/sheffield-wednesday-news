import { prisma } from "@/lib/prisma";

const COMPETITION_CODE = "ELC";

async function updateLeagueTable() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      throw new Error("FOOTBALL_DATA_API_KEY is missing from your .env file");
    }

    console.log("Fetching Championship table from Football-Data.org...");

    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION_CODE}/standings`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
        cache: "no-store",
      }
    );

    const rawText = await response.text();

    console.log("Response status:", response.status);

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`The API did not return valid JSON: ${rawText}`);
    }

    if (!response.ok) {
      throw new Error(`Football API error ${response.status}: ${rawText}`);
    }

    if (!Array.isArray(data.standings) || data.standings.length === 0) {
      throw new Error(`No standings found in API response: ${rawText}`);
    }

    const totalTable =
      data.standings.find((s: any) => s.type === "TOTAL") ?? data.standings[0];

    if (!Array.isArray(totalTable.table) || totalTable.table.length === 0) {
      throw new Error("No table entries returned from API");
    }

    const seasonLabel =
      data.season?.startDate && data.season?.endDate
        ? `${data.season.startDate} to ${data.season.endDate}`
        : null;

    const entries = totalTable.table.map((row: any) => ({
      position: row.position,
      teamId: row.team?.id,
      teamName: row.team?.name || "Unknown",
      playedGames: row.playedGames ?? 0,
      won: row.won ?? 0,
      draw: row.draw ?? 0,
      lost: row.lost ?? 0,
      points: row.points ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
      goalDifference: row.goalDifference ?? 0,
      form: row.form ?? null,
      competition: COMPETITION_CODE,
      season: seasonLabel,
    }));

    if (entries.length === 0) {
      throw new Error("No league table entries returned - aborting update");
    }

    await prisma.leagueTableEntry.deleteMany({
      where: { competition: COMPETITION_CODE },
    });

    await prisma.leagueTableEntry.createMany({
      data: entries,
    });

    console.log(`Updated ${entries.length} league table rows`);
  } catch (error) {
    console.error("Error updating league table:", error);
    throw error;
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    key !== process.env.CRON_SECRET
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateLeagueTable();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}