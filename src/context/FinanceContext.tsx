import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_BALANCE_TYPES } from '../utils/defaults'
import type { IncomeEntry, ExpenseEntry, BalanceEntry } from '../types'

interface FinanceContextValue {
  incomes: IncomeEntry[]
  expenses: ExpenseEntry[]
  balances: BalanceEntry[]
  customCategories: string[]
  customIncomeCategories: string[]
  customBalanceTypes: string[]
  allCategories: string[]
  allIncomeCategories: string[]
  allBalanceTypes: string[]
  loading: boolean

  addIncome: (entry: Omit<IncomeEntry, 'id'>) => Promise<void>
  updateIncome: (id: string, entry: Omit<IncomeEntry, 'id'>) => Promise<void>
  deleteIncome: (id: string) => Promise<void>

  addExpense: (entry: Omit<ExpenseEntry, 'id'>) => Promise<void>
  updateExpense: (id: string, entry: Omit<ExpenseEntry, 'id'>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  addBalance: (entry: Omit<BalanceEntry, 'id'>) => Promise<void>
  updateBalance: (id: string, entry: Omit<BalanceEntry, 'id'>) => Promise<void>
  deleteBalance: (id: string) => Promise<void>

  addCategory: (name: string) => Promise<void>
  removeCategory: (name: string) => Promise<void>
  addIncomeCategory: (name: string) => Promise<void>
  removeIncomeCategory: (name: string) => Promise<void>
  addBalanceType: (name: string) => Promise<void>
  removeBalanceType: (name: string) => Promise<void>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

function fetchCategories(kind: string) {
  return api<string[]>(`/categories?kind=${kind}`)
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [balances, setBalances] = useState<BalanceEntry[]>([])
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [customIncomeCategories, setCustomIncomeCategories] = useState<string[]>([])
  const [customBalanceTypes, setCustomBalanceTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIncomes([])
      setExpenses([])
      setBalances([])
      setCustomCategories([])
      setCustomIncomeCategories([])
      setCustomBalanceTypes([])
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      api<IncomeEntry[]>('/incomes'),
      api<ExpenseEntry[]>('/expenses'),
      api<BalanceEntry[]>('/balances'),
      fetchCategories('expense'),
      fetchCategories('income'),
      fetchCategories('balance'),
    ])
      .then(([inc, exp, bal, expCats, incCats, balTypes]) => {
        setIncomes(inc)
        setExpenses(exp)
        setBalances(bal)
        setCustomCategories(expCats)
        setCustomIncomeCategories(incCats)
        setCustomBalanceTypes(balTypes)
      })
      .catch(() => {
        setIncomes([])
        setExpenses([])
        setBalances([])
        setCustomCategories([])
        setCustomIncomeCategories([])
        setCustomBalanceTypes([])
      })
      .finally(() => setLoading(false))
  }, [token])

  const allCategories = useMemo(
    () => [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories],
    [customCategories],
  )

  const allIncomeCategories = useMemo(
    () => [...DEFAULT_INCOME_CATEGORIES, ...customIncomeCategories],
    [customIncomeCategories],
  )

  const allBalanceTypes = useMemo(
    () => [...DEFAULT_BALANCE_TYPES, ...customBalanceTypes],
    [customBalanceTypes],
  )

  const addIncome = useCallback(async (entry: Omit<IncomeEntry, 'id'>) => {
    const created = await api<IncomeEntry>('/incomes', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    setIncomes((prev) => [created, ...prev])
  }, [])

  const updateIncome = useCallback(async (id: string, entry: Omit<IncomeEntry, 'id'>) => {
    const updated = await api<IncomeEntry>(`/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
    setIncomes((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }, [])

  const deleteIncome = useCallback(async (id: string) => {
    await api(`/incomes/${id}`, { method: 'DELETE' })
    setIncomes((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addExpense = useCallback(async (entry: Omit<ExpenseEntry, 'id'>) => {
    const created = await api<ExpenseEntry>('/expenses', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    setExpenses((prev) => [created, ...prev])
  }, [])

  const updateExpense = useCallback(async (id: string, entry: Omit<ExpenseEntry, 'id'>) => {
    const updated = await api<ExpenseEntry>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
    setExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    await api(`/expenses/${id}`, { method: 'DELETE' })
    setExpenses((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addBalance = useCallback(async (entry: Omit<BalanceEntry, 'id'>) => {
    const created = await api<BalanceEntry>('/balances', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    setBalances((prev) => [created, ...prev])
  }, [])

  const updateBalance = useCallback(async (id: string, entry: Omit<BalanceEntry, 'id'>) => {
    const updated = await api<BalanceEntry>(`/balances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
    setBalances((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }, [])

  const deleteBalance = useCallback(async (id: string) => {
    await api(`/balances/${id}`, { method: 'DELETE' })
    setBalances((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addCategory = useCallback(async (name: string) => {
    await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, kind: 'expense' }),
    })
    setCustomCategories((prev) => {
      if (prev.includes(name) || DEFAULT_EXPENSE_CATEGORIES.includes(name as any)) return prev
      return [...prev, name]
    })
  }, [])

  const removeCategory = useCallback(async (name: string) => {
    await api(`/categories/${encodeURIComponent(name)}?kind=expense`, { method: 'DELETE' })
    setCustomCategories((prev) => prev.filter((c) => c !== name))
  }, [])

  const addIncomeCategory = useCallback(async (name: string) => {
    await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, kind: 'income' }),
    })
    setCustomIncomeCategories((prev) => {
      if (prev.includes(name) || DEFAULT_INCOME_CATEGORIES.includes(name)) return prev
      return [...prev, name]
    })
  }, [])

  const removeIncomeCategory = useCallback(async (name: string) => {
    await api(`/categories/${encodeURIComponent(name)}?kind=income`, { method: 'DELETE' })
    setCustomIncomeCategories((prev) => prev.filter((c) => c !== name))
  }, [])

  const addBalanceType = useCallback(async (name: string) => {
    await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, kind: 'balance' }),
    })
    setCustomBalanceTypes((prev) => {
      if (prev.includes(name) || DEFAULT_BALANCE_TYPES.includes(name)) return prev
      return [...prev, name]
    })
  }, [])

  const removeBalanceType = useCallback(async (name: string) => {
    await api(`/categories/${encodeURIComponent(name)}?kind=balance`, { method: 'DELETE' })
    setCustomBalanceTypes((prev) => prev.filter((c) => c !== name))
  }, [])

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        balances,
        customCategories,
        customIncomeCategories,
        customBalanceTypes,
        allCategories,
        allIncomeCategories,
        allBalanceTypes,
        loading,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addBalance,
        updateBalance,
        deleteBalance,
        addCategory,
        removeCategory,
        addIncomeCategory,
        removeIncomeCategory,
        addBalanceType,
        removeBalanceType,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
