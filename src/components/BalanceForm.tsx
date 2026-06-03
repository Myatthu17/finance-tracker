import { useState } from 'react'

interface FormValues {
  month: string
  type: string
  wonAmount: string
}

interface BalanceFormProps {
  initial?: FormValues
  types: string[]
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}

export default function BalanceForm({ initial, types, onSubmit, onCancel }: BalanceFormProps) {
  const [month, setMonth] = useState(initial?.month ?? new Date().toISOString().slice(0, 7))
  const [type, setType] = useState(initial?.type ?? types[0] ?? '')
  const [wonAmount, setWonAmount] = useState(initial?.wonAmount ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!month || !wonAmount) return
    onSubmit({ month, type, wonAmount })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₩)</label>
        <input
          type="number"
          value={wonAmount}
          onChange={(e) => setWonAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  )
}
