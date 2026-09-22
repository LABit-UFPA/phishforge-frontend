import { ClipboardCheck, Database, Shield, UserCog, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Results from './components/Generator/Results'
import Controls from './components/Generator/Controls'
import Examples from './components/Examples/Examples'
import { useGenerator } from './hooks/useGenerator'

type Tab = 'generator' | 'examples'

export default function App() {
  const g = useGenerator()
  const [activeTab, setActiveTab] = useState<Tab>('generator')

  const tabs = [
    {
      id: 'generator' as const,
      label: 'Gerador',
      icon: Zap,
      description: 'Criar novos exemplos'
    },
    {
      id: 'examples' as const,
      label: 'Exemplos',
      icon: Database,
      description: 'Ver emails salvos'
    }
  ]

  // Panorama geral: as outras duas áreas da plataforma (avaliação por
  // especialistas e console do pesquisador) vivem em rotas próprias, não em
  // abas internas — daqui elas são só um clique, para poder testar a
  // anotação e a montagem de rodada sem digitar a URL.
  const areas = [
    {
      to: '/avaliacao/entrar',
      label: 'Avaliação',
      icon: ClipboardCheck,
      description: 'Anotar com um código de teste'
    },
    {
      to: '/pesquisador',
      label: 'Pesquisador',
      icon: UserCog,
      description: 'Rodadas e especialistas'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-accent/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Shield className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">PhishForge</h1>
              <p className="text-sm text-gray-600">LABit — Universidade Federal do Pará</p>
            </div>
          </div>
          <span className="text-sm text-primary">UFPA • LABit</span>
        </div>
      </header>

      {/* Navegação por abas */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap justify-center bg-white rounded-lg p-1 shadow-sm border border-accent/20">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="size-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
            <span className="w-px my-1 bg-accent/30" aria-hidden="true" />
            {areas.map(({ to, label, icon: Icon, description }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-6 py-3 rounded-md transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Icon className="size-5" />
                <div className="text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'generator' && (
          <main className="grid lg:grid-cols-[360px_1fr] gap-6">
            <aside className="card p-5 h-fit">
              <Controls {...g} />
            </aside>

            <section>
              <Results {...g} />
            </section>
          </main>
        )}

        {activeTab === 'examples' && <Examples />}
      </div>
    </div>
  )
}
