import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Migrating timeline_entries and visitor_comments to Neon DB...");

  // 1. Create timeline_entries table
  await sql`
    CREATE TABLE IF NOT EXISTS timeline_entries (
      id VARCHAR(128) PRIMARY KEY,
      title TEXT NOT NULL,
      category VARCHAR(64) NOT NULL DEFAULT 'employment',
      institution TEXT NOT NULL,
      role TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_current BOOLEAN NOT NULL DEFAULT false,
      description TEXT NOT NULL,
      responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
      achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
      technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
      logo_url TEXT,
      external_link TEXT,
      order_index INT NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ Created table: timeline_entries");

  // 2. Create visitor_comments table
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_comments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      message TEXT NOT NULL,
      visitor_id VARCHAR(128) NOT NULL,
      ip_hash VARCHAR(128) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    );
  `;
  console.log("✓ Created table: visitor_comments");

  // Create index for status and visitor_id lookup
  await sql`
    CREATE INDEX IF NOT EXISTS idx_visitor_comments_status ON visitor_comments(status);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_visitor_comments_visitor_id ON visitor_comments(visitor_id);
  `;
  console.log("✓ Created indexes on visitor_comments");

  // 3. Seed verified timeline entries
  const seedEntries = [
    {
      id: "exp-sns-square-hub",
      title: "AI/ML & Software Developer Intern",
      category: "internship",
      institution: "SNS Square Hub",
      role: "AI/ML Developer",
      start_date: "Feb 2026",
      end_date: "Present",
      is_current: true,
      description: "Developing multimodal computer vision systems, high-speed document OCR pipelines, and real-time backend microservices with FastAPI and Python.",
      responsibilities: [
        "Architecting low-latency OCR inference microservices processing complex document layouts",
        "Building real-time computer vision pipelines for touchless spatial interfaces",
        "Optimizing LLM agent tool calling protocols and structured JSON extraction"
      ],
      achievements: [
        "Deployed edge-optimized inference pipelines with sub-100ms latency",
        "Engineered production-grade FastAPI microservices with connection pooling"
      ],
      technologies: ["Python", "FastAPI", "OpenCV", "MediaPipe", "Docker", "PostgreSQL"],
      external_link: "https://www.linkedin.com/in/adithyen-k",
      order_index: 1,
      is_published: true
    },
    {
      id: "exp-magizh-technologies",
      title: "Full Stack & AI Developer Intern",
      category: "internship",
      institution: "Magizh Technologies",
      role: "Full-Stack & AI Intern",
      start_date: "Jun 2025",
      end_date: "Nov 2025",
      is_current: false,
      description: "Engineered scalable web applications, real-time dispatch systems, and conversational AI integrations with Next.js, FastAPI, and PostgreSQL.",
      responsibilities: [
        "Designed and implemented high-throughput REST APIs and WebSocket communication layers",
        "Built responsive web user interfaces using Next.js App Router and Tailwind CSS",
        "Integrated AI automation workflows using LangChain, Groq, and Redis caching"
      ],
      achievements: [
        "Improved API throughput by 35% with Redis session caching and query optimizations",
        "Delivered multi-tenant full-stack platforms with strict role-based access control"
      ],
      technologies: ["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL", "Redis"],
      external_link: "https://www.linkedin.com/in/adithyen-k",
      order_index: 2,
      is_published: true
    },
    {
      id: "milestone-cryptora-26",
      title: "1st Place Winner — Cryptora'26 National Hackathon",
      category: "milestone",
      institution: "National Technical Symposium",
      role: "Lead Architect & Developer",
      start_date: "Jan 2026",
      end_date: "Jan 2026",
      is_current: false,
      description: "Won 1st Place out of 100+ competing teams for RESQ, an autonomous emergency response and real-time coordination dispatch system.",
      responsibilities: [
        "Architected end-to-end incident dispatch routing using geospatial indexing",
        "Integrated real-time WebSocket vehicle telematics tracking and priority queueing"
      ],
      achievements: [
        "Secured 1st Prize with unanimous judge acclaim for practical real-world impact",
        "Demonstrated live failover and incident rerouting during final presentation"
      ],
      technologies: ["FastAPI", "Next.js", "WebSockets", "PostgreSQL", "Mapbox"],
      external_link: "https://github.com/Adithyenkandasamy",
      order_index: 3,
      is_published: true
    },
    {
      id: "milestone-code-cubicle",
      title: "Finalist — Code Cubicle 5.0 Hackathon",
      category: "milestone",
      institution: "Microsoft Office, Bengaluru",
      role: "Team Lead & System Architect",
      start_date: "Nov 2025",
      end_date: "Nov 2025",
      is_current: false,
      description: "Selected among top finalists nationwide to build and present intelligent developer tools at Microsoft Bengaluru headquarters.",
      responsibilities: [
        "Engineered an AST-based code analysis and visual execution tracer",
        "Presented system architecture to senior cloud architects at Microsoft"
      ],
      achievements: [
        "Top 10 Finalist nationally at Microsoft Bengaluru campus"
      ],
      technologies: ["TypeScript", "Next.js", "Python", "AST Parser", "FastAPI"],
      external_link: "https://github.com/Adithyenkandasamy",
      order_index: 4,
      is_published: true
    },
    {
      id: "edu-sns-college",
      title: "B.E. in Computer Science and Engineering",
      category: "college",
      institution: "SNS College of Technology",
      role: "Undergraduate Student",
      start_date: "2023",
      end_date: "2027",
      is_current: true,
      description: "Pursuing Bachelor of Engineering with strong focus on Distributed Systems, Artificial Intelligence, Database Management, and Object-Oriented Software Design.",
      responsibilities: [
        "Current CGPA: 7.31 / 10.0",
        "Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, Machine Learning"
      ],
      achievements: [
        "Active member of Developer Student Clubs and Technical Organizing Committee",
        "Mentored junior students in full-stack web engineering and Python development"
      ],
      technologies: ["C", "C++", "Java", "Python", "SQL", "Data Structures"],
      external_link: "https://www.linkedin.com/in/adithyen-k",
      order_index: 5,
      is_published: true
    }
  ];

  for (const entry of seedEntries) {
    await sql`
      INSERT INTO timeline_entries (
        id, title, category, institution, role, start_date, end_date, is_current,
        description, responsibilities, achievements, technologies, external_link, order_index, is_published, created_at
      )
      VALUES (
        ${entry.id}, ${entry.title}, ${entry.category}, ${entry.institution}, ${entry.role},
        ${entry.start_date}, ${entry.end_date}, ${entry.is_current}, ${entry.description},
        ${JSON.stringify(entry.responsibilities)}, ${JSON.stringify(entry.achievements)},
        ${JSON.stringify(entry.technologies)}, ${entry.external_link}, ${entry.order_index},
        ${entry.is_published}, NOW()
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
        external_link = EXCLUDED.external_link,
        order_index = EXCLUDED.order_index,
        is_published = EXCLUDED.is_published;
    `;
  }

  console.log(`✓ Seeded ${seedEntries.length} verified timeline entries into Neon DB!`);
  console.log("Migration completed successfully!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
