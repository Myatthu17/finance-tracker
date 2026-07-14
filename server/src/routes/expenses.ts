import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC', args: [req.userId as string] })
  res.json(result.rows.map(r => ({ ...(r as any), installmentLabel: (r as any).installment_label || undefined })))
})

router.post('/', async (req: AuthRequest, res) => {
  const { date, category, description, amount, installmentLabel } = req.body
  if (!date || !category || description === undefined || amount == null) {
    res.status(400).json({ error: 'date, category, description, and amount are required' })
    return
  }
  const id = uuid()
  await db.execute({ sql: 'INSERT INTO expenses (id, user_id, date, category, description, amount, installment_label) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [id, req.userId as string, date, category, description, amount, installmentLabel || null] })
  res.status(201).json({ id, date, category, description, amount, installmentLabel: installmentLabel || undefined })
})

router.put('/:id', async (req: AuthRequest, res) => {
  const { date, category, description, amount, installmentLabel } = req.body
  const existingResult = await db.execute({ sql: 'SELECT * FROM expenses WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Expense entry not found' })
    return
  }
  await db.execute({ sql: 'UPDATE expenses SET date = ?, category = ?, description = ?, amount = ?, installment_label = ? WHERE id = ?', args: [date, category, description, amount, installmentLabel || null, req.params.id as string] })
  res.json({ id: req.params.id, date, category, description, amount, installmentLabel: installmentLabel || undefined })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const existingResult = await db.execute({ sql: 'SELECT * FROM expenses WHERE id = ? AND user_id = ?', args: [req.params.id as string, req.userId as string] })
  if (existingResult.rows.length === 0) {
    res.status(404).json({ error: 'Expense entry not found' })
    return
  }
  await db.execute({ sql: 'DELETE FROM expenses WHERE id = ?', args: [req.params.id as string] })
  res.json({ success: true })
})

export default router
