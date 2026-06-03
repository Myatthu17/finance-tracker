export type IncomeCategory = 'Mom & Dad' | '알바' | 'Scholarship' | 'Other'

export type ExpenseCategory =
  | 'Housing'
  | 'Transportation'
  | 'Food'
  | 'Utilities'
  | 'Insurance & visa'
  | 'Medical & Healthcare'
  | 'Saving'
  | 'Personal Spending'
  | 'Entertainment'
  | 'Miscellaneous'
  | 'Education'
  | 'Household goods'
  | 'Beverages'
  | 'Gifts & Donations'
  | 'Pet'

export type BalanceType = 'Cash' | 'Card' | 'Cash in $'

export interface IncomeEntry {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

export interface ExpenseEntry {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

export interface BalanceEntry {
  id: string
  month: string
  type: string
  wonAmount: number
}
