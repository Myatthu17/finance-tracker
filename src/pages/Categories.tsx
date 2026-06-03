import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_BALANCE_TYPES } from '../utils/defaults'

function CategorySection({
  title,
  defaults,
  customItems,
  onAdd,
  onRemove,
}: {
  title: string
  defaults: string[]
  customItems: string[]
  onAdd: (name: string) => Promise<void>
  onRemove: (name: string) => Promise<void>
}) {
  const [newName, setNewName] = useState('')

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewName('')
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {defaults.map((item) => (
          <div
            key={item}
            className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-md"
          >
            {item}
          </div>
        ))}
        {customItems.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-md"
          >
            <span>{item}</span>
            <button
              onClick={() => onRemove(item)}
              className="text-blue-400 hover:text-red-500 ml-2"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="New category name"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default function Categories() {
  const { customCategories, customIncomeCategories, customBalanceTypes, addCategory, removeCategory, addIncomeCategory, removeIncomeCategory, addBalanceType, removeBalanceType } = useFinance()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Categories</h1>

      <CategorySection
        title="Expense Categories"
        defaults={DEFAULT_EXPENSE_CATEGORIES}
        customItems={customCategories}
        onAdd={addCategory}
        onRemove={removeCategory}
      />

      <hr className="border-gray-200" />

      <CategorySection
        title="Income Categories"
        defaults={DEFAULT_INCOME_CATEGORIES}
        customItems={customIncomeCategories}
        onAdd={addIncomeCategory}
        onRemove={removeIncomeCategory}
      />

      <hr className="border-gray-200" />

      <CategorySection
        title="Balance Types"
        defaults={DEFAULT_BALANCE_TYPES}
        customItems={customBalanceTypes}
        onAdd={addBalanceType}
        onRemove={removeBalanceType}
      />
    </div>
  )
}
