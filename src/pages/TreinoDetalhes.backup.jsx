// Página de detalhes de um treino específico (Mobile-first + Print-ready)
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { treinosService } from '../services/treinos'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import Accordion from '../components/Accordion'
import TouchButton from '../components/TouchButton'
import EditModal from '../components/EditModal'
import FormField from '../components/FormField'
import './TreinoDetalhes.css'

const TreinoDetalhes = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [linkExpiresAt, setLinkExpiresAt] = useState('')
  const [linkActive, setLinkActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  
  // Estados para edição
  const [editingBloco, setEditingBloco] = useState(null)
  const [editingExercicio, setEditingExercicio] = useState(null)
  const [blocoForm, setBlocoForm] = useState({
    tipo_bloco: '',
    prescricao: '',
    ordem: 1
  })
  const [exercicioForm, setExercicioForm] = useState({
    nome: '',
    series: '',
    repeticoes: '',
    carga: '',
    observacoes: ''
  })
  
  const { canEdit, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    loadTreino()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated])

  const loadTreino = async () => {
    try {
      const { data, error } = await treinosService.getById(id)
      if (error) throw error
      setTreino(data)
      
      // Configurar link de compartilhamento (apenas para owner)
      if (canEdit && data.token_compartilhamento) {
        const baseUrl = window.location.origin
        setShareLink(`${baseUrl}/treino-publico/${data.token_compartilhamento}`)
        
        // Configurar campos de expiração
        if (data.link_expires_at) {
          const expiresDate = new Date(data.link_expires_at)
          const year = expiresDate.getFullYear()
          const month = String(expiresDate.getMonth() + 1).padStart(2, '0')
          const day = String(expiresDate.getDate()).padStart(2, '0')
          const hours = String(expiresDate.getHours()).padStart(2, '0')
          const minutes = String(expiresDate.getMinutes()).padStart(2, '0')
          setLinkExpiresAt(`${year}-${month}-${day}T${hours}:${minutes}`)
        } else {
          setLinkExpiresAt('')
        }
        setLinkActive(data.link_active !== false)
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateShareLink = async () => {
    if (!treino.token_compartilhamento) {
      // Gerar novo token
      const newToken = crypto.randomUUID()
      try {
        const { error } = await supabase.from('treinos')
          .update({ 
            token_compartilhamento: newToken,
            link_active: true,
            link_expires_at: null
          })
          .eq('id', id)
        
        if (error) throw error
        
        await loadTreino()
        const baseUrl = window.location.origin
        const link = `${baseUrl}/treino-publico/${newToken}`
        await navigator.clipboard.writeText(link)
        alert('Link gerado e copiado!')
      } catch (error) {
        alert('Erro ao gerar link: ' + error.message)
      }
    } else {
      // Copiar link existente
      await navigator.clipboard.writeText(shareLink)
      alert('Link copiado!')
    }
  }

  const updateLinkSettings = async () => {
    setSaving(true)
    try {
      const updateData = {
        link_active: linkActive,
        link_expires_at: linkExpiresAt ? new Date(linkExpiresAt).toISOString() : null
      }

      const { error } = await supabase.from('treinos').update(updateData).eq('id', id)
      if (error) throw error
      
      await loadTreino()
      alert('Configurações atualizadas!')
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getLinkStatus = () => {
    if (!treino?.token_compartilhamento) return null
    
    const isActive = treino.link_active !== false
    const expiresAt = treino.link_expires_at ? new Date(treino.link_expires_at) : null
    
    if (!isActive) {
      return { status: 'desativado', label: 'Desativado', color: '#ef4444' }
    }
    
    if (expiresAt && new Date() > expiresAt) {
      return { status: 'expirado', label: 'Expirado', color: '#f59e0b' }
    }
    
    return { status: 'ativo', label: 'Ativo', color: '#10b981' }
  }

  // Handlers de Bloco
  const handleAddBloco = (tipo) => {
    setBlocoForm({
      tipo_bloco: tipo,
      prescricao: '',
      ordem: (treino.blocos_treino?.length || 0) + 1
    })
    setEditingBloco('new')
  }

  const handleEditBloco = (bloco) => {
    setBlocoForm({
      tipo_bloco: bloco.tipo_bloco,
      prescricao: bloco.prescricao || '',
      ordem: bloco.ordem
    })
    setEditingBloco(bloco.id)
  }

  const handleSaveBloco = () => {
    if (!treino) return
    
    const updatedBlocos = [...(treino.blocos_treino || [])]
    
    if (editingBloco === 'new') {
      // Adicionar novo bloco
      const newBloco = {
        id: `mock-bloco-${Date.now()}`,
        ...blocoForm,
        bloco_padrao_movimento: [],
        bloco_exercicios: []
      }
      updatedBlocos.push(newBloco)
    } else {
      // Editar bloco existente
      const index = updatedBlocos.findIndex(b => b.id === editingBloco)
      if (index !== -1) {
        updatedBlocos[index] = {
          ...updatedBlocos[index],
          ...blocoForm
        }
      }
    }
    
    setTreino({ ...treino, blocos_treino: updatedBlocos })
    setEditingBloco(null)
  }

  const handleDeleteBloco = (blocoId) => {
    if (!confirm('Excluir este bloco?')) return
    const updatedBlocos = treino.blocos_treino.filter(b => b.id !== blocoId)
    setTreino({ ...treino, blocos_treino: updatedBlocos })
  }

  // Handlers de Exercício
  const handleAddExercicio = (blocoId) => {
    setExercicioForm({
      blocoId,
      nome: '',
      series: '',
      repeticoes: '',
      carga: '',
      observacoes: ''
    })
    setEditingExercicio('new')
  }

  const handleEditExercicio = (blocoId, exercicio) => {
    setExercicioForm({
      blocoId,
      nome: exercicio.exercicios?.nome || '',
      series: exercicio.series || '',
      repeticoes: exercicio.repeticoes || '',
      carga: exercicio.carga || '',
      observacoes: exercicio.exercicios?.observacoes || ''
    })
    setEditingExercicio(exercicio.id)
  }

  const handleSaveExercicio = () => {
    if (!treino) return
    
    const updatedBlocos = treino.blocos_treino.map(bloco => {
      if (bloco.id !== exercicioForm.blocoId) return bloco
      
      const exercicios = [...(bloco.bloco_exercicios || [])]
      
      if (editingExercicio === 'new') {
        // Adicionar novo exercício
        const newEx = {
          id: `mock-ex-${Date.now()}`,
          ordem: exercicios.length + 1,
          series: exercicioForm.series,
          repeticoes: exercicioForm.repeticoes,
          carga: exercicioForm.carga,
          exercicios: {
            id: `mock-exercicio-${Date.now()}`,
            nome: exercicioForm.nome,
            observacoes: exercicioForm.observacoes
          }
        }
        exercicios.push(newEx)
      } else {
        // Editar existente
        const index = exercicios.findIndex(e => e.id === editingExercicio)
        if (index !== -1) {
          exercicios[index] = {
            ...exercicios[index],
            series: exercicioForm.series,
            repeticoes: exercicioForm.repeticoes,
            carga: exercicioForm.carga,
            exercicios: {
              ...exercicios[index].exercicios,
              nome: exercicioForm.nome,
              observacoes: exercicioForm.observacoes
            }
          }
        }
      }
      
      return { ...bloco, bloco_exercicios: exercicios }
    })
    
    setTreino({ ...treino, blocos_treino: updatedBlocos })
    setEditingExercicio(null)
  }

  const handleDeleteExercicio = (blocoId, exercicioId) => {
    if (!confirm('Excluir este exercício?')) return
    
    const updatedBlocos = treino.blocos_treino.map(bloco => {
      if (bloco.id !== blocoId) return bloco
      
      const exercicios = bloco.bloco_exercicios.filter(e => e.id !== exercicioId)
      return { ...bloco, bloco_exercicios: exercicios }
    })
    
    setTreino({ ...treino, blocos_treino: updatedBlocos })
  }

  if (loading) {
    return <div className="loading-fullscreen">Carregando treino...</div>
  }

  if (!treino) {
    return (
      <div className="error-fullscreen">
        <p>Treino não encontrado</p>
        <TouchButton onClick={() => navigate('/treinos')}>
          Voltar para lista
        </TouchButton>
      </div>
    )
  }

  // Agrupar blocos por tipo
  const blocosPorTipo = {
    PADRAO_MOVIMENTO: [],
    MOBILIDADE_ARTICULAR: [],
    ATIVACAO_CORE: [],
    ATIVACAO_NEURAL: [],
    TREINO: [],
    CONDICIONAMENTO_FISICO: []
  }

  treino.blocos_treino?.forEach(bloco => {
    if (blocosPorTipo[bloco.tipo_bloco]) {
      blocosPorTipo[bloco.tipo_bloco].push(bloco)
    }
  })

  const nomesSecoes = {
    PADRAO_MOVIMENTO: 'Padrão de Movimento',
    MOBILIDADE_ARTICULAR: 'Mobilidade Articular',
    ATIVACAO_CORE: 'Ativação de Core',
    ATIVACAO_NEURAL: 'Ativação Neural',
    TREINO: 'Treino Principal',
    CONDICIONAMENTO_FISICO: 'Condicionamento Físico'
  }

  return (
    <div className="treino-detalhes-container">
      <Breadcrumb items={[
        { label: 'Treinos', to: '/treinos' },
        { label: 'Detalhes', to: `/treinos/${id}` }
      ]} />

      {/* Header do treino */}
      <div className="treino-header-card">
        <div className="treino-header-top">
          <div>
            <h1 className="treino-data">
              {new Date(treino.data).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h1>
            {treino.semana?.tipos_treino && (
              <span className="treino-tipo-badge-large">
                {treino.semana.tipos_treino.nome}
              </span>
            )}
          </div>

          {/* Toggle visualização/edição */}
          {canEdit && (
            <div className="mode-toggle">
              <TouchButton
                variant={editMode ? 'ghost' : 'primary'}
                size="small"
                onClick={() => setEditMode(false)}
              >
                👁️ Ver
              </TouchButton>
              <TouchButton
                variant={editMode ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setEditMode(true)}
              >
                ✏️ Editar
              </TouchButton>
            </div>
          )}
        </div>

        {treino.observacoes && (
          <p className="treino-observacoes-header">{treino.observacoes}</p>
        )}
      </div>

      {/* Painel de Compartilhamento */}
      {canEdit && !editMode && (
        <Accordion
          title="🔗 Compartilhar Treino"
          badge={getLinkStatus()?.label}
          defaultOpen={showSharePanel}
          className="share-panel"
        >
          <div className="share-content">
            {!treino.token_compartilhamento ? (
              <div className="share-empty">
                <p>Nenhum link de compartilhamento gerado ainda.</p>
                <TouchButton
                  variant="primary"
                  fullWidth
                  onClick={generateShareLink}
                >
                  🔗 Gerar Link de Compartilhamento
                </TouchButton>
              </div>
            ) : (
              <div className="share-active">
                {/* Status do link */}
                <div className="share-status" style={{ 
                  background: `${getLinkStatus()?.color}15`,
                  borderLeft: `4px solid ${getLinkStatus()?.color}`
                }}>
                  <span style={{ color: getLinkStatus()?.color }}>
                    ● {getLinkStatus()?.label}
                  </span>
                </div>

                {/* Link */}
                <div className="share-link-box">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="share-link-input"
                  />
                  <TouchButton
                    variant="secondary"
                    onClick={generateShareLink}
                  >
                    📋 Copiar
                  </TouchButton>
                </div>

                {/* Configurações */}
                <div className="share-settings">
                  <h4>Configurações do Link</h4>
                  
                  <div className="share-field">
                    <label className="share-toggle">
                      <input
                        type="checkbox"
                        checked={linkActive}
                        onChange={(e) => setLinkActive(e.target.checked)}
                      />
                      <span>Link ativo</span>
                    </label>
                  </div>

                  <div className="share-field">
                    <label>Data de expiração (opcional)</label>
                    <input
                      type="datetime-local"
                      value={linkExpiresAt}
                      onChange={(e) => setLinkExpiresAt(e.target.value)}
                      className="share-input"
                    />
                  </div>

                  <TouchButton
                    variant="success"
                    fullWidth
                    onClick={updateLinkSettings}
                    disabled={saving}
                  >
                    {saving ? '💾 Salvando...' : '💾 Salvar Configurações'}
                  </TouchButton>
                </div>
              </div>
            )}
          </div>
        </Accordion>
      )}

      {/* Seções do treino */}
      <div className="treino-secoes">
        {Object.entries(blocosPorTipo).map(([tipo, blocos]) => {
          if (blocos.length === 0) return null

          return (
            <Accordion
              key={tipo}
              title={nomesSecoes[tipo]}
              badge={`${blocos.length} bloco${blocos.length > 1 ? 's' : ''}`}
              defaultOpen={true}
              disabled={!editMode} // Sempre aberto em modo visualização
              className="treino-secao"
            >
              {blocos.map((bloco, index) => (
                <div key={bloco.id} className="bloco-card">
                  <div className="bloco-header">
                    <span className="bloco-numero">Bloco {bloco.ordem}</span>
                    {editMode && (
                      <div className="bloco-actions">
                        <TouchButton 
                          size="small" 
                          variant="ghost"
                          onClick={() => handleEditBloco(bloco)}
                        >
                          ✏️
                        </TouchButton>
                        <TouchButton 
                          size="small" 
                          variant="danger"
                          onClick={() => handleDeleteBloco(bloco.id)}
                        >
                          🗑️
                        </TouchButton>
                      </div>
                    )}
                  </div>

                  {bloco.prescricao && (
                    <p className="bloco-prescricao">{bloco.prescricao}</p>
                  )}

                  {/* Padrões de movimento */}
                  {bloco.bloco_padrao_movimento?.length > 0 && (
                    <div className="padroes-movimento">
                      <strong>Padrões:</strong>
                      <div className="padroes-tags">
                        {bloco.bloco_padrao_movimento.map((p, i) => (
                          <span key={i} className="padrao-tag">
                            {p.padroes_movimento?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercícios */}
                  {bloco.bloco_exercicios?.length > 0 && (
                    <div className="exercicios-list">
                      {bloco.bloco_exercicios.map((ex, i) => (
                        <div key={ex.id} className="exercicio-item">
                          <div className="exercicio-numero">{i + 1}</div>
                          <div className="exercicio-info">
                            <strong className="exercicio-nome">
                              {ex.exercicios?.nome}
                            </strong>
                            <div className="exercicio-detalhes">
                              {ex.series && <span>📊 {ex.series}x</span>}
                              {ex.repeticoes && <span>🔄 {ex.repeticoes} reps</span>}
                              {ex.carga && <span>⚡ {ex.carga}</span>}
                            </div>
                            {ex.exercicios?.observacoes && (
                              <p className="exercicio-obs">
                                💡 {ex.exercicios.observacoes}
                              </p>
                            )}
                          </div>
                          {editMode && (
                            <div className="exercicio-actions">
                              <TouchButton 
                                size="small" 
                                variant="ghost"
                                onClick={() => handleEditExercicio(bloco.id, ex)}
                              >
                                ✏️
                              </TouchButton>
                              <TouchButton 
                                size="small" 
                                variant="danger"
                                onClick={() => handleDeleteExercicio(bloco.id, ex.id)}
                              >
                                🗑️
                              </TouchButton>
                            </div>
                          )}
                        </div>
                      ))}

                      {editMode && (
                        <TouchButton
                          variant="ghost"
                          size="small"
                          fullWidth
                          icon="+"
                          onClick={() => handleAddExercicio(bloco.id)}
                        >
                          Adicionar exercício
                        </TouchButton>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {editMode && (
                <TouchButton
                  variant="secondary"
                  fullWidth
                  icon="+"
                  className="add-bloco-btn"
                  onClick={() => handleAddBloco(tipo)}
                >
                  Adicionar bloco de {nomesSecoes[tipo]}
                </TouchButton>
              )}
            </Accordion>
          )
        })}
      </div>

      {/* Ações do rodapé */}
      {!editMode && (
        <div className="treino-footer-actions">
          <TouchButton
            variant="primary"
            fullWidth
            onClick={() => window.print()}
          >
            🖨️ Imprimir / Salvar PDF
          </TouchButton>
          
          {canEdit && (
            <>
              <TouchButton
                variant="secondary"
                fullWidth
                onClick={() => setEditMode(true)}
              >
                ✏️ Editar Treino
              </TouchButton>
              <TouchButton
                variant="ghost"
                fullWidth
                onClick={() => navigate('/treinos')}
              >
                ← Voltar para lista
              </TouchButton>
            </>
          )}
        </div>
      )}

      {editMode && (
        <div className="treino-footer-actions">
          <TouchButton
            variant="success"
            fullWidth
            onClick={() => {
              alert('Salvando...')
              setEditMode(false)
            }}
          >
            💾 Salvar Alterações
          </TouchButton>
          <TouchButton
            variant="ghost"
            fullWidth
            onClick={() => setEditMode(false)}
          >
            ✖️ Cancelar
          </TouchButton>
        </div>
      )}

      {/* Modal de Edição de Bloco */}
      <EditModal
        isOpen={editingBloco !== null}
        onClose={() => setEditingBloco(null)}
        title={editingBloco === 'new' ? 'Novo Bloco' : 'Editar Bloco'}
        onSave={handleSaveBloco}
      >
        <FormField
          label="Tipo de Bloco"
          type="select"
          value={blocoForm.tipo_bloco}
          onChange={(value) => setBlocoForm({ ...blocoForm, tipo_bloco: value })}
          options={[
            { value: 'PADRAO_MOVIMENTO', label: 'Padrão de Movimento' },
            { value: 'MOBILIDADE_ARTICULAR', label: 'Mobilidade Articular' },
            { value: 'ATIVACAO_CORE', label: 'Ativação de Core' },
            { value: 'ATIVACAO_NEURAL', label: 'Ativação Neural' },
            { value: 'TREINO', label: 'Treino Principal' },
            { value: 'CONDICIONAMENTO_FISICO', label: 'Condicionamento Físico' }
          ]}
          required
        />
        <FormField
          label="Prescrição"
          type="textarea"
          value={blocoForm.prescricao}
          onChange={(value) => setBlocoForm({ ...blocoForm, prescricao: value })}
          placeholder="Ex: 3 rounds, descanso 1min entre rounds..."
        />
      </EditModal>

      {/* Modal de Edição de Exercício */}
      <EditModal
        isOpen={editingExercicio !== null}
        onClose={() => setEditingExercicio(null)}
        title={editingExercicio === 'new' ? 'Novo Exercício' : 'Editar Exercício'}
        onSave={handleSaveExercicio}
      >
        <FormField
          label="Nome do Exercício"
          value={exercicioForm.nome}
          onChange={(value) => setExercicioForm({ ...exercicioForm, nome: value })}
          placeholder="Ex: Agachamento Livre"
          required
        />
        <FormField
          label="Séries"
          value={exercicioForm.series}
          onChange={(value) => setExercicioForm({ ...exercicioForm, series: value })}
          placeholder="Ex: 4"
        />
        <FormField
          label="Repetições"
          value={exercicioForm.repeticoes}
          onChange={(value) => setExercicioForm({ ...exercicioForm, repeticoes: value })}
          placeholder="Ex: 8-12"
        />
        <FormField
          label="Carga"
          value={exercicioForm.carga}
          onChange={(value) => setExercicioForm({ ...exercicioForm, carga: value })}
          placeholder="Ex: 20kg"
        />
        <FormField
          label="Observações"
          type="textarea"
          value={exercicioForm.observacoes}
          onChange={(value) => setExercicioForm({ ...exercicioForm, observacoes: value })}
          placeholder="Ex: Descer até 90°, manter costas retas..."
          rows={3}
        />
      </EditModal>
    </div>
  )
}

export default TreinoDetalhes

