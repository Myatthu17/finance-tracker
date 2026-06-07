import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { to: '/', label: 'Summary', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { to: '/expenses', label: 'Expenses', icon: 'M12 19V5m-7 7l7-7 7 7' },
  { to: '/income', label: 'Income', icon: 'M12 5v14m7-7l-7 7-7-7' },
  { to: '/balance', label: 'Balance', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z' },
  { to: '/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z' },
]

export default function TabBar() {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:block border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex w-full sm:w-auto">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 sm:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
