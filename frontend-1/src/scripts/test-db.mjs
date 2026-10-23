import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testConnection() {
  try {
    const result = await sql`SELECT current_database(), current_user, version();`;
    console.log("Successfully connected to Neon PostgreSQL!");
    console.log("Database:", result[0].current_database);
    console.log("User:", result[0].current_user);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

testConnection();
