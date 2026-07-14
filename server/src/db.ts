import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initDb() {
  await client.executeMultiple(`
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
      installment_label TEXT,
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
  const colInfo = await client.execute('PRAGMA table_info(custom_categories)')
  const hasKind = colInfo.rows.some(c => (c as any).name === 'kind')
  if (!hasKind) {
    await client.executeMultiple(`
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

  // Migration: add installment_label column to expenses
  const expColInfo = await client.execute('PRAGMA table_info(expenses)')
  if (!expColInfo.rows.some(c => (c as any).name === 'installment_label')) {
    await client.execute('ALTER TABLE expenses ADD COLUMN installment_label TEXT')
  }

  // Migration: add google_id/auth_provider columns, make password nullable
  const userColInfo = await client.execute('PRAGMA table_info(users)')
  if (!userColInfo.rows.some(c => (c as any).name === 'google_id')) {
    await client.executeMultiple(`
      ALTER TABLE users RENAME TO users_old;
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        auth_provider TEXT NOT NULL DEFAULT 'password',
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO users (id, email, username, password, created_at)
        SELECT id, email, username, password, created_at FROM users_old;
      DROP TABLE users_old;
    `)
  }
}

export default client
