// Página de listagem de treinos (mobile-first)
import { useEffect, useState } from 'react'
import { treinosService } from '../services/treinos'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import Card from '../components/Card'
import TouchButton from '../components/TouchButton'
import './Treinos.css'

const Treinos = () => {
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadTreinos()
  }, [])

  const loadTreinos = async () => {
    try {
      const { data, error } = await treinosService.getAll()

      if (error) throw error
      setTreinos(data || [])
    } catch (error) {
      console.error('Erro ao carregar treinos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return

    try {
      const { error } = await treinosService.delete(id)
      if (error) throw error
      loadTreinos()
    } catch (error) {
      alert('Erro ao excluir treino: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">Carregando treinos...</div>
  }

  return (
    <div className="treinos-container">
      <Breadcrumb items={[{ label: 'Treinos', to: '/treinos' }]} />
      
      <div className="page-header-mobile">
        <h1>Treinos</h1>
        {canEdit && (
          <TouchButton 
            variant="primary"
            icon="+"
            onClick={() => navigate('/treinos/novo')}
          >
            Novo
          </TouchButton>
        )}
      </div>

      {treinos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum treino cadastrado ainda.</p>
          {canEdit && (
            <TouchButton 
              variant="primary"
              fullWidth
              onClick={() => navigate('/treinos/novo')}
            >
              Criar primeiro treino
            </TouchButton>
          )}
        </div>
      ) : (
        <div className="treinos-list-mobile">
          {treinos.map((treino) => (
            <Card key={treino.id}>
              <div className="treino-card-header">
                <div className="treino-date">
                  <span className="date-day">
                    {new Date(treino.data).toLocaleDateString('pt-BR', { day: '2-digit' })}
                  </span>
                  <span className="date-month">
                    {new Date(treino.data).toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                </div>
                <div className="treino-info">
                  <h3 className="treino-title">
                    {new Date(treino.data).toLocaleDateString('pt-BR', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  {treino.semanas?.tipos_treino && (
                    <span className="treino-type-badge">
                      {treino.semanas.tipos_treino.nome}
                    </span>
                  )}
                </div>
              </div>
              
              {treino.observacoes && (
                <p className="treino-notes">{treino.observacoes}</p>
              )}

              <div className="treino-card-actions">
                <TouchButton 
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/treinos/${treino.id}`)}
                >
                  Ver Treino
                </TouchButton>
                
                {canEdit && (
                  <div className="treino-edit-actions">
                    <TouchButton 
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/treinos/${treino.id}/editar`)}
                    >
                      ✏️ Editar
                    </TouchButton>
                    <TouchButton 
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(treino.id)}
                    >
                      🗑️ Excluir
                    </TouchButton>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Treinos
