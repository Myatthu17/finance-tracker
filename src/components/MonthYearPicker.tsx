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

  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  return (
    <div className="flex items-center gap-1 sm:gap-4">
      <button
        onClick={prev}
        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <span className="sm:hidden">&larr;</span>
        <span className="hidden sm:inline">&larr; Previous</span>
      </button>
      <span className="text-sm sm:text-lg font-semibold text-gray-800 min-w-[100px] sm:min-w-[180px] text-center">
        <span className="sm:hidden">{shortMonths[month - 1]} {year}</span>
        <span className="hidden sm:inline">{monthNames[month - 1]} {year}</span>
      </span>
      <button
        onClick={next}
        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <span className="sm:hidden">&rarr;</span>
        <span className="hidden sm:inline">Next &rarr;</span>
      </button>
    </div>
  )
}
