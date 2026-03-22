import { NextResponse } from "next/server";

async function runRefreshJobs() {
  console.log("CRON START:", new Date().toISOString());

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wawaw.news";
  const authHeader = {
    Authorization: `Bearer ${process.env.CRON_SECRET}`,
  };

  const jobs = [
    { name: "videos", path: "/api/cron/videos" },
    { name: "fixtures", path: "/api/cron/fixtures" },
    { name: "articles", path: "/api/cron/articles/fetch-sheffield-wednesday" },
    { name: "table", path: "/api/cron/table" },
  ];

  const results = [];

  for (const job of jobs) {
    const res = await fetch(`${baseUrl}${job.path}`, {
      method: "GET",
      headers: authHeader,
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`${job.name} failed: ${res.status} ${text}`);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log(`${job.name.toUpperCase()} REFRESHED:`, data);

    results.push({
      job: job.name,
      success: true,
      data,
    });
  }

  return {
    ok: true,
    ranAt: new Date().toISOString(),
    results,
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRefreshJobs();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Cron refresh failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Refresh failed",
      },
      { status: 500 }
    );
  }
}