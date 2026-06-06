interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  positive?: boolean
  negative?: boolean
}

export default function StatCard({ label, value, subtitle, positive, negative }: StatCardProps) {
  let colorClass = 'text-gray-900'
  if (positive) colorClass = 'text-green-600'
  if (negative) colorClass = 'text-red-600'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-col justify-center min-h-[80px] sm:min-h-[90px]">
      <p className="text-xs sm:text-sm text-gray-500 mb-1 leading-tight">{label}</p>
      <p className={`text-lg sm:text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1 leading-tight">{subtitle}</p>}
    </div>
  )
}
