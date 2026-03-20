import { NextResponse } from "next/server";
import { fetchFanZoneItems } from "@/lib/fanZone";

export const runtime = "nodejs";

export async function GET() {
  const data = await fetchFanZoneItems();

  // Serialize dates explicitly so we can see what's actually happening
  const serialized = {
    errors: data.errors,
    items: data.items.map((it) => ({
      ...it,
      publishedAt:
        it.publishedAt instanceof Date ? it.publishedAt.toISOString() : it.publishedAt,
      publishedAtType:
        it.publishedAt === null
          ? "null"
          : it.publishedAt instanceof Date
            ? "Date"
            : typeof (it as any).publishedAt,
      publishedAtTime:
        it.publishedAt instanceof Date ? it.publishedAt.getTime() : null,
    })),
  };

  return NextResponse.json(serialized);
}