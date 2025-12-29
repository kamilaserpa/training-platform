// Página de detalhes de um treino específico (Owner/Viewer)
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { treinosService } from '../services/treinos'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import './TreinoDetalhes.css'

const TreinoDetalhes = () => {
  const { id } = useParams()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLink, setShareLink] = useState('')
  const [linkExpiresAt, setLinkExpiresAt] = useState('')
  const [linkActive, setLinkActive] = useState(true)
  const [saving, setSaving] = useState(false)
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
          // Converter para datetime-local format (YYYY-MM-DDTHH:mm)
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
        const { error } = await supabase
          .from('treinos')
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
        alert('Link gerado e copiado para a área de transferência!')
      } catch (error) {
        alert('Erro ao gerar link: ' + error.message)
      }
    } else {
      // Copiar link existente
      await navigator.clipboard.writeText(shareLink)
      alert('Link copiado para a área de transferência!')
    }
  }

  const updateLinkSettings = async () => {
    setSaving(true)
    try {
      const updateData = {
        link_active: linkActive,
        link_expires_at: linkExpiresAt ? new Date(linkExpiresAt).toISOString() : null
      }

      const { error } = await supabase
        .from('treinos')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      await loadTreino()
      alert('Configurações do link atualizadas com sucesso!')
    } catch (error) {
      alert('Erro ao atualizar configurações: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getLinkStatus = () => {
    if (!treino?.token_compartilhamento) return null
    
    // Usar dados do treino carregado (mais confiável)
    const isActive = treino.link_active !== false
    const expiresAt = treino.link_expires_at ? new Date(treino.link_expires_at) : null
    
    if (!isActive) {
      return { status: 'desativado', label: 'Desativado', color: '#f44336' }
    }
    
    if (expiresAt) {
      const now = new Date()
      if (now > expiresAt) {
        return { status: 'expirado', label: 'Expirado', color: '#ff9800' }
      }
    }
    
    return { status: 'ativo', label: 'Ativo', color: '#4caf50' }
  }

  const getTipoBlocoLabel = (tipo) => {
    const labels = {
      PADRAO_MOVIMENTO: 'Padrão de Movimento',
      MOBILIDADE_ARTICULAR: 'Mobilidade Articular',
      ATIVACAO_CORE: 'Ativação de Core',
      ATIVACAO_NEURAL: 'Ativação Neural',
      TREINO: 'Treino',
      CONDICIONAMENTO_FISICO: 'Condicionamento Físico',
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return <div className="loading">Carregando treino...</div>
  }

  if (!treino) {
    return (
      <div className="error-state">
        <p>Treino não encontrado.</p>
        <Link to="/treinos" className="btn-primary">Voltar</Link>
      </div>
    )
  }

  const blocos = treino.blocos_treino
    ? [...treino.blocos_treino].sort((a, b) => a.ordem - b.ordem)
    : []

  const linkStatus = getLinkStatus()

  return (
    <div className="treino-detalhes-container">
      <Breadcrumb items={[
        { label: 'Treinos', to: '/treinos' },
        { label: 'Detalhes', to: `/treinos/${id}` }
      ]} />
      
      <div className="treino-detalhes-header">
        <Link to="/treinos" className="back-link">← Voltar</Link>
        <div className="header-actions">
          {canEdit && (
            <>
              <Link
                to={`/treinos/${id}/editar`}
                className="btn-primary"
              >
                Editar Treino
              </Link>
              <button onClick={generateShareLink} className="btn-share">
                📤 Compartilhar
              </button>
            </>
          )}
        </div>
      </div>

      {canEdit && shareLink && (
        <div className="share-link-box">
          <div className="share-link-header">
            <p><strong>Link de compartilhamento:</strong></p>
            {linkStatus && (
              <span 
                className="link-status-badge"
                style={{ backgroundColor: linkStatus.color }}
              >
                {linkStatus.label}
              </span>
            )}
          </div>
          
          <div className="share-link-input">
            <input type="text" value={shareLink} readOnly />
            <button onClick={generateShareLink} className="btn-copy">
              Copiar
            </button>
          </div>

          <div className="link-settings">
            <h4>Configurações do Link</h4>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={linkActive}
                  onChange={(e) => setLinkActive(e.target.checked)}
                />
                <span>Link ativo</span>
              </label>
            </div>

            <div className="form-group">
              <label>Data/Hora de Expiração (opcional)</label>
              <input
                type="datetime-local"
                value={linkExpiresAt}
                onChange={(e) => setLinkExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <small className="form-help">
                Deixe em branco para link sem expiração
              </small>
            </div>

            {treino.link_expires_at && (
              <div className="expiration-info">
                <strong>Expira em:</strong>{' '}
                {new Date(treino.link_expires_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}

            <button
              onClick={updateLinkSettings}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      )}

      <div className="treino-info">
        <h1>{new Date(treino.data).toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</h1>
        
        {treino.semanas?.tipos_treino && (
          <span className="tipo-badge">
            {treino.semanas.tipos_treino.nome}
          </span>
        )}

        {treino.observacoes && (
          <p className="treino-observacoes">{treino.observacoes}</p>
        )}
      </div>

      {blocos.length > 0 ? (
        <div className="blocos-container">
          <h2>Blocos do Treino</h2>
          {blocos.map((bloco) => (
            <div key={bloco.id} className="bloco-card">
              <div className="bloco-header">
                <span className="bloco-ordem">{bloco.ordem}</span>
                <h3>{getTipoBlocoLabel(bloco.tipo_bloco)}</h3>
              </div>

              {bloco.tipo_bloco === 'PADRAO_MOVIMENTO' &&
                bloco.bloco_padrao_movimento &&
                bloco.bloco_padrao_movimento.length > 0 && (
                  <div className="padroes-movimento">
                    {bloco.bloco_padrao_movimento.map((bpm, idx) => (
                      <span key={idx} className="padrao-badge">
                        {bpm.padroes_movimento?.nome}
                      </span>
                    ))}
                  </div>
                )}

              {(bloco.tipo_bloco === 'ATIVACAO_CORE' ||
                bloco.tipo_bloco === 'TREINO') &&
                bloco.prescricao && (
                  <div className="bloco-prescricao">
                    <strong>Prescrição:</strong>
                    <p>{bloco.prescricao}</p>
                  </div>
                )}

              {bloco.bloco_exercicios &&
                bloco.bloco_exercicios.length > 0 && (
                  <div className="exercicios-list">
                    <h4>Exercícios:</h4>
                    <ul>
                      {bloco.bloco_exercicios
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((be) => (
                          <li key={be.id} className="exercicio-item">
                            <div className="exercicio-nome">
                              <strong>{be.exercicios?.nome || 'Exercício'}</strong>
                              {be.exercicios?.grupo_muscular && (
                                <span className="grupo-muscular">
                                  ({be.exercicios.grupo_muscular})
                                </span>
                              )}
                            </div>
                            <div className="exercicio-detalhes">
                              {be.series && <span>{be.series} séries</span>}
                              {be.repeticoes && <span>{be.repeticoes} reps</span>}
                              {be.carga && <span>{be.carga}</span>}
                            </div>
                            {be.exercicios?.observacoes && (
                              <p className="exercicio-obs">
                                {be.exercicios.observacoes}
                              </p>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

              {['MOBILIDADE_ARTICULAR', 'ATIVACAO_NEURAL', 'CONDICIONAMENTO_FISICO'].includes(bloco.tipo_bloco) &&
                bloco.prescricao && (
                  <div className="bloco-prescricao">
                    <p>{bloco.prescricao}</p>
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-blocos">
          <p>Nenhum bloco cadastrado neste treino.</p>
        </div>
      )}
    </div>
  )
}

export default TreinoDetalhes
