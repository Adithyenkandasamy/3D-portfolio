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

/**
 * ========================================
 * TIMELINE ENTRIES (Phase 7)
 * ========================================
 */
export interface DbTimelineEntry {
  id: string;
  title: string;
  category: "school" | "college" | "internship" | "employment" | "milestone";
  institution: string;
  role: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  logo_url?: string;
  external_link?: string;
  order_index: number;
  is_published: boolean;
  created_at?: string;
}

export async function getDbTimelineEntries(): Promise<DbTimelineEntry[]> {
  const sql = getDb();
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, title, category, institution, role, start_date, end_date,
             is_current, description, responsibilities, achievements,
             technologies, logo_url, external_link, order_index, is_published, created_at
      FROM timeline_entries
      WHERE is_published = true
      ORDER BY order_index ASC, created_at DESC;
    `;
    return rows as unknown as DbTimelineEntry[];
  } catch (error) {
    console.error("[Neon DB] Failed to fetch timeline entries:", error);
    return [];
  }
}

export async function getAllDbTimelineEntries(): Promise<DbTimelineEntry[]> {
  const sql = getDb();
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, title, category, institution, role, start_date, end_date,
             is_current, description, responsibilities, achievements,
             technologies, logo_url, external_link, order_index, is_published, created_at
      FROM timeline_entries
      ORDER BY order_index ASC, created_at DESC;
    `;
    return rows as unknown as DbTimelineEntry[];
  } catch (error) {
    console.error("[Neon DB] Failed to fetch all timeline entries:", error);
    return [];
  }
}

export async function saveDbTimelineEntry(entry: DbTimelineEntry): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO timeline_entries (
        id, title, category, institution, role, start_date, end_date, is_current,
        description, responsibilities, achievements, technologies, logo_url,
        external_link, order_index, is_published, created_at
      )
      VALUES (
        ${entry.id}, ${entry.title}, ${entry.category}, ${entry.institution},
        ${entry.role}, ${entry.start_date}, ${entry.end_date}, ${entry.is_current},
        ${entry.description}, ${JSON.stringify(entry.responsibilities || [])},
        ${JSON.stringify(entry.achievements || [])}, ${JSON.stringify(entry.technologies || [])},
        ${entry.logo_url || null}, ${entry.external_link || null}, ${entry.order_index ?? 0},
        ${entry.is_published ?? true}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        institution = EXCLUDED.institution,
        role = EXCLUDED.role,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        is_current = EXCLUDED.is_current,
        description = EXCLUDED.description,
        responsibilities = EXCLUDED.responsibilities,
        achievements = EXCLUDED.achievements,
        technologies = EXCLUDED.technologies,
        logo_url = EXCLUDED.logo_url,
        external_link = EXCLUDED.external_link,
        order_index = EXCLUDED.order_index,
        is_published = EXCLUDED.is_published;
    `;
    return true;
  } catch (error) {
    console.error("[Neon DB] Failed to save timeline entry:", error);
    return false;
  }
}

export async function deleteDbTimelineEntry(id: string): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      DELETE FROM timeline_entries WHERE id = ${id};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Failed to delete timeline entry ${id}:`, error);
    return false;
  }
}

/**
 * ========================================
 * VISITOR COMMENTS (Phase 10: "HEY THERE!")
 * ========================================
 */
export interface DbVisitorComment {
  id: number;
  name: string;
  message: string;
  visitor_id: string;
  ip_hash: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string;
}

export async function getDbApprovedComments(): Promise<Omit<DbVisitorComment, "visitor_id" | "ip_hash">[]> {
  const sql = getDb();
  if (!sql) return [];

  try {
    const rows = await sql`
      SELECT id, name, message, status, created_at
      FROM visitor_comments
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    return rows as unknown as Omit<DbVisitorComment, "visitor_id" | "ip_hash">[];
  } catch (error) {
    console.error("[Neon DB] Failed to fetch approved comments:", error);
    return [];
  }
}

export async function getAllDbComments(statusFilter?: "pending" | "approved" | "rejected"): Promise<DbVisitorComment[]> {
  const sql = getDb();
  if (!sql) return [];

  try {
    const rows = statusFilter
      ? await sql`
          SELECT id, name, message, visitor_id, ip_hash, status, created_at, reviewed_at
          FROM visitor_comments
          WHERE status = ${statusFilter}
          ORDER BY created_at DESC;
        `
      : await sql`
          SELECT id, name, message, visitor_id, ip_hash, status, created_at, reviewed_at
          FROM visitor_comments
          ORDER BY created_at DESC;
        `;
    return rows as unknown as DbVisitorComment[];
  } catch (error) {
    console.error("[Neon DB] Failed to fetch comments:", error);
    return [];
  }
}

export async function getVisitorCommentCount(visitorId: string, ipHash: string): Promise<number> {
  const sql = getDb();
  if (!sql) return 0;

  try {
    const rows = await sql`
      SELECT COUNT(*)::int as count
      FROM visitor_comments
      WHERE visitor_id = ${visitorId} OR ip_hash = ${ipHash};
    `;
    return rows && rows[0] ? (rows[0].count as number) : 0;
  } catch (error) {
    console.error("[Neon DB] Failed to count visitor comments:", error);
    return 0;
  }
}

export async function createVisitorComment(data: {
  name: string;
  message: string;
  visitorId: string;
  ipHash: string;
}): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO visitor_comments (name, message, visitor_id, ip_hash, status, created_at)
      VALUES (${data.name}, ${data.message}, ${data.visitorId}, ${data.ipHash}, 'pending', NOW());
    `;
    return true;
  } catch (error) {
    console.error("[Neon DB] Failed to create visitor comment:", error);
    return false;
  }
}

export async function updateCommentStatus(id: number, status: "approved" | "rejected"): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      UPDATE visitor_comments
      SET status = ${status}, reviewed_at = NOW()
      WHERE id = ${id};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Failed to update comment status for ${id}:`, error);
    return false;
  }
}

export async function deleteVisitorComment(id: number): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await sql`
      DELETE FROM visitor_comments WHERE id = ${id};
    `;
    return true;
  } catch (error) {
    console.error(`[Neon DB] Failed to delete comment ${id}:`, error);
    return false;
  }
}

