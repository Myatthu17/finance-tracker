import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'finance-tracker-secret-change-in-production'

export interface AuthRequest extends Request {
  userId?: string
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const result = await db.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [decoded.userId] })
    const user = result.rows[0] as unknown as { id: string } | undefined
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export { JWT_SECRET }
