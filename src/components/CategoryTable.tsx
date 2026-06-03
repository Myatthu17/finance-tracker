import { formatWon } from '../utils/format'

interface CategoryTotal {
  category: string
  total: number
}

interface CategoryTableProps {
  title: string
  data: CategoryTotal[]
}

export default function CategoryTable({ title, data }: CategoryTableProps) {
  const sorted = [...data].sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {sorted.map((item) => (
              <tr key={item.category} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5 text-gray-600">{item.category}</td>
                <td className="py-1.5 text-right font-mono text-gray-800">
                  {formatWon(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
