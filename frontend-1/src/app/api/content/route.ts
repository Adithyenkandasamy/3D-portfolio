import { NextRequest, NextResponse } from "next/server";
import { contentRepository } from "@/lib/repository/content-repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  try {
    switch (section) {
      case "profile":
        return NextResponse.json(await contentRepository.getProfile());
      case "projects":
        return NextResponse.json(await contentRepository.getProjects(true));
      case "experience":
        return NextResponse.json(await contentRepository.getExperience(true));
      case "education":
        return NextResponse.json(await contentRepository.getEducation(true));
      case "skills":
        return NextResponse.json(await contentRepository.getSkills());
      case "certificates":
        return NextResponse.json(await contentRepository.getCertificates(true));
      case "achievements":
        return NextResponse.json(await contentRepository.getAchievements(true));
      case "resume":
        return NextResponse.json(await contentRepository.getResume());
      case "socialLinks":
        return NextResponse.json(await contentRepository.getSocialLinks());
      case "siteSettings":
        return NextResponse.json(await contentRepository.getSiteSettings());
      default: {
        const [
          profile,
          projects,
          experience,
          education,
          skills,
          certificates,
          achievements,
          resume,
          socialLinks,
          siteSettings,
        ] = await Promise.all([
          contentRepository.getProfile(),
          contentRepository.getProjects(true),
          contentRepository.getExperience(true),
          contentRepository.getEducation(true),
          contentRepository.getSkills(),
          contentRepository.getCertificates(true),
          contentRepository.getAchievements(true),
          contentRepository.getResume(),
          contentRepository.getSocialLinks(),
          contentRepository.getSiteSettings(),
        ]);

        return NextResponse.json(
          {
            profile,
            projects,
            experience,
            education,
            skills,
            certificates,
            achievements,
            resume,
            socialLinks,
            siteSettings,
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }
    }
  } catch (err: unknown) {
    console.error("[API /api/content] Failed to fetch content:", err);
    return NextResponse.json(
      { error: "Content temporarily unavailable." },
      { status: 500 }
    );
  }
}
