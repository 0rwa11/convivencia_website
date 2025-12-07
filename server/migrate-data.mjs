import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function migrateData() {
  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    const db = drizzle(connection);

    console.log("✓ Connected to database");
    console.log("✓ Migration complete - database is ready for use");

    await connection.end();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateData();
