import { NextResponse } from "next/server";
import { getGitHubContributions } from "@/lib/github/github-contributions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam === null ? undefined : Number(yearParam);
  const result = await getGitHubContributions(year);

  if (!result.ok) {
    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
    };

    if (result.retryAfterSeconds !== undefined) {
      headers["Retry-After"] = String(result.retryAfterSeconds);
    }

    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        code: result.code,
      },
      {
        status: result.code === "invalid_year" ? 400 : 503,
        headers,
      }
    );
  }

  const currentYear = new Date().getUTCFullYear();
  const freshFor = result.data.year === currentYear ? 900 : 86_400;

  return NextResponse.json(
    {
      ok: true,
      data: result.data,
      cached: result.cached,
      stale: result.stale,
    },
    {
      headers: {
        "Cache-Control": result.stale
          ? "public, s-maxage=60, stale-while-revalidate=300"
          : `public, s-maxage=${freshFor}, stale-while-revalidate=86400`,
      },
    }
  );
}
