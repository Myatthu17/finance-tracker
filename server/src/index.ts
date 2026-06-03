import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import { authenticateToken } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import incomeRoutes from './routes/incomes.js'
import expenseRoutes from './routes/expenses.js'
import balanceRoutes from './routes/balances.js'
import categoryRoutes from './routes/categories.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/incomes', authenticateToken, incomeRoutes)
app.use('/api/expenses', authenticateToken, expenseRoutes)
app.use('/api/balances', authenticateToken, balanceRoutes)
app.use('/api/categories', authenticateToken, categoryRoutes)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
