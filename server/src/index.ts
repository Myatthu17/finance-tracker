import express from 'express'
import cors from 'cors'
import { authenticateToken } from './middleware/auth'
import authRoutes from './routes/auth'
import incomeRoutes from './routes/incomes'
import expenseRoutes from './routes/expenses'
import balanceRoutes from './routes/balances'
import categoryRoutes from './routes/categories'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/incomes', authenticateToken, incomeRoutes)
app.use('/api/expenses', authenticateToken, expenseRoutes)
app.use('/api/balances', authenticateToken, balanceRoutes)
app.use('/api/categories', authenticateToken, categoryRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
