import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const table = await prisma.leagueTableEntry.findMany({
      where: { competition: "ELC" },
      orderBy: { position: "asc" },
    });

    return Response.json(table, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching league table:", error);
    return Response.json(
      { error: "Failed to fetch league table" },
      { status: 500 }
    );
  }
}