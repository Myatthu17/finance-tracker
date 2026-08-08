import { useEffect, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Spinner from './Spinner'

function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function SyncStatus() {
  const { syncStatus, lastSyncedAt, syncNow } = useFinance()
  // Ticks once a minute so the relative-time label ("2m ago") stays fresh
  // without a fetch actually happening.
  const [, forceTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 60_000)
    return () => clearInterval(interval)
  }, [])

  const label =
    syncStatus === 'syncing'
      ? 'Syncing...'
      : syncStatus === 'error'
        ? 'Sync failed'
        : lastSyncedAt
          ? `Synced ${formatRelativeTime(lastSyncedAt)}`
          : 'Sync'

  return (
    <button
      type="button"
      onClick={() => syncNow()}
      disabled={syncStatus === 'syncing'}
      title="Sync now"
      className={`flex items-center gap-1.5 text-sm disabled:cursor-not-allowed ${
        syncStatus === 'error' ? 'text-red-600 hover:text-red-800' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {syncStatus === 'syncing' ? (
        <Spinner className="w-3.5 h-3.5" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
