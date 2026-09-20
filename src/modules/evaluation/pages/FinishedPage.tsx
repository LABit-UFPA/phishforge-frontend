import { Link, useOutletContext } from 'react-router-dom'
import ExpertLayout from '../components/ExpertLayout'
import type { ExpertContext } from '../components/RequireExpertSession'
import { rotaDoItem } from '../utils/rotas'

export default function FinishedPage() {
  const { me } = useOutletContext<ExpertContext>()
  return (
    <ExpertLayout>
      <div className="card p-10 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Obrigado, {me.especialista.nome}!</h2>
        <p className="text-gray-700">
          Você avaliou os {me.progresso.total} itens da rodada “{me.rodada.nome}”. Sua contribuição é essencial para a pesquisa.
        </p>
        <p className="text-sm text-gray-500">Se quiser, ainda pode revisar qualquer item.</p>
        <Link to={rotaDoItem(1)} className="btn btn-secondary px-4 py-2">Revisar do primeiro item</Link>
      </div>
    </ExpertLayout>
  )
}
