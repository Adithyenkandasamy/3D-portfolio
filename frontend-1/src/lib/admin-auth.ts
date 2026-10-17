import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "adithyen_admin_session";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "fallback_dev_admin_secret_99812401824109824"
  );
}

function getExpectedCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin_portfolio_2026!",
  };
}

/**
 * Validates username & password against configured environment variables
 */
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const creds = getExpectedCredentials();
  return (
    usernameInput.trim() === creds.username &&
    passwordInput === creds.password
  );
}

/**
 * Creates an HMAC signed session token
 */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const secret = getSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`admin_session:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Verifies that the session token is valid and not expired
 */
export function verifySessionToken(token?: string | null): boolean {
  if (!token || !token.includes(".")) {
    return false;
  }

  const [timestampStr, signature] = token.split(".");
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return false;
  }

  // Check expiration (7 days)
  const ageSeconds = (Date.now() - timestamp) / 1000;
  if (ageSeconds > SESSION_EXPIRY_SECONDS || ageSeconds < 0) {
    return false;
  }

  const secret = getSecret();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`admin_session:${timestampStr}`)
    .digest("hex");

  // Constant-time string comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Server-side helper to check if current request has a valid admin session
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}

/**
 * Sets the HTTP-only admin session cookie
 */
export async function setAdminSessionCookie(): Promise<void> {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_SECONDS,
  });
}

/**
 * Clears the admin session cookie
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
