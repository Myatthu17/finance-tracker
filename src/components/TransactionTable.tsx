import { formatWon } from '../utils/format'

interface Transaction {
  id: string
  date: string
  category: string
  description: string
  amount: number
  installmentLabel?: string
}

interface TransactionTableProps {
  data: Transaction[]
  onEdit: (item: Transaction) => void
  onDelete: (id: string) => void
  onNextInstallment?: (item: Transaction) => void
}

function advanceDate(date: string): string {
  let [y, m, d] = date.split('-').map(Number)
  m += 1
  if (m > 12) { m = 1; y += 1 }
  const lastDay = new Date(y, m, 0).getDate()
  if (d > lastDay) d = lastDay
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isLastInstallment(label: string): boolean {
  const m = label.match(/\((\d+)\/(\d+)\)$/)
  if (!m) return false
  return Number(m[1]) >= Number(m[2])
}

function incrementLabel(label: string): string {
  const m = label.match(/^(.+?)\((\d+)\/(\d+)\)$/)
  if (!m) return label
  const [, base, curr, total] = m
  const next = Number(curr) + 1
  if (next > Number(total)) return label
  return `${base}(${next}/${total})`
}

export default function TransactionTable({ data, onEdit, onDelete, onNextInstallment }: TransactionTableProps) {
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
            <tr
              key={item.id}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                item.installmentLabel ? 'bg-blue-50/50' : ''
              }`}
            >
              <td className="py-2 px-3 text-gray-700">{item.date}</td>
              <td className="py-2 px-3">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">
                {item.installmentLabel ? (
                  <span className="text-blue-700 font-medium">{item.installmentLabel}</span>
                ) : (
                  item.description || <span className="text-gray-300">—</span>
                )}
                {item.installmentLabel && item.description && (
                  <span className="ml-1">{item.description !== item.installmentLabel ? item.description : ''}</span>
                )}
              </td>
              <td className="py-2 px-3 text-right font-mono text-gray-800">
                {formatWon(item.amount)}
              </td>
              <td className="py-2 px-3 text-right whitespace-nowrap">
                {item.installmentLabel && onNextInstallment && !isLastInstallment(item.installmentLabel) && (
                  <button
                    onClick={() => onNextInstallment(item)}
                    className="text-green-600 hover:text-green-800 text-xs mr-2"
                    title="Create next installment"
                  >
                    Next→
                  </button>
                )}
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

export { advanceDate, incrementLabel }
