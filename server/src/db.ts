import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "app.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    salary INTEGER NOT NULL,
    status TEXT NOT NULL,
    appliedDate TEXT,
    followUpDate TEXT,
    contact TEXT,
    notes TEXT,
    source TEXT NOT NULL,
    priority TEXT NOT NULL,
    jobUrl TEXT NOT NULL,
    validationStatus TEXT NOT NULL
  )
`);

const applicationColumns = db
  .prepare("PRAGMA table_info(applications)")
  .all() as Array<{ name: string }>;

if (!applicationColumns.some((column) => column.name === "userId")) {
  db.exec("ALTER TABLE applications ADD COLUMN userId TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt TEXT NOT NULL
  )
`);
