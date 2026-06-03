import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', (req: AuthRequest, res) => {
  const rows = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC').all(req.userId)
  res.json(rows)
})

router.post('/', (req: AuthRequest, res) => {
  const { date, category, description, amount } = req.body
  if (!date || !category || description === undefined || amount == null) {
    res.status(400).json({ error: 'date, category, description, and amount are required' })
    return
  }
  const id = uuid()
  db.prepare('INSERT INTO expenses (id, user_id, date, category, description, amount) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.userId, date, category, description, amount)
  res.status(201).json({ id, date, category, description, amount })
})

router.put('/:id', (req: AuthRequest, res) => {
  const { date, category, description, amount } = req.body
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId) as any
  if (!existing) {
    res.status(404).json({ error: 'Expense entry not found' })
    return
  }
  db.prepare('UPDATE expenses SET date = ?, category = ?, description = ?, amount = ? WHERE id = ?').run(date, category, description, amount, req.params.id)
  res.json({ id: req.params.id, date, category, description, amount })
})

router.delete('/:id', (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!existing) {
    res.status(404).json({ error: 'Expense entry not found' })
    return
  }
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
