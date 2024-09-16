import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorProvider } from './context/ErrorContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ErrorProvider>
          <App />
        </ErrorProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
)
