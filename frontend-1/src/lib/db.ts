import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlInstance: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> | null {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    return null;
  }
  if (!sqlInstance) {
    sqlInstance = neon(databaseUrl);
  }
  return sqlInstance;
}

/**
 * Fetch a JSON section from Neon PostgreSQL with graceful fallback to null.
 */
export async function getDbContent<T>(sectionKey: string): Promise<T | null> {
  const sql = getDb();
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT data FROM portfolio_content WHERE section_key = ${sectionKey} LIMIT 1;
    `;
    if (rows && rows.length > 0 && rows[0].data) {
      return rows[0].data as T;
    }
    return null;
  } catch (error) {
    console.error(`[Neon DB] Failed to fetch content for ${sectionKey}:`, error);
    return null;
  }
}

/**
 * Upsert a JSON section into Neon PostgreSQL.
 */
export async function setDbContent<T>(sectionKey: string, data: T): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO portfolio_content (section_key, data, updated_at)
      VALUES (${sectionKey}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (section_key)
      DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = NOW();
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Failed to save content for ${sectionKey}:`, error);
    return false;
  }
}

/**
 * Save an incoming visitor contact message into Neon PostgreSQL.
 */
export async function saveContactMessage(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES (${msg.name}, ${msg.email}, ${msg.subject || ""}, ${msg.message}, NOW());
    `;
    return true;
  } catch (error) {
    console.error("[Neon DB] Failed to save contact message:", error);
    return false;
  }
}

/**
 * Retrieve visitor contact messages from Neon PostgreSQL.
 */
export async function getContactMessages() {
  const sql = getDb();
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, name, email, subject, message, read, created_at
      FROM contact_messages
      ORDER BY created_at DESC;
    `;
    return rows;
  } catch (error) {
    console.error("[Neon DB] Failed to fetch contact messages:", error);
    return [];
  }
}

/**
 * Music library operations backed by Neon PostgreSQL.
 */
export interface DbMusicTrack {
  id: string;
  title: string;
  filename: string;
  url: string;
  duration?: number;
  format?: string;
  is_favorite?: boolean;
  order_index?: number;
  created_at?: string;
}

export async function getDbMusicTracks(): Promise<DbMusicTrack[] | null> {
  const sql = getDb();
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT id, title, filename, url, duration, format, is_favorite, order_index, created_at
      FROM music_tracks
      ORDER BY order_index ASC, created_at DESC;
    `;
    return rows as unknown as DbMusicTrack[];
  } catch (error) {
    console.error("[Neon DB] Failed to fetch music tracks:", error);
    return null;
  }
}

export async function saveDbMusicTrack(track: {
  id: string;
  title: string;
  filename: string;
  url: string;
  duration?: number;
  format?: string;
  is_favorite?: boolean;
  order_index?: number;
}): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO music_tracks (id, title, filename, url, duration, format, is_favorite, order_index, created_at)
      VALUES (${track.id}, ${track.title}, ${track.filename}, ${track.url}, ${track.duration || 0}, ${track.format || ""}, ${track.is_favorite ?? false}, ${track.order_index ?? 0}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        filename = EXCLUDED.filename,
        url = EXCLUDED.url,
        duration = EXCLUDED.duration,
        format = EXCLUDED.format,
        is_favorite = EXCLUDED.is_favorite,
        order_index = EXCLUDED.order_index;
    `;
    return true;
  } catch (error) {
    console.error("[Neon DB] Failed to save music track:", error);
    return false;
  }
}

export async function deleteDbMusicTrack(id: string): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      DELETE FROM music_tracks WHERE id = ${id};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Failed to delete music track ${id}:`, error);
    return false;
  }
}
