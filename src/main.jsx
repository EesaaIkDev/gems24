import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import registerServiceWorker from '@/lib/serviceWorker'
import { startOutboxSync } from '@/lib/offlineSync'

// Light is the default appearance; dark only when the user picked it.
document.documentElement.classList.toggle('dark', localStorage.getItem('gems24-theme') === 'dark')

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

registerServiceWorker()
startOutboxSync()