export function formatWon(amount: number): string {
  if (amount < 0) {
    return `-₩${Math.abs(amount).toLocaleString('ko-KR')}`
  }
  return `₩${amount.toLocaleString('ko-KR')}`
}
