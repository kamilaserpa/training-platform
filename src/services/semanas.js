// Serviço de semanas - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'
import { mockSemanas } from '../data/mockSemanas'

export const semanasService = {
  // Listar todas as semanas
  async getAll() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Semanas] Retornando lista mock')
      return {
        data: mockSemanas,
        error: null
      }
    }
    
    return await supabase
      .from('semanas')
      .select(`
        *,
        tipos_treino (
          id,
          nome
        )
      `)
      .order('data_inicio', { ascending: false })
  },

  // Buscar semana por ID
  async getById(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Semanas] Buscando por ID:', id)
      const semana = mockSemanas.find(s => s.id === id)
      return {
        data: semana || null,
        error: semana ? null : { message: 'Semana não encontrada' }
      }
    }
    
    return await supabase
      .from('semanas')
      .select(`
        *,
        tipos_treino (
          id,
          nome
        )
      `)
      .eq('id', id)
      .single()
  },

  // Criar semana
  async create(semana) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Semanas] Create simulado')
      return {
        data: { ...semana, id: `mock-sem-${Date.now()}` },
        error: null
      }
    }
    
    return await supabase
      .from('semanas')
      .insert([semana])
      .select()
      .single()
  },

  // Atualizar semana
  async update(id, semana) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Semanas] Update simulado')
      return {
        data: { ...semana, id },
        error: null
      }
    }
    
    return await supabase
      .from('semanas')
      .update(semana)
      .eq('id', id)
      .select()
      .single()
  },

  // Deletar semana
  async delete(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Semanas] Delete simulado')
      return { error: null }
    }
    
    return await supabase
      .from('semanas')
      .delete()
      .eq('id', id)
  }
}

