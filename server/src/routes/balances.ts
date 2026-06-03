import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', (req: AuthRequest, res) => {
  const rows = db.prepare('SELECT id, month, type, won_amount AS wonAmount FROM balances WHERE user_id = ? ORDER BY month DESC').all(req.userId)
  res.json(rows)
})

router.post('/', (req: AuthRequest, res) => {
  const { month, type, wonAmount } = req.body
  if (!month || !type || wonAmount == null) {
    res.status(400).json({ error: 'month, type, and wonAmount are required' })
    return
  }
  const id = uuid()
  db.prepare('INSERT INTO balances (id, user_id, month, type, won_amount) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, month, type, wonAmount)
  res.status(201).json({ id, month, type, wonAmount: wonAmount })
})

router.put('/:id', (req: AuthRequest, res) => {
  const { month, type, wonAmount } = req.body
  const existing = db.prepare('SELECT * FROM balances WHERE id = ? AND user_id = ?').get(req.params.id, req.userId) as any
  if (!existing) {
    res.status(404).json({ error: 'Balance entry not found' })
    return
  }
  db.prepare('UPDATE balances SET month = ?, type = ?, won_amount = ? WHERE id = ?').run(month, type, wonAmount, req.params.id)
  res.json({ id: req.params.id, month, type, wonAmount: wonAmount })
})

router.delete('/:id', (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM balances WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!existing) {
    res.status(404).json({ error: 'Balance entry not found' })
    return
  }
  db.prepare('DELETE FROM balances WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
