import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC', args: [req.userId as string] })
  res.json(result.rows)
})

router.post('/', async (req: AuthRequest, res) => {
  const { date, category, description, amount } = req.body
  if (!date || !category || description === undefined || amount == null) {
    res.status(400).json({ error: 'date, category, description, and amount are required' })
    return
  }
  const id = uuid()
  await db.execute({ sql: 'INSERT INTO incomes (id, user_id, date, category, description, amount) VALUES (?, ?, ?, ?, ?, ?)', args: [id, req.userId as string, date, category, description, amount] })
  res.status(201).json({ id, date, category, description, amount })
})

router.put('/:id', async (req: AuthRequest, res) => {
  const { date, category, description, amount } = req.body
  const existingResult = await db.execute({ sql: 'SELECT * FROM incomes WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Income entry not found' })
    return
  }
  await db.execute({ sql: 'UPDATE incomes SET date = ?, category = ?, description = ?, amount = ? WHERE id = ?', args: [date, category, description, amount, req.params.id as string] })
  res.json({ id: req.params.id, date, category, description, amount })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const existingResult = await db.execute({ sql: 'SELECT * FROM incomes WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Income entry not found' })
    return
  }
  await db.execute({ sql: 'DELETE FROM incomes WHERE id = ?', args: [req.params.id as string] })
  res.json({ success: true })
})

export default router
