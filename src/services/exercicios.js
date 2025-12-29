// Serviço de exercícios - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'
import { mockExercicios } from '../../frontend/data/mockExercicios'

export const exerciciosService = {
  // Listar todos os exercícios
  async getAll() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Exercícios] Retornando lista mock')
      return {
        data: mockExercicios,
        error: null
      }
    }
    
    return await supabase
      .from('exercicios')
      .select('*')
      .order('nome', { ascending: true })
  },

  // Buscar exercício por ID
  async getById(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Exercícios] Buscando por ID:', id)
      const exercicio = mockExercicios.find(e => e.id === id)
      return {
        data: exercicio || null,
        error: exercicio ? null : { message: 'Exercício não encontrado' }
      }
    }
    
    return await supabase
      .from('exercicios')
      .select('*')
      .eq('id', id)
      .single()
  },

  // Criar exercício
  async create(exercicio) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Exercícios] Create simulado')
      return {
        data: { ...exercicio, id: `mock-ex-${Date.now()}` },
        error: null
      }
    }
    
    return await supabase
      .from('exercicios')
      .insert([exercicio])
      .select()
      .single()
  },

  // Atualizar exercício
  async update(id, exercicio) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Exercícios] Update simulado')
      return {
        data: { ...exercicio, id },
        error: null
      }
    }
    
    return await supabase
      .from('exercicios')
      .update(exercicio)
      .eq('id', id)
      .select()
      .single()
  },

  // Deletar exercício
  async delete(id) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Exercícios] Delete simulado')
      return { error: null }
    }
    
    return await supabase
      .from('exercicios')
      .delete()
      .eq('id', id)
  }
}

