import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import ProtectedRoute from './components/ProtectedRoute'
import TabBar from './components/TabBar'
import BudgetSummary from './pages/BudgetSummary'
import ExpensesLog from './pages/ExpensesLog'
import IncomeLog from './pages/IncomeLog'
import BalancePage from './pages/Balance'
import Categories from './pages/Categories'
import Login from './pages/Login'
import Register from './pages/Register'

function AppLayout() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-50">
        <TabBar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<BudgetSummary />} />
            <Route path="/expenses" element={<ExpensesLog />} />
            <Route path="/income" element={<IncomeLog />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </main>
      </div>
    </FinanceProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
