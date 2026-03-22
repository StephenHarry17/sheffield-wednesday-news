import { NextResponse } from "next/server";

async function runRefreshJobs() {
  // Put your real refresh jobs here.
  // Example:
  // await refreshArticles();
  // await refreshVideos();
  // await refreshFixtures();

  return {
    ok: true,
    ranAt: new Date().toISOString(),
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
        error: "Refresh failed",
      },
      { status: 500 }
    );
  }
}