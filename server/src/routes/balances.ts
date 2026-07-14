import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res) => {
  const result = await db.execute({ sql: 'SELECT id, month, type, won_amount AS wonAmount FROM balances WHERE user_id = ? ORDER BY month DESC', args: [req.userId as string] })
  res.json(result.rows)
})

router.post('/', async (req: AuthRequest, res) => {
  const { month, type, wonAmount } = req.body
  if (!month || !type || wonAmount == null) {
    res.status(400).json({ error: 'month, type, and wonAmount are required' })
    return
  }
  const id = uuid()
  await db.execute({ sql: 'INSERT INTO balances (id, user_id, month, type, won_amount) VALUES (?, ?, ?, ?, ?)', args: [id, req.userId as string, month, type, wonAmount] })
  res.status(201).json({ id, month, type, wonAmount: wonAmount })
})

router.put('/:id', async (req: AuthRequest, res) => {
  const { month, type, wonAmount } = req.body
  const existingResult = await db.execute({ sql: 'SELECT * FROM balances WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Balance entry not found' })
    return
  }
  await db.execute({ sql: 'UPDATE balances SET month = ?, type = ?, won_amount = ? WHERE id = ?', args: [month, type, wonAmount, req.params.id as string] })
  res.json({ id: req.params.id, month, type, wonAmount: wonAmount })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const existingResult = await db.execute({ sql: 'SELECT * FROM balances WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Balance entry not found' })
    return
  }
  await db.execute({ sql: 'DELETE FROM balances WHERE id = ?', args: [req.params.id as string] })
  res.json({ success: true })
})

export default router
