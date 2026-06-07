import { useState, useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import TransactionTable, { advanceDate, incrementLabel } from '../components/TransactionTable'
import TransactionForm from '../components/TransactionForm'
import MonthYearPicker from '../components/MonthYearPicker'
import Modal from '../components/Modal'
import { filterByMonth, filterByYear } from '../utils/filterByMonth'
import { formatWon } from '../utils/format'

export default function ExpensesLog() {
  const now = new Date()
  const { expenses, allCategories, addExpense, updateExpense, deleteExpense } = useFinance()
  const [filter, setFilter] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'all' | 'year' | 'month'>('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const timeFiltered = useMemo(() => {
    if (viewMode === 'all') return expenses
    if (viewMode === 'year') return filterByYear(expenses, year)
    return filterByMonth(expenses, year, month)
  }, [expenses, viewMode, year, month])

  const filtered = useMemo(
    () => filter === 'All' ? timeFiltered : timeFiltered.filter((e) => e.category === filter),
    [timeFiltered, filter],
  )

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])

  const uniqueCategories = ['All', ...allCategories]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Expenses Log</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
        >
          + Add Expense
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'year', 'month'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              viewMode === mode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {mode === 'all' ? 'All Time' : mode === 'year' ? 'This Year' : 'Month'}
          </button>
        ))}
        {viewMode === 'month' && (
          <MonthYearPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 shrink-0">Category:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] sm:max-w-none"
        >
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-600 font-medium">
        Total: {formatWon(totalAmount)}
      </div>

      <TransactionTable
        data={filtered}
        onEdit={(item) => {
          setEditing(item)
          setModalOpen(true)
        }}
        onDelete={(id) => {
          if (window.confirm('Delete this expense?')) deleteExpense(id)
        }}
        onNextInstallment={(item) => {
          const nextDate = advanceDate(item.date)
          const nextLabel = incrementLabel(item.installmentLabel || '')
          addExpense({
            date: nextDate,
            category: item.category,
            description: item.description,
            amount: item.amount,
            installmentLabel: nextLabel,
          })
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Expense' : 'Add Expense'}
      >
        <TransactionForm
          key={editing?.id ?? 'new'}
          initial={
            editing
              ? {
                  date: editing.date,
                  category: editing.category,
                  description: editing.description,
                  amount: String(editing.amount),
                  installmentLabel: editing.installmentLabel,
                }
              : undefined
          }
          categories={allCategories}
          showInstallment
          onSubmit={(values) => {
            const entry: any = {
              date: values.date,
              category: values.category,
              description: values.description,
              amount: Number(values.amount),
            }
            if (values.installmentLabel) entry.installmentLabel = values.installmentLabel
            if (editing) {
              updateExpense(editing.id, entry)
            } else {
              addExpense(entry)
            }
            setModalOpen(false)
            setEditing(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>

      {!modalOpen && (
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-700 active:bg-blue-800 transition-colors sm:hidden"
        >
          +
        </button>
      )}
    </div>
  )
}
