// Serviço de tipos de treino - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'
import { mockTiposTreino } from '../../frontend/data/mockTiposTreino'

export const tiposTreinoService = {
  // Listar todos os tipos de treino
  async getAll() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Tipos Treino] Retornando lista mock')
      return {
        data: mockTiposTreino,
        error: null
      }
    }
    
    return await supabase
      .from('tipos_treino')
      .select('*')
      .order('nome', { ascending: true })
  },

  // Buscar tipo de treino por ID
  async getById(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Tipos Treino] Buscando por ID:', id)
      const tipo = mockTiposTreino.find(t => t.id === id)
      return {
        data: tipo || null,
        error: tipo ? null : { message: 'Tipo de treino não encontrado' }
      }
    }
    
    return await supabase
      .from('tipos_treino')
      .select('*')
      .eq('id', id)
      .single()
  },

  // Criar tipo de treino
  async create(tipo) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Tipos Treino] Create simulado')
      return {
        data: { ...tipo, id: `mock-tipo-${Date.now()}` },
        error: null
      }
    }
    
    return await supabase
      .from('tipos_treino')
      .insert([tipo])
      .select()
      .single()
  },

  // Atualizar tipo de treino
  async update(id, tipo) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Tipos Treino] Update simulado')
      return {
        data: { ...tipo, id },
        error: null
      }
    }
    
    return await supabase
      .from('tipos_treino')
      .update(tipo)
      .eq('id', id)
      .select()
      .single()
  },

  // Deletar tipo de treino
  async delete(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Tipos Treino] Delete simulado')
      return { error: null }
    }
    
    return await supabase
      .from('tipos_treino')
      .delete()
      .eq('id', id)
  }
}

