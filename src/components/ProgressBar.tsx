interface ProgressBarProps {
  percent: number
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  let color = 'bg-green-500'
  if (clamped > 80) color = 'bg-red-500'
  else if (clamped > 60) color = 'bg-yellow-500'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-2">
        Percentage of income spent: <span className="font-semibold text-gray-800">{clamped.toFixed(1)}%</span>
      </p>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
