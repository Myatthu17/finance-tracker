import { formatWon } from '../utils/format'

interface DiscrepancyCardProps {
  expectedBalance: number
  reportedBalance: number
  month: string
}

export default function DiscrepancyCard({ expectedBalance, reportedBalance, month }: DiscrepancyCardProps) {
  const discrepancy = reportedBalance - expectedBalance
  const isMatch = discrepancy === 0
  const isClose = Math.abs(discrepancy) < 100000

  let color = 'text-green-600'
  let badge = '✓ Consistent'
  if (!isMatch) {
    if (isClose) color = 'text-yellow-600'
    else color = 'text-red-600'
    badge = '✗ Mismatch'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Data Health Check</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {badge}
        </span>
      </div>

      <div className="text-xs text-gray-400 mb-3">{month} — compares expected vs reported start-of-month balance</div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Expected start balance</span>
          <span className="font-mono text-gray-800">{formatWon(expectedBalance)}</span>
        </div>
        <div className="text-xs text-gray-400 pl-2 mb-1">
          = prev balance − prev expenses + prev income
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Reported start balance</span>
          <span className="font-mono text-gray-800">{formatWon(reportedBalance)}</span>
        </div>
        <div className="text-xs text-gray-400 pl-2 mb-1">
          = current month balance entries
        </div>

        <div className="border-t border-gray-200 pt-1.5 mt-1.5">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Discrepancy</span>
            <span className={`font-mono ${color}`}>
              {discrepancy >= 0 ? '+' : ''}{formatWon(discrepancy)}
            </span>
          </div>
          {!isMatch && (
            <p className="text-xs text-gray-400 mt-1">
              {discrepancy > 0
                ? 'Reported balance exceeds expected — possibly missed expenses or extra income not logged.'
                : 'Reported balance is less than expected — possibly missed income or extra expenses not logged.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
