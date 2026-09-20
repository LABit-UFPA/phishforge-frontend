import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import ErrorBoundary from './components/UI/ErrorBoundary.tsx'
import { resolverModo } from './config/appMode.ts'
import AppRoutes from './routes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes modo={resolverModo(import.meta.env.VITE_APP_MODE)} />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
