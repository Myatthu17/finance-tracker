import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ensure tables exist
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

const DEMO_EMAIL = 'demo@example.com'
const DEMO_USERNAME = 'demo'
const DEMO_PASSWORD = 'demo123'

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL) as { id: string } | undefined
if (existing) {
  console.log('Demo account already exists — skipping seed.')
  process.exit(0)
}

const userId = uuid()
const hashed = bcrypt.hashSync(DEMO_PASSWORD, 10)
db.prepare('INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)').run(userId, DEMO_EMAIL, DEMO_USERNAME, hashed)

// ── Custom categories ──
const customCategories: { name: string; kind: string }[] = [
  { name: 'Coffee', kind: 'expense' },
  { name: 'Freelance', kind: 'income' },
  { name: 'Savings', kind: 'balance' },
]
const insertCat = db.prepare('INSERT OR IGNORE INTO custom_categories (user_id, name, kind) VALUES (?, ?, ?)')
for (const c of customCategories) {
  insertCat.run(userId, c.name, c.kind)
}

// ── Incomes ──
const incomes: { date: string; category: string; description: string; amount: number }[] = []
const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

for (const m of months) {
  incomes.push({ date: `${m}-01`, category: 'Mom & Dad', description: 'Monthly support', amount: 500000 })
  incomes.push({ date: `${m}-05`, category: '알바', description: 'Part-time work', amount: 400000 })
}
// Extra scholarship in March
incomes.push({ date: '2026-03-15', category: 'Scholarship', description: 'Academic scholarship', amount: 1000000 })
// One freelance income to demo custom category
incomes.push({ date: '2026-06-20', category: 'Freelance', description: 'Web design project', amount: 300000 })

const insertIncome = db.prepare('INSERT INTO incomes (id, user_id, date, category, description, amount) VALUES (?, ?, ?, ?, ?, ?)')
for (const inc of incomes) {
  insertIncome.run(uuid(), userId, inc.date, inc.category, inc.description, inc.amount)
}

// ── Expenses ──
const expenses: { date: string; category: string; description: string; amount: number; installmentLabel?: string }[] = [
  // Jan 2026
  { date: '2026-01-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-01-05', category: 'Food', description: 'Groceries', amount: 120000 },
  { date: '2026-01-10', category: 'Food', description: 'Eating out', amount: 65000 },
  { date: '2026-01-07', category: 'Transportation', description: 'Bus & subway pass', amount: 55000 },
  { date: '2026-01-12', category: 'Utilities', description: 'Electric bill', amount: 35000 },
  { date: '2026-01-15', category: 'Entertainment', description: 'Movie tickets', amount: 24000 },
  { date: '2026-01-18', category: 'Personal Spending', description: 'Clothing', amount: 70000 },
  { date: '2026-01-20', category: 'Insurance & visa', description: 'Health insurance', amount: 50000 },
  { date: '2026-01-08', category: 'Miscellaneous', description: 'Household items', amount: 25000 },
  { date: '2026-01-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (1/6)' },

  // Feb 2026
  { date: '2026-02-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-02-06', category: 'Food', description: 'Groceries', amount: 130000 },
  { date: '2026-02-12', category: 'Food', description: 'Eating out', amount: 75000 },
  { date: '2026-02-07', category: 'Transportation', description: 'Bus & subway pass', amount: 55000 },
  { date: '2026-02-14', category: 'Utilities', description: 'Gas bill', amount: 40000 },
  { date: '2026-02-10', category: 'Entertainment', description: 'Concert ticket', amount: 55000 },
  { date: '2026-02-16', category: 'Personal Spending', description: 'Skincare', amount: 45000 },
  { date: '2026-02-20', category: 'Insurance & visa', description: 'Health insurance', amount: 50000 },
  { date: '2026-02-22', category: 'Beverages', description: 'Coffee & drinks', amount: 30000 },
  { date: '2026-02-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (2/6)' },

  // Mar 2026
  { date: '2026-03-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-03-05', category: 'Food', description: 'Groceries', amount: 140000 },
  { date: '2026-03-11', category: 'Food', description: 'Eating out', amount: 60000 },
  { date: '2026-03-07', category: 'Transportation', description: 'Bus & subway pass', amount: 55000 },
  { date: '2026-03-13', category: 'Utilities', description: 'Water bill', amount: 30000 },
  { date: '2026-03-18', category: 'Education', description: 'Online course', amount: 80000 },
  { date: '2026-03-20', category: 'Personal Spending', description: 'Accessories', amount: 35000 },
  { date: '2026-03-22', category: 'Insurance & visa', description: 'Health insurance', amount: 50000 },
  { date: '2026-03-25', category: 'Medical & Healthcare', description: 'Doctor visit', amount: 45000 },
  { date: '2026-03-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (3/6)' },

  // Apr 2026
  { date: '2026-04-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-04-04', category: 'Food', description: 'Groceries', amount: 150000 },
  { date: '2026-04-10', category: 'Food', description: 'Eating out', amount: 70000 },
  { date: '2026-04-07', category: 'Transportation', description: 'Bus & subway pass', amount: 60000 },
  { date: '2026-04-12', category: 'Utilities', description: 'Internet bill', amount: 38000 },
  { date: '2026-04-15', category: 'Entertainment', description: 'Streaming subscription', amount: 15000 },
  { date: '2026-04-19', category: 'Household goods', description: 'Kitchen supplies', amount: 42000 },
  { date: '2026-04-22', category: 'Personal Spending', description: 'Cosmetics', amount: 55000 },
  { date: '2026-04-25', category: 'Insurance & visa', description: 'Visa renewal', amount: 80000 },
  { date: '2026-04-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (4/6)' },

  // May 2026
  { date: '2026-05-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-05-06', category: 'Food', description: 'Groceries', amount: 110000 },
  { date: '2026-05-12', category: 'Food', description: 'Eating out', amount: 85000 },
  { date: '2026-05-07', category: 'Transportation', description: 'Bus & subway pass', amount: 55000 },
  { date: '2026-05-14', category: 'Utilities', description: 'Electric bill', amount: 32000 },
  { date: '2026-05-18', category: 'Gifts & Donations', description: 'Birthday gift', amount: 50000 },
  { date: '2026-05-21', category: 'Personal Spending', description: 'Electronics', amount: 90000 },
  { date: '2026-05-23', category: 'Insurance & visa', description: 'Health insurance', amount: 50000 },
  { date: '2026-05-10', category: 'Pet', description: 'Pet food', amount: 35000 },
  { date: '2026-05-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (5/6)' },

  // Jun 2026
  { date: '2026-06-03', category: 'Housing', description: 'Monthly rent', amount: 200000 },
  { date: '2026-06-05', category: 'Food', description: 'Groceries', amount: 160000 },
  { date: '2026-06-11', category: 'Food', description: 'Eating out', amount: 55000 },
  { date: '2026-06-07', category: 'Transportation', description: 'Bus & subway pass', amount: 60000 },
  { date: '2026-06-14', category: 'Utilities', description: 'Gas bill', amount: 25000 },
  { date: '2026-06-17', category: 'Entertainment', description: 'Game purchase', amount: 48000 },
  { date: '2026-06-20', category: 'Personal Spending', description: 'Fitness class', amount: 60000 },
  { date: '2026-06-22', category: 'Saving', description: 'Monthly savings', amount: 100000 },
  { date: '2026-06-25', category: 'Insurance & visa', description: 'Health insurance', amount: 50000 },
  { date: '2026-06-02', category: 'Coffee', description: 'Coffee beans', amount: 15000 },
  { date: '2026-06-15', category: 'PC', description: 'Laptop installment', amount: 120000, installmentLabel: 'PC (6/6)' },
]

const insertExpense = db.prepare('INSERT INTO expenses (id, user_id, date, category, description, amount, installment_label) VALUES (?, ?, ?, ?, ?, ?, ?)')
for (const exp of expenses) {
  insertExpense.run(uuid(), userId, exp.date, exp.category, exp.description, exp.amount, exp.installmentLabel || null)
}

// ── Balances ──
const balances: { month: string; type: string; wonAmount: number }[] = [
  { month: '2026-01', type: 'Cash', wonAmount: 150000 },
  { month: '2026-01', type: 'Card', wonAmount: 450000 },
  { month: '2026-02', type: 'Cash', wonAmount: 180000 },
  { month: '2026-02', type: 'Card', wonAmount: 420000 },
  { month: '2026-03', type: 'Cash', wonAmount: 800000 },
  { month: '2026-03', type: 'Card', wonAmount: 380000 },
  { month: '2026-04', type: 'Cash', wonAmount: 220000 },
  { month: '2026-04', type: 'Card', wonAmount: 500000 },
  { month: '2026-05', type: 'Cash', wonAmount: 160000 },
  { month: '2026-05', type: 'Card', wonAmount: 470000 },
  { month: '2026-06', type: 'Cash', wonAmount: 300000 },
  { month: '2026-06', type: 'Card', wonAmount: 530000 },
  { month: '2026-06', type: 'Savings', wonAmount: 100000 },
]

const insertBalance = db.prepare('INSERT INTO balances (id, user_id, month, type, won_amount) VALUES (?, ?, ?, ?, ?)')
for (const b of balances) {
  insertBalance.run(uuid(), userId, b.month, b.type, b.wonAmount)
}

console.log('Seed complete!')
console.log(`  Email:    ${DEMO_EMAIL}`)
console.log(`  Username: ${DEMO_USERNAME}`)
console.log(`  Password: ${DEMO_PASSWORD}`)
console.log(`  User ID:  ${userId}`)
