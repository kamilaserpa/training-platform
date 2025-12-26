// Página de listagem de semanas
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import './Semanas.css'

const Semanas = () => {
  const [semanas, setSemanas] = useState([])
  const [loading, setLoading] = useState(true)
  const { canEdit } = useAuth()

  useEffect(() => {
    loadSemanas()
  }, [])

  const loadSemanas = async () => {
    try {
      const { data, error } = await supabase
        .from('semanas')
        .select(`
          *,
          tipos_treino (
            id,
            nome
          )
        `)
        .order('data_inicio', { ascending: false })

      if (error) throw error
      setSemanas(data || [])
    } catch (error) {
      console.error('Erro ao carregar semanas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta semana?')) return

    try {
      const { error } = await supabase.from('semanas').delete().eq('id', id)
      if (error) throw error
      loadSemanas()
    } catch (error) {
      alert('Erro ao excluir semana: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">Carregando semanas...</div>
  }

  return (
    <div className="semanas-container">
      <Breadcrumb items={[{ label: 'Semanas', to: '/' }]} />
      
      <div className="page-header">
        <h1>Semanas de Treino</h1>
        {canEdit && (
          <Link to="/semanas/nova" className="btn-primary">
            + Nova Semana
          </Link>
        )}
      </div>

      {semanas.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma semana cadastrada ainda.</p>
          {canEdit && (
            <Link to="/semanas/nova" className="btn-primary">
              Criar primeira semana
            </Link>
          )}
        </div>
      ) : (
        <div className="semanas-grid">
          {semanas.map((semana) => (
            <div key={semana.id} className="semana-card">
              <div className="semana-header">
                <h3>
                  {new Date(semana.data_inicio).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(semana.data_fim).toLocaleDateString('pt-BR')}
                </h3>
                {semana.tipos_treino && (
                  <span className="tipo-badge">{semana.tipos_treino.nome}</span>
                )}
              </div>
              
              {canEdit && (
                <div className="card-actions">
                  <Link
                    to={`/semanas/${semana.id}/editar`}
                    className="btn-edit"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(semana.id)}
                    className="btn-delete"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Semanas
