import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import registerServiceWorker from '@/lib/serviceWorker'
import { startOutboxSync } from '@/lib/offlineSync'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

registerServiceWorker()
startOutboxSync()