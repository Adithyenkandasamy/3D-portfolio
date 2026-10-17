import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, setAdminSessionCookie } from "@/lib/admin-auth";
import { LoginCredentialsSchema } from "@/lib/validations/content-schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = LoginCredentialsSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid username or password format." },
        { status: 400 }
      );
    }

    const { username, password } = parse.data;
    const isValid = await authenticateAdmin(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your admin username and password." },
        { status: 401 }
      );
    }

    await setAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
