import { Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import { rotasDoModo, type AppMode } from './config/appMode.ts'
import RequireExpertSession from './modules/evaluation/components/RequireExpertSession.tsx'
import ConsentPage from './modules/evaluation/pages/ConsentPage.tsx'
import EvaluationPage from './modules/evaluation/pages/EvaluationPage.tsx'
import FinishedPage from './modules/evaluation/pages/FinishedPage.tsx'
import LoginPage from './modules/evaluation/pages/LoginPage.tsx'
import ProfilePage from './modules/evaluation/pages/ProfilePage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import ResearcherPage from './modules/researcher/pages/ResearcherPage.tsx'

export default function AppRoutes({ modo }: { modo: AppMode }) {
  const rotas = rotasDoModo(modo)
  return (
    <Routes>
      {/* Curadoria: o App continua exatamente como era (abas "Gerador" e "Exemplos"). */}
      {rotas.curadoria && <Route path="/" element={<App />} />}

      {/* Módulo de avaliação por especialistas. */}
      {rotas.avaliacao && (
        <>
          <Route path="/avaliacao/entrar" element={<LoginPage />} />
          <Route path="/avaliacao" element={<RequireExpertSession />}>
            <Route path="consentimento" element={<ConsentPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="concluido" element={<FinishedPage />} />
            <Route path=":ordem" element={<EvaluationPage />} />
          </Route>
        </>
      )}

      {/* Console do pesquisador: credencial própria (X-API-Key), fora da sessão de especialista. */}
      {rotas.pesquisador && <Route path="/pesquisador" element={<ResearcherPage />} />}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
