import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isTodayDate(dateString: string) {
  const today = new Date();
  const date = new Date(`${dateString}T00:00:00`);

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany();
    const todaysMatch = matches.find((match) => isTodayDate(match.date));

    if (!todaysMatch) {
      return NextResponse.json(null);
    }

    let article = await prisma.article.findFirst({
      where: {
        published: true,
        articleType: "match_preview",
        matchId: todaysMatch.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        author: true,
      },
    });

    if (!article) {
      article = await prisma.article.findFirst({
        where: {
          published: true,
          articleType: "match_preview",
          matchDate: todaysMatch.date,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          author: true,
        },
      });
    }

    return NextResponse.json(article ?? null);
  } catch (error) {
    console.error("Error fetching matchday article:", error);
    return NextResponse.json(
      { error: "Failed to fetch matchday article" },
      { status: 500 }
    );
  }
}