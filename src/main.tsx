import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

registerSW({ onOfflineReady() { console.log('App ready to work offline') } })

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
