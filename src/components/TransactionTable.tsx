import { formatWon } from '../utils/format'

interface Transaction {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

interface TransactionTableProps {
  data: Transaction[]
  onEdit: (item: Transaction) => void
  onDelete: (id: string) => void
}

export default function TransactionTable({ data, onEdit, onDelete }: TransactionTableProps) {
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No entries yet.</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2 px-3 font-medium">Date</th>
            <th className="py-2 px-3 font-medium">Category</th>
            <th className="py-2 px-3 font-medium">Description</th>
            <th className="py-2 px-3 font-medium text-right">Amount</th>
            <th className="py-2 px-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 text-gray-700">{item.date}</td>
              <td className="py-2 px-3">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">
                {item.description}
              </td>
              <td className="py-2 px-3 text-right font-mono text-gray-800">
                {formatWon(item.amount)}
              </td>
              <td className="py-2 px-3 text-right">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
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
  )
}
