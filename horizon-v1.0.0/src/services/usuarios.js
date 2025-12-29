// Serviço de usuários - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'
import { mockUsuarios } from '../../frontend/data/mockUsuarios'
import { mockUser } from '../../frontend/data/mockUser'

export const usuariosService = {
  // Listar todos os usuários
  async listUsers() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Usuários] Retornando lista mock')
      return {
        data: mockUsuarios,
        error: null
      }
    }
    
    return await supabase.rpc('list_users')
  },

  // Obter sessão atual
  async getSession() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Usuários] Retornando sessão mock')
      return {
        data: { session: { user: mockUser } },
        error: null
      }
    }
    
    return await supabase.auth.getSession()
  },

  // Atualizar status do usuário
  async updateUserStatus(userId, isActive) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Usuários] Update status simulado')
      return {
        data: { success: true },
        error: null
      }
    }
    
    return await supabase.rpc('update_user_status', {
      p_user_id: userId,
      p_active: isActive
    })
  },

  // Convidar novo usuário
  async inviteUser(email) {
    if (USE_MOCK) {
      console.log('🔧 [Mock Usuários] Invite simulado')
      return {
        data: { 
          id: `mock-user-${Date.now()}`,
          email,
          nome: 'Novo Usuário Mock',
          role: 'viewer',
          created_at: new Date().toISOString()
        },
        error: null
      }
    }
    
    return await supabase.rpc('invite_user', { email })
  }
}

