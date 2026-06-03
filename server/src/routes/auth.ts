import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import db from '../db'
import { JWT_SECRET } from '../middleware/auth'

const router = Router()

router.post('/register', (req, res) => {
  const { email, username, password } = req.body

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username, and password are required' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existing) {
    res.status(409).json({ error: 'Email or username already taken' })
    return
  }

  const id = uuid()
  const hashedPassword = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)').run(id, email, username, hashedPassword)

  const token = jwt.sign({ userId: id, email, username }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id, email, username } })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = db.prepare('SELECT id, email, username, password FROM users WHERE email = ?').get(email) as any
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } })
})

export default router
