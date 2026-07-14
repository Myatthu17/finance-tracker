import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { OAuth2Client } from 'google-auth-library'
import db from '../db.js'
import { JWT_SECRET } from '../middleware/auth.js'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

async function generateUniqueUsername(email: string, displayName?: string): Promise<string> {
  const base = (displayName || email.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'user'
  let candidate = base
  let suffix = 0
  while (true) {
    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [candidate] })
    if (existing.rows.length === 0) return candidate
    suffix += 1
    candidate = `${base}${suffix}`
  }
}

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username, and password are required' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const existingResult = await db.execute({ sql: 'SELECT id FROM users WHERE email = ? OR username = ?', args: [email, username] })
  if (existingResult.rows.length > 0) {
    res.status(409).json({ error: 'Email or username already taken' })
    return
  }

  const id = uuid()
  const hashedPassword = bcrypt.hashSync(password, 10)
  await db.execute({ sql: 'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)', args: [id, email, username, hashedPassword] })

  const token = jwt.sign({ userId: id, email, username }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id, email, username } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const result = await db.execute({ sql: 'SELECT id, email, username, password FROM users WHERE email = ?', args: [email] })
  const user = result.rows[0] as any
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } })
})

router.post('/google', async (req, res) => {
  const { credential } = req.body

  if (!credential) {
    res.status(400).json({ error: 'Google credential is required' })
    return
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch {
    res.status(401).json({ error: 'Invalid Google credential' })
    return
  }

  if (!payload || !payload.email) {
    res.status(401).json({ error: 'Invalid Google credential' })
    return
  }

  const googleId = payload.sub
  const email = payload.email

  let result = await db.execute({ sql: 'SELECT id, email, username FROM users WHERE google_id = ?', args: [googleId] })
  let user = result.rows[0] as any

  if (!user) {
    result = await db.execute({ sql: 'SELECT id, email, username FROM users WHERE email = ?', args: [email] })
    user = result.rows[0] as any

    if (user) {
      await db.execute({ sql: 'UPDATE users SET google_id = ? WHERE id = ?', args: [googleId, user.id] })
    } else {
      const id = uuid()
      const username = await generateUniqueUsername(email, payload.name)
      await db.execute({
        sql: 'INSERT INTO users (id, email, username, password, google_id, auth_provider) VALUES (?, ?, ?, NULL, ?, ?)',
        args: [id, email, username, googleId, 'google'],
      })
      user = { id, email, username }
    }
  }

  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } })
})

export default router
