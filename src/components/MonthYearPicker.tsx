interface MonthYearPickerProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export default function MonthYearPicker({ year, month, onChange }: MonthYearPickerProps) {
  function prev() {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  function next() {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={prev}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        &larr; Previous
      </button>
      <span className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
        {monthNames[month - 1]} {year}
      </span>
      <button
        onClick={next}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Next &rarr;
      </button>
    </div>
  )
}
