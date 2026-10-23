import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    let resultData: unknown = null;
    switch (type) {
      case "profile": {
        resultData = await updateServerProfile(data);
        break;
      }
      case "project": {
        resultData = await saveServerProject(data);
        break;
      }
      case "experience": {
        resultData = await saveServerExperience(data);
        break;
      }
      case "education": {
        resultData = await saveServerEducation(data);
        break;
      }
      case "skills": {
        resultData = await updateServerSkills(data);
        break;
      }
      case "certificate": {
        resultData = await saveServerCertificate(data);
        break;
      }
      case "achievement": {
        resultData = await saveServerAchievement(data);
        break;
      }
      case "resume": {
        resultData = await updateServerResume(data);
        break;
      }
      case "socialLinks": {
        resultData = await updateServerSocialLinks(data);
        break;
      }
      case "siteSettings": {
        resultData = await updateServerSiteSettings(data);
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown content type: ${type}` },
          { status: 400 }
        );
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return NextResponse.json({ success: true, data: resultData });
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

    let deleteResult: unknown = null;
    switch (type) {
      case "project": {
        deleteResult = await deleteServerProject(id);
        break;
      }
      case "experience": {
        deleteResult = await deleteServerExperience(id);
        break;
      }
      case "education": {
        deleteResult = await deleteServerEducation(id);
        break;
      }
      case "certificate": {
        deleteResult = await deleteServerCertificate(id);
        break;
      }
      case "achievement": {
        deleteResult = await deleteServerAchievement(id);
        break;
      }
      case "media": {
        deleteResult = await deleteServerMedia(id);
        break;
      }
      default:
        return NextResponse.json(
          { error: `Cannot delete items of type: ${type}` },
          { status: 400 }
        );
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return NextResponse.json({ success: true, data: deleteResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
