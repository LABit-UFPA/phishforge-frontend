import { Shield } from 'lucide-react'
import type { ReactNode } from 'react'

/** Moldura das telas do especialista: só a marca, sem a navegação de curadoria. */
export default function ExpertLayout({ children, largo = false }: { children: ReactNode; largo?: boolean }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur border-b border-accent/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary leading-tight">PhishForge — Avaliação por especialistas</h1>
            <p className="text-xs text-gray-600">LABit — Universidade Federal do Pará</p>
          </div>
        </div>
      </header>
      <main className={`${largo ? 'max-w-6xl' : 'max-w-2xl'} mx-auto px-4 py-8`}>{children}</main>
    </div>
  )
}
