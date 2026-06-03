import { Router } from 'express'
import db from '../db'
import type { AuthRequest } from '../middleware/auth'

const VALID_KINDS = ['expense', 'income', 'balance']

const router = Router()

router.get('/', (req: AuthRequest, res) => {
  const kind = (req.query.kind as string) || 'expense'
  if (!VALID_KINDS.includes(kind)) {
    res.status(400).json({ error: 'Invalid kind. Must be expense, income, or balance' })
    return
  }
  const rows = db.prepare('SELECT name FROM custom_categories WHERE user_id = ? AND kind = ?').all(req.userId, kind) as { name: string }[]
  res.json(rows.map(r => r.name))
})

router.post('/', (req: AuthRequest, res) => {
  const { name, kind } = req.body
  if (!name) {
    res.status(400).json({ error: 'Category name is required' })
    return
  }
  const categoryKind = kind && VALID_KINDS.includes(kind) ? kind : 'expense'
  try {
    db.prepare('INSERT INTO custom_categories (user_id, name, kind) VALUES (?, ?, ?)').run(req.userId, name, categoryKind)
    res.status(201).json({ name, kind: categoryKind })
  } catch {
    res.status(409).json({ error: 'Category already exists' })
  }
})

router.delete('/:name', (req: AuthRequest, res) => {
  const kind = (req.query.kind as string) || 'expense'
  if (!VALID_KINDS.includes(kind)) {
    res.status(400).json({ error: 'Invalid kind. Must be expense, income, or balance' })
    return
  }
  const result = db.prepare('DELETE FROM custom_categories WHERE user_id = ? AND name = ? AND kind = ?').run(req.userId, req.params.name, kind)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.json({ success: true })
})

export default router
