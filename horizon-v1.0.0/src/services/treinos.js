// Serviço de treinos - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'
import { treinoMock } from '../../frontend/data/mockTreinos'

// Mock data - lista de treinos
const mockTreinosList = [
  {
    id: '1',
    data: '2025-01-15',
    observacoes: 'Treino A - Mock',
    semanas: {
      id: 's1',
      data_inicio: '2025-01-01',
      data_fim: '2025-01-31',
      tipos_treino: { nome: 'Hipertrofia 65%' }
    }
  },
  {
    id: '2',
    data: '2025-01-16',
    observacoes: 'Treino B - Mock',
    semanas: {
      id: 's1',
      data_inicio: '2025-01-01',
      data_fim: '2025-01-31',
      tipos_treino: { nome: 'Hipertrofia 65%' }
    }
  },
  {
    id: '3',
    data: '2025-01-17',
    observacoes: 'Treino C - Mock',
    semanas: {
      id: 's1',
      data_inicio: '2025-01-01',
      data_fim: '2025-01-31',
      tipos_treino: { nome: 'Força 80%' }
    }
  }
]

// Serviços de treinos
export const treinosService = {
  // Listar todos os treinos
  async getAll() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Retornando lista mock')
      return {
        data: mockTreinosList,
        error: null
      }
    }
    
    return await supabase
      .from('treinos')
      .select(`
        *,
        semanas (
          id,
          data_inicio,
          data_fim,
          tipos_treino ( nome )
        )
      `)
      .order('data', { ascending: false })
  },

  // Buscar treino por ID
  async getById(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Retornando treino mock:', id)
      return {
        data: treinoMock,
        error: null
      }
    }
    
    return await supabase
      .from('treinos')
      .select(`
        *,
        semanas (
          id,
          data_inicio,
          data_fim,
          tipos_treino ( nome )
        ),
        blocos_treino (
          *,
          bloco_padrao_movimento (
            padrao_movimento_id,
            padroes_movimento ( nome )
          ),
          bloco_exercicios (
            *,
            exercicios (
              id,
              nome,
              grupo_muscular,
              observacoes
            )
          )
        )
      `)
      .eq('id', id)
      .order('ordem', { foreignTable: 'blocos_treino' })
      .order('ordem', { foreignTable: 'blocos_treino.bloco_exercicios' })
      .single()
  },

  // Criar treino
  async create(treino) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Create simulado')
      return {
        data: { ...treino, id: 'mock-new-id' },
        error: null
      }
    }
    
    return await supabase.from('treinos').insert(treino).select().single()
  },

  // Atualizar treino
  async update(id, treino) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Update simulado')
      return { data: { ...treino, id }, error: null }
    }
    
    return await supabase.from('treinos').update(treino).eq('id', id).select().single()
  },

  // Deletar treino
  async delete(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Delete simulado')
      return { error: null }
    }
    
    return await supabase.from('treinos').delete().eq('id', id)
  },

  // Buscar histórico com blocos (usado na página Histórico)
  async getHistorico() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Treinos] Retornando histórico mock')
      // Retorna lista com blocos
      const treinosComBlocos = mockTreinosList.map(t => ({
        ...t,
        blocos_treino: treinoMock.blocos_treino.map((b, idx) => ({
          id: `${t.id}-bloco-${idx}`,
          tipo_bloco: b.tipo_bloco,
          ordem: b.ordem
        }))
      }))
      return {
        data: treinosComBlocos,
        error: null
      }
    }
    
    return await supabase
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
        ),
        blocos_treino (
          id,
          tipo_bloco,
          ordem
        )
      `)
      .order('data', { ascending: false })
      .limit(50)
  }
}

