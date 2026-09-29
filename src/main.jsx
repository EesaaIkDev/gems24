import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import registerServiceWorker from '@/lib/serviceWorker'
import { startOutboxSync } from '@/lib/offlineSync'

import { prefersDark } from '@/hooks/useTheme'

// Saved choice first, otherwise the device's appearance.
document.documentElement.classList.toggle('dark', prefersDark())

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

registerServiceWorker()
startOutboxSync()