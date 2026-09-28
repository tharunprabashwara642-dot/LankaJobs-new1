import { readFile } from "node:fs/promises";
import { pool } from "./index";

const migrationName = "0000_lankajobs.sql";
const migrationUrl = new URL(`../migrations/${migrationName}`, import.meta.url);
const sql = await readFile(migrationUrl, "utf8");
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('lankajobs:migrations'))");
  await client.query(`
    CREATE TABLE IF NOT EXISTS "lankajobs_migrations" (
      "name" text PRIMARY KEY NOT NULL,
      "applied_at" timestamptz DEFAULT now() NOT NULL
    )
  `);
  const existing = await client.query<{ name: string }>(
    `SELECT "name" FROM "lankajobs_migrations" WHERE "name" = $1`,
    [migrationName],
  );
  if (existing.rowCount === 0) {
    await client.query(sql);
    await client.query(`INSERT INTO "lankajobs_migrations" ("name") VALUES ($1)`, [migrationName]);
    console.log(`Applied ${migrationName}`);
  } else {
    console.log(`${migrationName} already applied`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}