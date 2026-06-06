import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { to: '/', label: 'Budget Summary' },
  { to: '/expenses', label: 'Expenses Log' },
  { to: '/income', label: 'Income Log' },
  { to: '/balance', label: 'Balance' },
  { to: '/categories', label: 'Categories' },
]

export default function TabBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex overflow-x-auto w-full sm:w-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-0 border-t sm:border-t-0 border-gray-200 sm:ml-auto">
          {user ? (
            <>
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px]">{user.username}</span>
              <button
                onClick={logout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 shrink-0"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">Login</Link>
              <Link to="/register" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
