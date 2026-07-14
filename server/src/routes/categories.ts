import { Router } from 'express'
import db from '../db.js'
import type { AuthRequest } from '../middleware/auth.js'

const VALID_KINDS = ['expense', 'income', 'balance']

const router = Router()

router.get('/', async (req: AuthRequest, res) => {
  const kind = (req.query.kind as string) || 'expense'
  if (!VALID_KINDS.includes(kind)) {
    res.status(400).json({ error: 'Invalid kind. Must be expense, income, or balance' })
    return
  }
  const result = await db.execute({ sql: 'SELECT name FROM custom_categories WHERE user_id = ? AND kind = ?', args: [req.userId as string, kind] })
  res.json(result.rows.map(r => (r as any).name))
})

router.post('/', async (req: AuthRequest, res) => {
  const { name, kind } = req.body
  if (!name) {
    res.status(400).json({ error: 'Category name is required' })
    return
  }
  const categoryKind = kind && VALID_KINDS.includes(kind) ? kind : 'expense'
  try {
    await db.execute({ sql: 'INSERT INTO custom_categories (user_id, name, kind) VALUES (?, ?, ?)', args: [req.userId as string, name, categoryKind] })
    res.status(201).json({ name, kind: categoryKind })
  } catch {
    res.status(409).json({ error: 'Category already exists' })
  }
})

router.delete('/:name', async (req: AuthRequest, res) => {
  const kind = (req.query.kind as string) || 'expense'
  if (!VALID_KINDS.includes(kind)) {
    res.status(400).json({ error: 'Invalid kind. Must be expense, income, or balance' })
    return
  }
  const result = await db.execute({ sql: 'DELETE FROM custom_categories WHERE user_id = ? AND name = ? AND kind = ?', args: [req.userId as string, req.params.name as string, kind] })
  if (result.rowsAffected === 0) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.json({ success: true })
})

export default router
