// Contexto de autenticação para gerenciar o estado do usuário e roles
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserRole = async (userId) => {
    if (!userId) {
      setUserRole(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, active')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Erro ao carregar role:', error)
        setUserRole(null)
        return
      }

      // Só considerar role se usuário estiver ativo
      if (data && data.active) {
        setUserRole(data.role || null)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error('Erro ao carregar role:', error)
      setUserRole(null)
    }
  }

  useEffect(() => {
    // Verifica se há uma sessão ativa
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    // Escuta mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    // Carregar role após login
    if (data.user) {
      await loadUserRole(data.user.id)
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserRole(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    userRole, // 'owner', 'viewer', ou null
    isOwner: userRole === 'owner',
    isViewer: userRole === 'viewer',
    isAuthenticated: !!user,
    canEdit: userRole === 'owner', // Apenas owner pode editar
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
