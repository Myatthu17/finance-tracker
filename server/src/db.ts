import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS incomes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS balances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,
    type TEXT NOT NULL,
    won_amount REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS custom_categories (
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'expense',
    PRIMARY KEY (user_id, name, kind),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

// Migration: add `kind` column to existing custom_categories tables
try {
  const colInfo = db.pragma('table_info(custom_categories)') as { name: string }[]
  const hasKind = colInfo.some(c => c.name === 'kind')
  if (!hasKind) {
    db.exec(`
      ALTER TABLE custom_categories RENAME TO custom_categories_old;
      CREATE TABLE custom_categories (
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'expense',
        PRIMARY KEY (user_id, name, kind),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO custom_categories (user_id, name, kind)
        SELECT user_id, name, 'expense' FROM custom_categories_old;
      DROP TABLE custom_categories_old;
    `)
  }
} catch {
  // table may not exist yet, ignore
}

export default db
