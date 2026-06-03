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
    <nav className="flex items-center border-b border-gray-200 bg-white">
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
      <div className="ml-auto flex items-center gap-3 px-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">{user.username}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">Login</Link>
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
