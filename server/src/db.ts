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
      password TEXT,
      google_id TEXT UNIQUE,
      auth_provider TEXT NOT NULL DEFAULT 'password',
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

  // Migration: add google_id/auth_provider columns, make password nullable.
  // `users` is an FK parent for incomes/expenses/balances/custom_categories,
  // so it must never be RENAMED while those FKs exist: SQLite/libSQL rewrites
  // the other tables' REFERENCES clauses to follow the rename target. Build
  // the replacement under `users_new` instead (nothing references that name,
  // so renaming it -> `users` at the end rewrites nothing).
  const userColInfo = await client.execute('PRAGMA table_info(users)')
  if (!userColInfo.rows.some(c => (c as any).name === 'google_id')) {
    await client.executeMultiple(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        auth_provider TEXT NOT NULL DEFAULT 'password',
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO users_new (id, email, username, password, created_at)
        SELECT id, email, username, password, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      PRAGMA foreign_keys = ON;
    `)
  }

  // Corrective migration: an earlier buggy version of the migration above
  // renamed `users` directly, which caused SQLite to silently rewrite these
  // four tables' FOREIGN KEY clauses to reference the now-dropped
  // `users_old`. Detect via PRAGMA foreign_key_list (resolves the actual
  // parent table regardless of schema-text quoting) and rebuild any
  // affected table against the correct `users` table, preserving all rows.
  // None of these tables are ever an FK parent themselves, so renaming them
  // away and back is safe. Idempotent: already-correct tables are untouched.
  async function isFkCorrupted(table: string): Promise<boolean> {
    const fk = await client.execute(`PRAGMA foreign_key_list(${table})`)
    return fk.rows.some(r => (r as any).table === 'users_old')
  }

  if (await isFkCorrupted('incomes')) {
    await client.executeMultiple(`
      ALTER TABLE incomes RENAME TO incomes_broken;
      CREATE TABLE incomes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO incomes (id, user_id, date, category, description, amount)
        SELECT id, user_id, date, category, description, amount FROM incomes_broken;
      DROP TABLE incomes_broken;
    `)
  }

  if (await isFkCorrupted('expenses')) {
    await client.executeMultiple(`
      ALTER TABLE expenses RENAME TO expenses_broken;
      CREATE TABLE expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        installment_label TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO expenses (id, user_id, date, category, description, amount, installment_label)
        SELECT id, user_id, date, category, description, amount, installment_label FROM expenses_broken;
      DROP TABLE expenses_broken;
    `)
  }

  if (await isFkCorrupted('balances')) {
    await client.executeMultiple(`
      ALTER TABLE balances RENAME TO balances_broken;
      CREATE TABLE balances (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        month TEXT NOT NULL,
        type TEXT NOT NULL,
        won_amount REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO balances (id, user_id, month, type, won_amount)
        SELECT id, user_id, month, type, won_amount FROM balances_broken;
      DROP TABLE balances_broken;
    `)
  }

  if (await isFkCorrupted('custom_categories')) {
    await client.executeMultiple(`
      ALTER TABLE custom_categories RENAME TO custom_categories_broken;
      CREATE TABLE custom_categories (
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'expense',
        PRIMARY KEY (user_id, name, kind),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      INSERT INTO custom_categories (user_id, name, kind)
        SELECT user_id, name, kind FROM custom_categories_broken;
      DROP TABLE custom_categories_broken;
    `)
  }
}

export default client
