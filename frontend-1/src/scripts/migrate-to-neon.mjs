import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);
const DATA_DIR = path.resolve(process.cwd(), "data");

async function runMigration() {
  console.log("Starting Neon PostgreSQL schema creation and data migration...");

  // 1. Create portfolio_content table for JSON schemas
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      section_key VARCHAR(64) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: portfolio_content");

  // 2. Create projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(128) PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT false,
      tags TEXT[] NOT NULL DEFAULT '{}',
      github_url TEXT NOT NULL DEFAULT '',
      live_url TEXT NOT NULL DEFAULT '',
      highlights TEXT[] NOT NULL DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: projects");

  // 3. Create experience table
  await sql`
    CREATE TABLE IF NOT EXISTS experience (
      id VARCHAR(128) PRIMARY KEY,
      role TEXT NOT NULL,
      organization TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_current BOOLEAN NOT NULL DEFAULT false,
      description TEXT NOT NULL,
      highlights TEXT[] NOT NULL DEFAULT '{}',
      technologies TEXT[] NOT NULL DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: experience");

  // 4. Create education table
  await sql`
    CREATE TABLE IF NOT EXISTS education (
      id VARCHAR(128) PRIMARY KEY,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      courses TEXT[] NOT NULL DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: education");

  // 5. Create achievements table
  await sql`
    CREATE TABLE IF NOT EXISTS achievements (
      id VARCHAR(128) PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: achievements");

  // 6. Create certificates table
  await sql`
    CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(128) PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      credential_id TEXT NOT NULL,
      verification_url TEXT NOT NULL DEFAULT '',
      skills TEXT[] NOT NULL DEFAULT '{}',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: certificates");

  // 7. Create music_tracks table
  await sql`
    CREATE TABLE IF NOT EXISTS music_tracks (
      id VARCHAR(128) PRIMARY KEY,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      duration REAL,
      format VARCHAR(32),
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: music_tracks");

  // 8. Create contact_messages table
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: contact_messages");

  // 9. Migrate and seed each JSON section into portfolio_content
  const sectionFiles = [
    { key: "profile", file: "profile.json" },
    { key: "projects", file: "projects.json" },
    { key: "experience", file: "experience.json" },
    { key: "education", file: "education.json" },
    { key: "skills", file: "skills.json" },
    { key: "certificates", file: "certificates.json" },
    { key: "achievements", file: "achievements.json" },
    { key: "resume", file: "resume.json" },
    { key: "social_links", file: "social-links.json" },
    { key: "site_settings", file: "site-settings.json" },
    { key: "coding_stats", file: "coding-stats.json" },
  ];

  for (const { key, file } of sectionFiles) {
    const filePath = path.join(DATA_DIR, file);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);

      await sql`
        INSERT INTO portfolio_content (section_key, data, updated_at)
        VALUES (${key}, ${JSON.stringify(data)}, NOW())
        ON CONFLICT (section_key)
        DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = NOW();
      `;
      console.log(`✓ Seeded portfolio_content -> ${key}`);
    } catch (e) {
      console.warn(`Could not seed ${file}:`, e.message);
    }
  }

  // 10. Seed relational projects table
  const projectsRaw = await fs.readFile(path.join(DATA_DIR, "projects.json"), "utf-8");
  const projects = JSON.parse(projectsRaw);
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    await sql`
      INSERT INTO projects (id, title, description, category, featured, tags, github_url, live_url, highlights, sort_order)
      VALUES (${p.id}, ${p.title}, ${p.description}, ${p.category}, ${p.featured ?? false}, ${p.tags ?? []}, ${p.githubUrl ?? ""}, ${p.liveUrl ?? ""}, ${p.highlights ?? []}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        featured = EXCLUDED.featured,
        tags = EXCLUDED.tags,
        github_url = EXCLUDED.github_url,
        live_url = EXCLUDED.live_url,
        highlights = EXCLUDED.highlights,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log(`✓ Seeded ${projects.length} relational projects`);

  // 11. Seed relational experience table
  const expRaw = await fs.readFile(path.join(DATA_DIR, "experience.json"), "utf-8");
  const expList = JSON.parse(expRaw);
  for (let i = 0; i < expList.length; i++) {
    const e = expList[i];
    await sql`
      INSERT INTO experience (id, role, organization, location, start_date, end_date, is_current, description, highlights, technologies, sort_order)
      VALUES (${e.id}, ${e.role}, ${e.organization}, ${e.location}, ${e.startDate}, ${e.endDate}, ${e.isCurrent ?? false}, ${e.description}, ${e.highlights ?? []}, ${e.technologies ?? []}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        organization = EXCLUDED.organization,
        location = EXCLUDED.location,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        is_current = EXCLUDED.is_current,
        description = EXCLUDED.description,
        highlights = EXCLUDED.highlights,
        technologies = EXCLUDED.technologies,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log(`✓ Seeded ${expList.length} relational experiences`);

  // 12. Seed relational achievements table
  const achRaw = await fs.readFile(path.join(DATA_DIR, "achievements.json"), "utf-8");
  const achList = JSON.parse(achRaw);
  for (let i = 0; i < achList.length; i++) {
    const a = achList[i];
    await sql`
      INSERT INTO achievements (id, title, category, date, description, impact, sort_order)
      VALUES (${a.id}, ${a.title}, ${a.category}, ${a.date}, ${a.description}, ${a.impact}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        description = EXCLUDED.description,
        impact = EXCLUDED.impact,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log(`✓ Seeded ${achList.length} relational achievements`);

  console.log("\n=======================================================");
  console.log("Migration and database seeding completed successfully!");
  console.log("=======================================================");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
