import { useState, useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import TransactionTable from '../components/TransactionTable'
import TransactionForm from '../components/TransactionForm'
import MonthYearPicker from '../components/MonthYearPicker'
import Modal from '../components/Modal'
import { filterByMonth, filterByYear } from '../utils/filterByMonth'
import { formatWon } from '../utils/format'

export default function IncomeLog() {
  const now = new Date()
  const { incomes, allIncomeCategories, addIncome, updateIncome, deleteIncome } = useFinance()
  const [viewMode, setViewMode] = useState<'all' | 'year' | 'month'>('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [catFilter, setCatFilter] = useState<string>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const timeFiltered = useMemo(() => {
    if (viewMode === 'all') return incomes
    if (viewMode === 'year') return filterByYear(incomes, year)
    return filterByMonth(incomes, year, month)
  }, [incomes, viewMode, year, month])

  const filtered = useMemo(
    () => catFilter === 'All' ? timeFiltered : timeFiltered.filter((i) => i.category === catFilter),
    [timeFiltered, catFilter],
  )

  const totalAmount = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered])

  const uniqueCategories = ['All', ...allIncomeCategories]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Income Log</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Income
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

      <div className="flex gap-2 flex-wrap">
        {uniqueCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              catFilter === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
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
          if (window.confirm('Delete this income entry?')) deleteIncome(id)
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Income' : 'Add Income'}
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
                }
              : undefined
          }
          categories={allIncomeCategories}
          onSubmit={(values) => {
            const entry = {
              date: values.date,
              category: values.category,
              description: values.description,
              amount: Number(values.amount),
            }
            if (editing) {
              updateIncome(editing.id, entry)
            } else {
              addIncome(entry)
            }
            setModalOpen(false)
            setEditing(null)
          }}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>
    </div>
  )
}
