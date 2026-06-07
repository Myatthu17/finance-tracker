import { useState, useMemo } from 'react'
import { useFinance } from '../context/FinanceContext'
import Modal from '../components/Modal'
import BalanceForm from '../components/BalanceForm'
import MonthYearPicker from '../components/MonthYearPicker'
import { formatWon } from '../utils/format'
import { filterByMonthBalance, filterByYearBalance } from '../utils/filterByMonth'
import type { BalanceEntry } from '../types'

export default function BalancePage() {
  const now = new Date()
  const { balances, allBalanceTypes, addBalance, updateBalance, deleteBalance } = useFinance()
  const [viewMode, setViewMode] = useState<'all' | 'year' | 'month'>('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BalanceEntry | null>(null)

  const filtered = useMemo(() => {
    if (viewMode === 'all') return balances
    if (viewMode === 'year') return filterByYearBalance(balances, year)
    return filterByMonthBalance(balances, year, month)
  }, [balances, viewMode, year, month])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.month.localeCompare(a.month)),
    [filtered],
  )

  const totalAmount = useMemo(() => sorted.reduce((s, b) => s + b.wonAmount, 0), [sorted])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Balance</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
        >
          + Add Balance Entry
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

      <div className="text-sm text-gray-600 font-medium">
        Total: {formatWon(totalAmount)}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No balance entries yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 font-medium">Month</th>
                <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 font-medium">Type</th>
                <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 font-medium text-right">Amount</th>
                <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-gray-700">{item.month}</td>
                  <td className="py-1.5 sm:py-2 px-1.5 sm:px-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-right font-mono text-gray-800">
                    {formatWon(item.wonAmount)}
                  </td>
                  <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditing(item)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs mr-1 sm:mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this balance entry?')) deleteBalance(item.id)
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Balance Entry' : 'Add Balance Entry'}
      >
        <BalanceForm
          key={editing?.id ?? 'new'}
          initial={
            editing
              ? {
                  month: editing.month,
                  type: editing.type,
                  wonAmount: String(editing.wonAmount),
                }
              : undefined
          }
          types={allBalanceTypes}
          onSubmit={(values) => {
            const entry = {
              month: values.month,
              type: values.type,
              wonAmount: Number(values.wonAmount),
            }
            if (editing) {
              updateBalance(editing.id, entry)
            } else {
              addBalance(entry)
            }
            setModalOpen(false)
            setEditing(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>

      <button
        onClick={() => { setEditing(null); setModalOpen(true) }}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-700 active:bg-blue-800 transition-colors sm:hidden"
      >
        +
      </button>
    </div>
  )
}
