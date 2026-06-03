import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatWon } from '../utils/format'

interface IncomeExpenseChartProps {
  totalIncome: number
  totalExpenses: number
}

export default function IncomeExpenseChart({ totalIncome, totalExpenses }: IncomeExpenseChartProps) {
  const data = [
    { name: 'Income', amount: totalIncome, fill: '#22c55e' },
    { name: 'Expenses', amount: totalExpenses, fill: '#ef4444' },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₩${(v / 10000).toFixed(0)}만`} />
          <Tooltip formatter={(value) => formatWon(Number(value))} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
