// Formulário de criação/edição de treino com blocos
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import './FormTreino.css'

const TIPOS_BLOCO = [
  { value: 'PADRAO_MOVIMENTO', label: 'Padrão de Movimento' },
  { value: 'MOBILIDADE_ARTICULAR', label: 'Mobilidade Articular' },
  { value: 'ATIVACAO_CORE', label: 'Ativação de Core' },
  { value: 'ATIVACAO_NEURAL', label: 'Ativação Neural' },
  { value: 'TREINO', label: 'Treino' },
  { value: 'CONDICIONAMENTO_FISICO', label: 'Condicionamento Físico' },
]

const FormTreino = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canEdit } = useAuth()
  const [loading, setLoading] = useState(false)
  const [semanas, setSemanas] = useState([])
  const [exercicios, setExercicios] = useState([])
  const [padroesMovimento, setPadroesMovimento] = useState([])
  const [blocos, setBlocos] = useState([])

  const [formData, setFormData] = useState({
    data: '',
    semana_id: '',
    observacoes: '',
  })

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
    loadSemanas()
    loadExercicios()
    loadPadroesMovimento()
    if (id) {
      loadTreino()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canEdit, navigate])

  const loadSemanas = async () => {
    try {
      const { data, error } = await supabase
        .from('semanas')
        .select('*')
        .order('data_inicio', { ascending: false })

      if (error) throw error
      setSemanas(data || [])
    } catch (error) {
      console.error('Erro ao carregar semanas:', error)
    }
  }

  const loadExercicios = async () => {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setExercicios(data || [])
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
    }
  }

  const loadPadroesMovimento = async () => {
    try {
      const { data, error } = await supabase
        .from('padroes_movimento')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setPadroesMovimento(data || [])
    } catch (error) {
      console.error('Erro ao carregar padrões de movimento:', error)
    }
  }

  const loadTreino = async () => {
    try {
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          blocos_treino (
            id,
            tipo_bloco,
            ordem,
            prescricao,
            bloco_padrao_movimento (
              padrao_movimento_id
            ),
            bloco_exercicios (
              id,
              exercicio_id,
              ordem,
              series,
              repeticoes,
              carga
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      setFormData({
        data: data.data,
        semana_id: data.semana_id || '',
        observacoes: data.observacoes || '',
      })
      
      if (data.blocos_treino) {
        const blocosFormatados = data.blocos_treino
          .sort((a, b) => a.ordem - b.ordem)
          .map((bloco) => ({
            id: bloco.id,
            tipo_bloco: bloco.tipo_bloco,
            ordem: bloco.ordem,
            prescricao: bloco.prescricao || '',
            padroes_movimento: bloco.bloco_padrao_movimento?.map(bpm => bpm.padrao_movimento_id) || [],
            exercicios: bloco.bloco_exercicios
              ?.sort((a, b) => a.ordem - b.ordem)
              .map((be) => ({
                id: be.id,
                exercicio_id: be.exercicio_id,
                ordem: be.ordem,
                series: be.series || '',
                repeticoes: be.repeticoes || '',
                carga: be.carga || '',
              })) || [],
          }))
        setBlocos(blocosFormatados)
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error)
      alert('Erro ao carregar treino')
      navigate('/treinos')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let treinoId = id

      // Salvar treino
      if (id) {
        const { error } = await supabase
          .from('treinos')
          .update({
            data: formData.data,
            semana_id: formData.semana_id || null,
            observacoes: formData.observacoes || null,
          })
          .eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('treinos')
          .insert([
            {
              data: formData.data,
              semana_id: formData.semana_id || null,
              observacoes: formData.observacoes || null,
            },
          ])
          .select()
          .single()
        if (error) throw error
        treinoId = data.id
      }

      // Deletar blocos antigos se estiver editando
      if (id) {
        await supabase
          .from('blocos_treino')
          .delete()
          .eq('treino_id', treinoId)
      }

      // Criar novos blocos
      for (const bloco of blocos) {
        const { data: blocoData, error: blocoError } = await supabase
          .from('blocos_treino')
          .insert([
            {
              treino_id: treinoId,
              tipo_bloco: bloco.tipo_bloco,
              ordem: bloco.ordem,
              prescricao: bloco.prescricao || null,
            },
          ])
          .select()
          .single()

        if (blocoError) throw blocoError

        const blocoId = blocoData.id

        // Associar padrões de movimento se for PADRAO_MOVIMENTO
        if (bloco.tipo_bloco === 'PADRAO_MOVIMENTO' && bloco.padroes_movimento.length > 0) {
          const padroesToInsert = bloco.padroes_movimento.map((pmId) => ({
            bloco_id: blocoId,
            padrao_movimento_id: pmId,
          }))

          const { error: padroesError } = await supabase
            .from('bloco_padrao_movimento')
            .insert(padroesToInsert)
          if (padroesError) throw padroesError
        }

        // Inserir exercícios se for ATIVACAO_CORE ou TREINO
        if (
          (bloco.tipo_bloco === 'ATIVACAO_CORE' || bloco.tipo_bloco === 'TREINO') &&
          bloco.exercicios.length > 0
        ) {
          const exerciciosToInsert = bloco.exercicios.map((ex) => ({
            bloco_id: blocoId,
            exercicio_id: ex.exercicio_id,
            ordem: ex.ordem,
            series: ex.series || null,
            repeticoes: ex.repeticoes || null,
            carga: ex.carga || null,
          }))

          const { error: exError } = await supabase
            .from('bloco_exercicios')
            .insert(exerciciosToInsert)
          if (exError) throw exError
        }
      }

      alert('Treino salvo com sucesso!')
      navigate('/treinos')
    } catch (error) {
      alert('Erro ao salvar treino: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addBloco = () => {
    setBlocos([
      ...blocos,
      {
        id: null,
        tipo_bloco: 'PADRAO_MOVIMENTO',
        ordem: blocos.length + 1,
        prescricao: '',
        padroes_movimento: [],
        exercicios: [],
      },
    ])
  }

  const removeBloco = (index) => {
    const novosBlocos = blocos.filter((_, i) => i !== index).map((b, i) => ({
      ...b,
      ordem: i + 1,
    }))
    setBlocos(novosBlocos)
  }

  const updateBloco = (index, field, value) => {
    const updated = [...blocos]
    updated[index] = { ...updated[index], [field]: value }
    setBlocos(updated)
  }

  const addExercicioToBloco = (blocoIndex) => {
    const updated = [...blocos]
    updated[blocoIndex].exercicios = [
      ...updated[blocoIndex].exercicios,
      {
        id: null,
        exercicio_id: '',
        ordem: updated[blocoIndex].exercicios.length + 1,
        series: '',
        repeticoes: '',
        carga: '',
      },
    ]
    setBlocos(updated)
  }

  const removeExercicioFromBloco = (blocoIndex, exercicioIndex) => {
    const updated = [...blocos]
    updated[blocoIndex].exercicios = updated[blocoIndex].exercicios
      .filter((_, i) => i !== exercicioIndex)
      .map((ex, i) => ({ ...ex, ordem: i + 1 }))
    setBlocos(updated)
  }

  const updateExercicioInBloco = (blocoIndex, exercicioIndex, field, value) => {
    const updated = [...blocos]
    updated[blocoIndex].exercicios[exercicioIndex] = {
      ...updated[blocoIndex].exercicios[exercicioIndex],
      [field]: value,
    }
    setBlocos(updated)
  }

  const togglePadraoMovimento = (blocoIndex, padraoId) => {
    const updated = [...blocos]
    const padroes = updated[blocoIndex].padroes_movimento
    if (padroes.includes(padraoId)) {
      updated[blocoIndex].padroes_movimento = padroes.filter((id) => id !== padraoId)
    } else {
      updated[blocoIndex].padroes_movimento = [...padroes, padraoId]
    }
    setBlocos(updated)
  }

  return (
    <div className="form-treino-container">
      <Breadcrumb items={[
        { label: 'Treinos', to: '/treinos' },
        { label: id ? 'Editar' : 'Novo', to: '#' }
      ]} />
      <h1>{id ? 'Editar' : 'Novo'} Treino</h1>
      
      <form onSubmit={handleSubmit} className="treino-form">
        <div className="form-section">
          <h3>Informações Básicas</h3>
          
          <div className="form-group">
            <label>Data *</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Semana</label>
            <select
              value={formData.semana_id}
              onChange={(e) =>
                setFormData({ ...formData, semana_id: e.target.value })
              }
            >
              <option value="">Nenhuma</option>
              {semanas.map((semana) => (
                <option key={semana.id} value={semana.id}>
                  {new Date(semana.data_inicio).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(semana.data_fim).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>
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
        </div>

        <div className="blocos-section">
          <div className="section-header">
            <h3>Blocos do Treino</h3>
            <button
              type="button"
              onClick={addBloco}
              className="btn-add-bloco"
            >
              + Adicionar Bloco
            </button>
          </div>

          {blocos.map((bloco, blocoIndex) => (
            <div key={blocoIndex} className="bloco-form-card">
              <div className="bloco-form-header">
                <span className="bloco-numero">Bloco {bloco.ordem}</span>
                <button
                  type="button"
                  onClick={() => removeBloco(blocoIndex)}
                  className="btn-remove-bloco"
                >
                  ×
                </button>
              </div>

              <div className="form-group">
                <label>Tipo de Bloco *</label>
                <select
                  value={bloco.tipo_bloco}
                  onChange={(e) =>
                    updateBloco(blocoIndex, 'tipo_bloco', e.target.value)
                  }
                  required
                >
                  {TIPOS_BLOCO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {bloco.tipo_bloco === 'PADRAO_MOVIMENTO' && (
                <div className="form-group">
                  <label>Padrões de Movimento *</label>
                  <div className="padroes-checkboxes">
                    {padroesMovimento.map((padrao) => (
                      <label key={padrao.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bloco.padroes_movimento.includes(padrao.id)}
                          onChange={() =>
                            togglePadraoMovimento(blocoIndex, padrao.id)
                          }
                        />
                        {padrao.nome}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(bloco.tipo_bloco === 'ATIVACAO_CORE' ||
                bloco.tipo_bloco === 'TREINO') && (
                <>
                  <div className="form-group">
                    <label>Prescrição *</label>
                    <textarea
                      value={bloco.prescricao}
                      onChange={(e) =>
                        updateBloco(blocoIndex, 'prescricao', e.target.value)
                      }
                      rows="2"
                      required
                      placeholder="Ex: 9x30''x15''"
                    />
                  </div>

                  <div className="exercicios-bloco-section">
                    <div className="section-header-small">
                      <h4>Exercícios</h4>
                      <button
                        type="button"
                        onClick={() => addExercicioToBloco(blocoIndex)}
                        className="btn-add-exercicio"
                      >
                        + Exercício
                      </button>
                    </div>

                    {bloco.exercicios.map((ex, exIndex) => (
                      <div key={exIndex} className="exercicio-form-item">
                        <div className="exercicio-form-row">
                          <div className="form-group-small">
                            <label>Ordem</label>
                            <input
                              type="number"
                              value={ex.ordem}
                              onChange={(e) =>
                                updateExercicioInBloco(
                                  blocoIndex,
                                  exIndex,
                                  'ordem',
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                              required
                            />
                          </div>

                          <div className="form-group-large">
                            <label>Exercício *</label>
                            <select
                              value={ex.exercicio_id}
                              onChange={(e) =>
                                updateExercicioInBloco(
                                  blocoIndex,
                                  exIndex,
                                  'exercicio_id',
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Selecione</option>
                              {exercicios.map((exercicio) => (
                                <option key={exercicio.id} value={exercicio.id}>
                                  {exercicio.nome}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group-small">
                            <label>Séries</label>
                            <input
                              type="number"
                              value={ex.series}
                              onChange={(e) =>
                                updateExercicioInBloco(
                                  blocoIndex,
                                  exIndex,
                                  'series',
                                  e.target.value
                                )
                              }
                              min="1"
                            />
                          </div>

                          <div className="form-group-small">
                            <label>Repetições</label>
                            <input
                              type="text"
                              value={ex.repeticoes}
                              onChange={(e) =>
                                updateExercicioInBloco(
                                  blocoIndex,
                                  exIndex,
                                  'repeticoes',
                                  e.target.value
                                )
                              }
                              placeholder="Ex: 10-12"
                            />
                          </div>

                          <div className="form-group-small">
                            <label>Carga</label>
                            <input
                              type="text"
                              value={ex.carga}
                              onChange={(e) =>
                                updateExercicioInBloco(
                                  blocoIndex,
                                  exIndex,
                                  'carga',
                                  e.target.value
                                )
                              }
                              placeholder="Ex: 20kg"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeExercicioFromBloco(blocoIndex, exIndex)
                            }
                            className="btn-remove-exercicio"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {['MOBILIDADE_ARTICULAR', 'ATIVACAO_NEURAL', 'CONDICIONAMENTO_FISICO'].includes(
                bloco.tipo_bloco
              ) && (
                <div className="form-group">
                  <label>Prescrição</label>
                  <textarea
                    value={bloco.prescricao}
                    onChange={(e) =>
                      updateBloco(blocoIndex, 'prescricao', e.target.value)
                    }
                    rows="2"
                    placeholder="Descreva a prescrição do bloco"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/treinos')}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormTreino
