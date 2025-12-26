// Página de listagem de treinos
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import './Treinos.css'

const Treinos = () => {
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)
  const { canEdit } = useAuth()

  useEffect(() => {
    loadTreinos()
  }, [])

  const loadTreinos = async () => {
    try {
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          semanas (
            id,
            data_inicio,
            data_fim,
            tipos_treino (
              nome
            )
          )
        `)
        .order('data', { ascending: false })

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
      const { error } = await supabase.from('treinos').delete().eq('id', id)
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
      
      <div className="page-header">
        <h1>Treinos</h1>
        {canEdit && (
          <Link to="/treinos/novo" className="btn-primary">
            + Novo Treino
          </Link>
        )}
      </div>

      {treinos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum treino cadastrado ainda.</p>
          {canEdit && (
            <Link to="/treinos/novo" className="btn-primary">
              Criar primeiro treino
            </Link>
          )}
        </div>
      ) : (
        <div className="treinos-list">
          {treinos.map((treino) => (
            <div key={treino.id} className="treino-card">
              <div className="treino-header">
                <h3>{new Date(treino.data).toLocaleDateString('pt-BR')}</h3>
                {treino.semanas?.tipos_treino && (
                  <span className="tipo-badge">
                    {treino.semanas.tipos_treino.nome}
                  </span>
                )}
              </div>
              
              {treino.observacoes && (
                <p className="treino-observacoes">{treino.observacoes}</p>
              )}

              <div className="treino-actions">
                <Link
                  to={`/treinos/${treino.id}`}
                  className="btn-view"
                >
                  Ver Detalhes
                </Link>
                
                {canEdit && (
                  <>
                    <Link
                      to={`/treinos/${treino.id}/editar`}
                      className="btn-edit"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(treino.id)}
                      className="btn-delete"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Treinos
