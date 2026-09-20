import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/UI/ErrorBoundary.tsx'
import RequireExpertSession from './modules/evaluation/components/RequireExpertSession.tsx'
import ConsentPage from './modules/evaluation/pages/ConsentPage.tsx'
import EvaluationPage from './modules/evaluation/pages/EvaluationPage.tsx'
import FinishedPage from './modules/evaluation/pages/FinishedPage.tsx'
import LoginPage from './modules/evaluation/pages/LoginPage.tsx'
import ProfilePage from './modules/evaluation/pages/ProfilePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Curadoria: o App continua exatamente como era (abas "Gerador" e "Exemplos"). */}
          <Route path="/" element={<App />} />

          {/* Módulo de avaliação por especialistas. */}
          <Route path="/avaliacao/entrar" element={<LoginPage />} />
          <Route path="/avaliacao" element={<RequireExpertSession />}>
            <Route path="consentimento" element={<ConsentPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="concluido" element={<FinishedPage />} />
            <Route path=":ordem" element={<EvaluationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
