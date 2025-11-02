import { Shield, Database, Zap } from 'lucide-react'
import { useState } from 'react'
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
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-accent/20">
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
                    <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-500'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
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
