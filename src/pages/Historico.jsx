// Página de histórico de treinos (Owner/Viewer)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { treinosService } from '../services/treinos'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import './Historico.css'

const Historico = () => {
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    loadHistorico()
  }, [isAuthenticated])

  const loadHistorico = async () => {
    try {
      const { data, error } = await treinosService.getHistorico()

      if (error) throw error
      setTreinos(data || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoBlocoLabel = (tipo) => {
    const labels = {
      PADRAO_MOVIMENTO: 'Padrão',
      MOBILIDADE_ARTICULAR: 'Mobilidade',
      ATIVACAO_CORE: 'Core',
      ATIVACAO_NEURAL: 'Neural',
      TREINO: 'Treino',
      CONDICIONAMENTO_FISICO: 'Condicionamento',
    }
    return labels[tipo] || tipo
  }

  if (!isAuthenticated) {
    return (
      <div className="historico-container">
        <div className="error-state">
          <p>Acesso restrito. Faça login para visualizar o histórico.</p>
          <Link to="/login" className="btn-primary">Fazer Login</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Carregando histórico...</div>
  }

  return (
    <div className="historico-container">
      <Breadcrumb items={[{ label: 'Histórico', to: '/historico' }]} />
      <h1>Histórico de Treinos</h1>

      {treinos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum treino no histórico ainda.</p>
        </div>
      ) : (
        <div className="historico-list">
          {treinos.map((treino) => {
            const blocos = treino.blocos_treino
              ? [...treino.blocos_treino].sort((a, b) => a.ordem - b.ordem)
              : []

            return (
              <div key={treino.id} className="historico-card">
                <div className="historico-header">
                  <Link to={`/treinos/${treino.id}`} className="treino-link">
                    <h3>
                      {new Date(treino.data).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                  </Link>
                  {treino.semanas?.tipos_treino && (
                    <span className="tipo-badge">
                      {treino.semanas.tipos_treino.nome}
                    </span>
                  )}
                </div>

                {treino.observacoes && (
                  <p className="treino-observacoes">{treino.observacoes}</p>
                )}

                {blocos.length > 0 && (
                  <div className="blocos-resumo">
                    <strong>Blocos ({blocos.length}):</strong>
                    <div className="blocos-tags">
                      {blocos.map((bloco) => (
                        <span key={bloco.id} className="bloco-tag">
                          {bloco.ordem}. {getTipoBlocoLabel(bloco.tipo_bloco)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="historico-actions">
                  <Link
                    to={`/treinos/${treino.id}`}
                    className="btn-view"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Historico
