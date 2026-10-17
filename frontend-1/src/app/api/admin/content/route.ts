import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getServerProfile,
  updateServerProfile,
  getServerProjects,
  saveServerProject,
  deleteServerProject,
  getServerExperience,
  saveServerExperience,
  deleteServerExperience,
  getServerEducation,
  saveServerEducation,
  deleteServerEducation,
  getServerSkills,
  updateServerSkills,
  getServerCertificates,
  saveServerCertificate,
  deleteServerCertificate,
  getServerAchievements,
  saveServerAchievement,
  deleteServerAchievement,
  getServerResume,
  updateServerResume,
  getServerSocialLinks,
  updateServerSocialLinks,
  getServerSiteSettings,
  updateServerSiteSettings,
  getServerMediaList,
  deleteServerMedia,
} from "@/lib/server-content-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    switch (type) {
      case "profile":
        return NextResponse.json(await getServerProfile());
      case "projects":
        return NextResponse.json(await getServerProjects());
      case "experience":
        return NextResponse.json(await getServerExperience());
      case "education":
        return NextResponse.json(await getServerEducation());
      case "skills":
        return NextResponse.json(await getServerSkills());
      case "certificates":
        return NextResponse.json(await getServerCertificates());
      case "achievements":
        return NextResponse.json(await getServerAchievements());
      case "resume":
        return NextResponse.json(await getServerResume());
      case "socialLinks":
        return NextResponse.json(await getServerSocialLinks());
      case "siteSettings":
        return NextResponse.json(await getServerSiteSettings());
      case "media":
        return NextResponse.json(await getServerMediaList());
      default:
        return NextResponse.json({
          profile: await getServerProfile(),
          projects: await getServerProjects(),
          experience: await getServerExperience(),
          education: await getServerEducation(),
          skills: await getServerSkills(),
          certificates: await getServerCertificates(),
          achievements: await getServerAchievements(),
          resume: await getServerResume(),
          socialLinks: await getServerSocialLinks(),
          siteSettings: await getServerSiteSettings(),
          media: await getServerMediaList(),
        });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required for modifications." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case "profile": {
        const updated = await updateServerProfile(data);
        return NextResponse.json({ success: true, data: updated });
      }
      case "project": {
        const updatedList = await saveServerProject(data);
        return NextResponse.json({ success: true, data: updatedList });
      }
      case "experience": {
        const updatedList = await saveServerExperience(data);
        return NextResponse.json({ success: true, data: updatedList });
      }
      case "education": {
        const updatedList = await saveServerEducation(data);
        return NextResponse.json({ success: true, data: updatedList });
      }
      case "skills": {
        const updated = await updateServerSkills(data);
        return NextResponse.json({ success: true, data: updated });
      }
      case "certificate": {
        const updatedList = await saveServerCertificate(data);
        return NextResponse.json({ success: true, data: updatedList });
      }
      case "achievement": {
        const updatedList = await saveServerAchievement(data);
        return NextResponse.json({ success: true, data: updatedList });
      }
      case "resume": {
        const updated = await updateServerResume(data);
        return NextResponse.json({ success: true, data: updated });
      }
      case "socialLinks": {
        const updated = await updateServerSocialLinks(data);
        return NextResponse.json({ success: true, data: updated });
      }
      case "siteSettings": {
        const updated = await updateServerSiteSettings(data);
        return NextResponse.json({ success: true, data: updated });
      }
      default:
        return NextResponse.json(
          { error: `Unknown content type: ${type}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required for modifications." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Both 'type' and 'id' query parameters are required." },
        { status: 400 }
      );
    }

    switch (type) {
      case "project": {
        const updated = await deleteServerProject(id);
        return NextResponse.json({ success: true, data: updated });
      }
      case "experience": {
        const updated = await deleteServerExperience(id);
        return NextResponse.json({ success: true, data: updated });
      }
      case "education": {
        const updated = await deleteServerEducation(id);
        return NextResponse.json({ success: true, data: updated });
      }
      case "certificate": {
        const updated = await deleteServerCertificate(id);
        return NextResponse.json({ success: true, data: updated });
      }
      case "achievement": {
        const updated = await deleteServerAchievement(id);
        return NextResponse.json({ success: true, data: updated });
      }
      case "media": {
        const updated = await deleteServerMedia(id);
        return NextResponse.json({ success: true, data: updated });
      }
      default:
        return NextResponse.json(
          { error: `Cannot delete items of type: ${type}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
