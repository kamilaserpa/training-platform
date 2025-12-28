// Formulário de criação/edição de semana
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import './FormSemana.css'

const FormSemana = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canEdit } = useAuth()
  const [loading, setLoading] = useState(false)
  const [tiposTreino, setTiposTreino] = useState([])

  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    tipo_treino_id: '',
  })

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
    loadTiposTreino()
    if (id) {
      loadSemana()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canEdit, navigate])

  const loadTiposTreino = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_treino')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setTiposTreino(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de treino:', error)
    }
  }

  const loadSemana = async () => {
    try {
      const { data, error } = await supabase
        .from('semanas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setFormData({
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        tipo_treino_id: data.tipo_treino_id || '',
      })
    } catch (error) {
      console.error('Erro ao carregar semana:', error)
      alert('Erro ao carregar semana')
      navigate('/semanas')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (id) {
        const { error } = await supabase
          .from('semanas')
          .update(formData)
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('semanas')
          .insert([formData])
        if (error) throw error
      }
      alert('Semana salva com sucesso!')
      navigate('/')
    } catch (error) {
      alert('Erro ao salvar semana: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-semana-container">
      <Breadcrumb items={[
        { label: 'Semanas', to: '/' },
        { label: id ? 'Editar' : 'Nova', to: '#' }
      ]} />
      
      <h1>{id ? 'Editar' : 'Nova'} Semana</h1>
      
      <form onSubmit={handleSubmit} className="semana-form">
        <div className="form-group">
          <label>Data Início *</label>
          <input
            type="date"
            value={formData.data_inicio}
            onChange={(e) =>
              setFormData({ ...formData, data_inicio: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Data Fim *</label>
          <input
            type="date"
            value={formData.data_fim}
            onChange={(e) =>
              setFormData({ ...formData, data_fim: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de Treino *</label>
          <select
            value={formData.tipo_treino_id}
            onChange={(e) =>
              setFormData({ ...formData, tipo_treino_id: e.target.value })
            }
            required
          >
            <option value="">Selecione um tipo</option>
            {tiposTreino.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormSemana
