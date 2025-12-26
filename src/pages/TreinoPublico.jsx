// Página pública de treino compartilhado (apenas leitura)
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './TreinoPublico.css'

const TreinoPublico = () => {
  const { token } = useParams()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTreinoPublico()
  }, [token])

  const loadTreinoPublico = async () => {
    try {
      // Buscar treino pelo token (RLS já valida se link está ativo e não expirado)
      const { data: treinoData, error: treinoError } = await supabase
        .from('treinos')
        .select('*')
        .eq('token_compartilhamento', token)
        .single()

      if (treinoError || !treinoData) {
        // RLS bloqueou ou não encontrou - link inválido, expirado ou desativado
        setError('Este treino não está mais disponível. O link pode ter expirado ou sido desativado.')
        setLoading(false)
        return
      }

      // Buscar blocos do treino
      const { data: blocosData, error: blocosError } = await supabase
        .from('blocos_treino')
        .select(`
          *,
          bloco_padrao_movimento (
            padrao_movimento_id,
            padroes_movimento (
              nome
            )
          ),
          bloco_exercicios (
            id,
            ordem,
            series,
            repeticoes,
            carga,
            exercicios (
              id,
              nome,
              grupo_muscular,
              observacoes
            )
          )
        `)
        .eq('treino_id', treinoData.id)
        .order('ordem', { ascending: true })

      if (blocosError) throw blocosError

      // Buscar semana e tipo de treino se existir
      let semanaData = null
      if (treinoData.semana_id) {
        const { data: semana, error: semanaError } = await supabase
          .from('semanas')
          .select(`
            *,
            tipos_treino (
              nome
            )
          `)
          .eq('id', treinoData.semana_id)
          .single()

        if (!semanaError) {
          semanaData = semana
        }
      }

      setTreino({
        ...treinoData,
        blocos: blocosData || [],
        semana: semanaData,
      })
    } catch (err) {
      console.error('Erro ao carregar treino:', err)
      setError('Erro ao carregar treino. O link pode estar inválido ou expirado.')
    } finally {
      setLoading(false)
    }
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
    return (
      <div className="treino-publico-container">
        <div className="loading">Carregando treino...</div>
      </div>
    )
  }

  if (error || !treino) {
    return (
      <div className="treino-publico-container">
        <div className="error-state">
          <div className="error-icon">🔒</div>
          <h2>Treino não disponível</h2>
          <p className="error-message">{error || 'O link compartilhado é inválido ou expirou.'}</p>
          <p className="error-detail">
            Entre em contato com seu treinador para obter um novo link de acesso.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="treino-publico-container">
      <div className="treino-publico-header">
        <h1>💪 Treino do Dia</h1>
        <p className="treino-date">
          {new Date(treino.data).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {treino.semana?.tipos_treino && (
          <span className="tipo-badge">
            {treino.semana.tipos_treino.nome}
          </span>
        )}
      </div>

      {treino.observacoes && (
        <div className="treino-observacoes">
          <strong>Observações:</strong> {treino.observacoes}
        </div>
      )}

      {treino.blocos && treino.blocos.length > 0 ? (
        <div className="blocos-container">
          {treino.blocos.map((bloco) => (
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

              {bloco.tipo_bloco === 'MOBILIDADE_ARTICULAR' && bloco.prescricao && (
                <div className="bloco-prescricao">
                  <p>{bloco.prescricao}</p>
                </div>
              )}

              {bloco.tipo_bloco === 'ATIVACAO_NEURAL' && bloco.prescricao && (
                <div className="bloco-prescricao">
                  <p>{bloco.prescricao}</p>
                </div>
              )}

              {bloco.tipo_bloco === 'CONDICIONAMENTO_FISICO' &&
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

      <div className="treino-footer">
        <p>Treino compartilhado via Treinos Online</p>
      </div>
    </div>
  )
}

export default TreinoPublico
