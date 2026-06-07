import { useState } from 'react'

interface FormValues {
  date: string
  category: string
  description: string
  amount: string
  installmentLabel?: string
}

interface TransactionFormProps {
  initial?: FormValues
  categories: string[]
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  showInstallment?: boolean
}

export default function TransactionForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  showInstallment,
}: TransactionFormProps) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const defaultCategory = categories.includes('Food') ? 'Food' : (categories[0] ?? '')
  const [category, setCategory] = useState(initial?.category ?? defaultCategory)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [installmentLabel, setInstallmentLabel] = useState(initial?.installmentLabel ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !category || !amount) return
    const values: FormValues = { date, category, description, amount }
    if (installmentLabel) values.installmentLabel = installmentLabel
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₩)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          required
        />
      </div>
      {showInstallment && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Installment label <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={installmentLabel}
            onChange={(e) => setInstallmentLabel(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='e.g. "PC (1/6)"'
          />
        </div>
      )}
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
