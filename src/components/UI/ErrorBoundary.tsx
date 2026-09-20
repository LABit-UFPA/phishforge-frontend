import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Evita a tela em branco quando um componente lança em tempo de render. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-lg w-full p-8 text-center">
          <h1 className="text-xl font-semibold text-primary mb-2">Algo deu errado</h1>
          <p className="text-sm text-gray-600 mb-4 break-words">{this.state.error.message}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Recarregar a página</button>
        </div>
      </div>
    )
  }
}
