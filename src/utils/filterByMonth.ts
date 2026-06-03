export function filterByMonth<T extends { date: string }>(
  items: T[],
  year: number,
  month: number,
): T[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return items.filter((item) => item.date.startsWith(prefix))
}

export function filterByYear<T extends { date: string }>(
  items: T[],
  year: number,
): T[] {
  const prefix = String(year)
  return items.filter((item) => item.date.startsWith(prefix))
}

export function filterByMonthBalance<T extends { month: string }>(
  items: T[],
  year: number,
  month: number,
): T[] {
  const target = `${year}-${String(month).padStart(2, '0')}`
  return items.filter((item) => item.month === target)
}

export function filterByYearBalance<T extends { month: string }>(
  items: T[],
  year: number,
): T[] {
  const prefix = String(year)
  return items.filter((item) => item.month.startsWith(prefix))
}

export function getPreviousMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}
