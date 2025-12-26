// Página de gerenciamento de tipos de treino (apenas Owner)
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import './TiposTreino.css'

const TiposTreino = () => {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nome: '',
  })

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
    loadTipos()
  }, [canEdit, navigate])

  const loadTipos = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_treino')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setTipos(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de treino:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('tipos_treino')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tipos_treino')
          .insert([formData])
        if (error) throw error
      }
      resetForm()
      loadTipos()
      alert('Tipo de treino salvo com sucesso!')
    } catch (error) {
      alert('Erro ao salvar tipo de treino: ' + error.message)
    }
  }

  const handleEdit = (tipo) => {
    setFormData({ nome: tipo.nome })
    setEditingId(tipo.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de treino?')) return

    try {
      const { error } = await supabase
        .from('tipos_treino')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadTipos()
      alert('Tipo de treino excluído com sucesso!')
    } catch (error) {
      alert('Erro ao excluir tipo de treino: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ nome: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="loading">Carregando tipos de treino...</div>
  }

  return (
    <div className="tipos-container">
      <Breadcrumb items={[{ label: 'Tipos de Treino', to: '/tipos-treino' }]} />
      
      <div className="page-header">
        <h1>Tipos de Treino</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Tipo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="tipo-form">
          <h3>{editingId ? 'Editar' : 'Novo'} Tipo de Treino</h3>
          
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ nome: e.target.value })}
              required
              placeholder="Ex: Hipertrofia 65%, Resistência 50%, etc."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="tipos-grid">
        {tipos.map((tipo) => (
          <div key={tipo.id} className="tipo-card">
            <h3>{tipo.nome}</h3>
            <div className="card-actions">
              <button
                onClick={() => handleEdit(tipo)}
                className="btn-edit"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(tipo.id)}
                className="btn-delete"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TiposTreino
