import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching site articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch site articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, content, excerpt, slug, authorId, published } = body;

    if (!title || !content || !slug || !authorId) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, content, slug, authorId",
        },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        slug,
        authorId: Number(authorId),
        published: published ?? true,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error("Error creating site article:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An article with that slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create site article" },
      { status: 500 }
    );
  }
}