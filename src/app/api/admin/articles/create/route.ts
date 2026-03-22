// app/api/admin/articles/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const article = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt ?? null,
        slug: body.slug,
        published: body.published ?? true,
        authorId: body.authorId,
        articleType: body.articleType as ArticleType,
        matchId: body.matchId ?? null,
        matchDate: body.matchDate ?? null,
        opponent: body.opponent ?? null,
        competition: body.competition ?? null,
        isHero: body.isHero ?? false,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("Create article failed:", error);
    return NextResponse.json(
      {
        error: "Failed to create article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}