import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorSimulador from './components/comun/ErrorSimulador'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorSimulador>
      <App />
    </ErrorSimulador>
  </StrictMode>,
)
