// Contexto de autenticação para gerenciar o estado do usuário e roles
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'

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
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar role')), 5000)
      )

      const rolePromise = authService.getUserProfile(userId)

      const { data, error } = await Promise.race([rolePromise, timeoutPromise])

      if (error) {
        console.error('Erro ao carregar role:', error.message)
        setUserRole(null)
        return
      }

      if (data && data.active) {
        setUserRole(data.role || null)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error('Erro ao carregar role:', error.message)
      setUserRole(null)
    }
  }

 useEffect(() => {
   let mounted = true

   const safetyTimeout = setTimeout(() => {
     if (mounted) {
       setLoading(false)
     }
   }, 2000)

    const initAuth = async () => {
      try {
        const sessionTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar sessão')), 5000)
        )

        const sessionPromise = authService.getSession()

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          sessionTimeoutPromise
        ])
        
        if (!mounted) return

        if (error) {
          console.error('Erro ao carregar sessão:', error)
          await authService.signOut()
          setUser(null)
          setUserRole(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserRole(session.user.id)
        } else {
          setUserRole(null)
        }
        setLoading(false)
        clearTimeout(safetyTimeout)
      } catch (err) {
        console.error('Exceção ao carregar sessão:', err.message)
        if (mounted) {
          await authService.signOut().catch(() => {})
          setUser(null)
          setUserRole(null)
          setLoading(false)
        }
      }
    }

   initAuth()

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

   return () => {
     mounted = false
     clearTimeout(safetyTimeout)
     subscription.unsubscribe()
   }
 }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authService.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      if (!data || !data.user) {
        throw new Error('Login falhou: sem dados de usuário')
      }
      
      return data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    if (error) throw error
    setUserRole(null)
  }

 const value = {
   user,
   loading,
   signIn,
   signOut,
   userRole,
   isOwner: userRole === 'owner',
   isViewer: userRole === 'viewer',
   isAuthenticated: !!user,
   canEdit: userRole === 'owner',
 }

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
