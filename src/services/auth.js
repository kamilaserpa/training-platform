// Serviço de autenticação - abstração que usa mock ou Supabase
import { USE_MOCK } from '../config/env'
import { supabase } from '../lib/supabase'

// Mock data
const mockUser = {
  id: 'mock-user-id',
  email: 'owner@mock.com',
  user_metadata: { name: 'Owner Mock' }
}

const mockProfile = {
  user_id: 'mock-user-id',
  role: 'owner',
  active: true
}

// Serviços de autenticação
export const authService = {
  async getSession() {
    if (USE_MOCK) {
      // Mock: sempre retorna sessão ativa
      return {
        data: {
          session: {
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh'
          }
        },
        error: null
      }
    }
    
    return await supabase.auth.getSession()
  },

  async signInWithPassword({ email, password }) {
    if (USE_MOCK) {
      // Mock: aceita qualquer email/senha
      console.log('🔧 [Mock Auth] Login fake aceito:', email)
      return {
        data: {
          user: mockUser,
          session: {
            user: mockUser,
            access_token: 'mock-token'
          }
        },
        error: null
      }
    }
    
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    if (USE_MOCK) {
      console.log('🔧 [Mock Auth] Logout fake')
      return { error: null }
    }
    
    return await supabase.auth.signOut()
  },

  onAuthStateChange(callback) {
    if (USE_MOCK) {
      // Mock: não faz nada, sessão é sempre a mesma
      console.log('🔧 [Mock Auth] onAuthStateChange simulado')
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('🔧 [Mock Auth] Unsubscribe simulado')
          }
        }
      }
    }
    
    return supabase.auth.onAuthStateChange(callback)
  },

  async getUserProfile(userId) {
    if (USE_MOCK) {
      return {
        data: mockProfile,
        error: null
      }
    }
    
    return await supabase
      .from('profiles')
      .select('role, active')
      .eq('user_id', userId)
      .single()
  }
}

