// Página de gerenciamento de exercícios (apenas Owner)
import { useEffect, useState } from 'react'
import { exerciciosService } from '../services/exercicios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import './Exercicios.css'

const Exercicios = () => {
  const [exercicios, setExercicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nome: '',
    grupo_muscular: '',
    observacoes: '',
  })

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
    loadExercicios()
  }, [canEdit, navigate])

  const loadExercicios = async () => {
    try {
      const { data, error } = await exerciciosService.getAll()

      if (error) throw error
      setExercicios(data || [])
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await exerciciosService.update(editingId, formData)
        if (error) throw error
      } else {
        const { error } = await exerciciosService.create(formData)
        if (error) throw error
      }
      resetForm()
      loadExercicios()
      alert('Exercício salvo com sucesso!')
    } catch (error) {
      alert('Erro ao salvar exercício: ' + error.message)
    }
  }

  const handleEdit = (exercicio) => {
    setFormData({
      nome: exercicio.nome,
      grupo_muscular: exercicio.grupo_muscular || '',
      observacoes: exercicio.observacoes || '',
    })
    setEditingId(exercicio.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return

    try {
      const { error } = await exerciciosService.delete(id)
      if (error) throw error
      loadExercicios()
      alert('Exercício excluído com sucesso!')
    } catch (error) {
      alert('Erro ao excluir exercício: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ nome: '', grupo_muscular: '', observacoes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="loading">Carregando exercícios...</div>
  }

  return (
    <div className="exercicios-container">
      <Breadcrumb items={[{ label: 'Exercícios', to: '/exercicios' }]} />
      
      <div className="page-header">
        <h1>Exercícios</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Exercício'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="exercicio-form">
          <h3>{editingId ? 'Editar' : 'Novo'} Exercício</h3>
          
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Grupo Muscular</label>
            <input
              type="text"
              value={formData.grupo_muscular}
              onChange={(e) =>
                setFormData({ ...formData, grupo_muscular: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              rows="3"
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

      <div className="exercicios-grid">
        {exercicios.map((exercicio) => (
          <div key={exercicio.id} className="exercicio-card">
            <h3>{exercicio.nome}</h3>
            {exercicio.grupo_muscular && (
              <span className="grupo-badge">{exercicio.grupo_muscular}</span>
            )}
            {exercicio.observacoes && (
              <p className="observacoes">{exercicio.observacoes}</p>
            )}
            <div className="card-actions">
              <button
                onClick={() => handleEdit(exercicio)}
                className="btn-edit"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(exercicio.id)}
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

export default Exercicios
