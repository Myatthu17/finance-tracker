import { useState, useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import MonthYearPicker from '../components/MonthYearPicker'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import IncomeExpenseChart from '../components/IncomeExpenseChart'
import CategoryTable from '../components/CategoryTable'
import DiscrepancyCard from '../components/DiscrepancyCard'
import { filterByMonth, filterByMonthBalance, getPreviousMonth } from '../utils/filterByMonth'
import { formatWon } from '../utils/format'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function BudgetSummary() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const { incomes, expenses, balances } = useFinance()

  const monthIncomes = useMemo(() => filterByMonth(incomes, year, month), [incomes, year, month])
  const monthExpenses = useMemo(() => filterByMonth(expenses, year, month), [expenses, year, month])

  const totalIncome = useMemo(() => monthIncomes.reduce((s, i) => s + i.amount, 0), [monthIncomes])
  const totalExpenses = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses])

  const prev = getPreviousMonth(year, month)
  const monthBalances = useMemo(() => filterByMonthBalance(balances, year, month), [balances, year, month])
  const prevBalances = useMemo(() => filterByMonthBalance(balances, prev.year, prev.month), [balances, prev.year, prev.month])
  const prevIncomes = useMemo(() => filterByMonth(incomes, prev.year, prev.month), [incomes, prev.year, prev.month])
  const prevExpenses = useMemo(() => filterByMonth(expenses, prev.year, prev.month), [expenses, prev.year, prev.month])

  const balance = monthBalances.reduce((s, b) => s + b.wonAmount, 0)
  const prevBalance = prevBalances.reduce((s, b) => s + b.wonAmount, 0)
  const prevIncomeSum = prevIncomes.reduce((s, i) => s + i.amount, 0)
  const prevExpenseSum = prevExpenses.reduce((s, e) => s + e.amount, 0)

  const expectedBalance = prevBalance - prevExpenseSum + prevIncomeSum
  const currentBalance = balance + totalIncome - totalExpenses
  const hasBalanceThisMonth = monthBalances.length > 0

  const percentSpent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const inc of monthIncomes) {
      map.set(inc.category, (map.get(inc.category) ?? 0) + inc.amount)
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }))
  }, [monthIncomes])

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const exp of monthExpenses) {
      map.set(exp.category, (map.get(exp.category) ?? 0) + exp.amount)
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }))
  }, [monthExpenses])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Budget Summary</h1>
        <MonthYearPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Current Balance (running)"
          value={hasBalanceThisMonth ? formatWon(currentBalance) : '₩0'}
          subtitle={hasBalanceThisMonth ? undefined : 'Please make the balance check for this month'}
          positive={currentBalance >= 0 && hasBalanceThisMonth}
          negative={currentBalance < 0 && hasBalanceThisMonth}
        />
        <StatCard label="Net Monthly Income" value={formatWon(totalIncome)} positive />
        <StatCard label="Net Monthly Expenses" value={formatWon(totalExpenses)} negative />
        <StatCard label="Balance" value={formatWon(balance)} positive />
        <StatCard label="Last Month Balance" value={formatWon(prevBalance)} />
        <ProgressBar percent={percentSpent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart totalIncome={totalIncome} totalExpenses={totalExpenses} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CategoryTable title="Income by Category" data={incomeByCategory} />
          <CategoryTable title="Expenses by Category" data={expenseByCategory} />
        </div>
      </div>

      <DiscrepancyCard
        expectedBalance={expectedBalance}
        reportedBalance={balance}
        month={`${MONTH_NAMES[month - 1]} ${year}`}
      />
    </div>
  )
}
