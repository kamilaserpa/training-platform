// Context de autenticação para o sistema
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, useMock } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { User as DatabaseUser } from '../types/database.types';

// Mock user para desenvolvimento
const mockUser: DatabaseUser = {
  id: 'mock-user-id',
  email: 'usuario@mock.com',
  name: 'Usuário Mock',
  role: 'owner',
  avatar_url: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  // Estados de autenticação
  user: DatabaseUser | null;
  session: Session | null;
  loading: boolean;

  // Métodos de autenticação
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;

  // Estado de modo mock
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário no banco
  const fetchUserProfile = useCallback(async (userId: string): Promise<DatabaseUser | null> => {
    if (useMock) {
      return mockUser;
    }

    try {
      console.log(`🔄 [Auth] Buscando perfil do usuário: ${userId}`);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [Auth] Erro ao buscar perfil do usuário:', error);
        
        // Se a tabela users não existir, retornar um usuário básico
        if (error.code === 'PGRST116') {
          console.log('⚠️ [Auth] Tabela users não existe, criando usuário básico');
          return {
            id: userId,
            name: 'Usuário',
            email: 'usuario@sistema.com',
            role: 'owner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        
        return null;
      }

      console.log('✅ [Auth] Perfil do usuário carregado');
      return data;
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado ao buscar perfil:', error);
      return null;
    }
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    if (useMock) {
      console.log('🎭 [Auth] Simulando login com dados mockados');
      setUser(mockUser);
      setLoading(false);
      return {};
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ [Auth] Erro no login:', error);
        return { error };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
        }
      }

      return {};
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no login:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (email: string, password: string, name: string) => {
    if (useMock) {
      console.log('🎭 [Auth] Simulando cadastro com dados mockados');
      const newUser = { ...mockUser, email, name };
      setUser(newUser);
      setLoading(false);
      return {};
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ [Auth] Erro no cadastro:', error);
        return { error };
      }

      // Se o cadastro foi bem-sucedido, criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          name,
          role: 'viewer',
        });

        if (profileError) {
          console.error('❌ [Auth] Erro ao criar perfil:', profileError);
          return { error: profileError };
        }

        // Buscar o perfil criado
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
        }
      }

      return {};
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no cadastro:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    if (useMock) {
      console.log('🎭 [Auth] Simulando logout');
      setUser(null);
      setSession(null);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ [Auth] Erro no logout:', error);
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar sessão corrompida
  const clearSession = async () => {
    try {
      console.log('🧹 [Auth] Limpando sessão corrompida...');
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSession(null);
      console.log('✅ [Auth] Sessão limpa com sucesso');
    } catch (error) {
      console.error('❌ [Auth] Erro ao limpar sessão:', error);
    }
  };

  // Efeito para inicializar a autenticação
  useEffect(() => {
    let mounted = true;

    if (useMock) {
      console.log('🎭 [Auth] Modo mock ativado - auto-login');
      if (mounted) {
        setUser(mockUser);
        setLoading(false);
      }
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ [Auth] Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        setSession(session);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ [Auth] Erro na inicialização:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 [Auth] Mudança de estado:', event);
      setSession(session);

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) {
          setUser(profile);
        }
      } else {
        if (mounted) {
          setUser(null);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // Dependência para evitar re-renders desnecessários

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    clearSession,
    isMockMode: useMock,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para verificar se o usuário está autenticado
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirecionar para login se necessário
      console.log('⚠️ [Auth] Usuário não autenticado');
    }
  }, [auth.loading, auth.user]);

  return auth;
}
