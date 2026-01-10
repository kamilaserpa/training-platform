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
  refreshUser: () => Promise<void>;

  // Verificações de permissão
  isOwner: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  canManageUsers: boolean; // Owner ou Admin podem gerenciar usuários

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
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        // Se a tabela users não existir, retornar um usuário básico
        if (error.code === 'PGRST116') {
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

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    if (useMock) {
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
        console.error('Erro no login:', error);
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
      console.error('Erro no login:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (email: string, password: string, name: string) => {
    if (useMock) {
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
        console.error('Erro no cadastro:', error);
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
          console.error('Erro ao criar perfil:', profileError);
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
      console.error('Erro no cadastro:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    if (useMock) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro no logout:', error);
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar sessão corrompida
  const clearSession = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  };

  // Função para recarregar dados do usuário
  const refreshUser = async () => {
    if (!session?.user) {
      return;
    }

    try {
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  // Efeito para inicializar a autenticação
  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;

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
          console.error('Erro ao obter sessão:', error);
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
        console.error('Erro na inicialização:', error);
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

      // Ignorar eventos INITIAL_SESSION e SIGNED_IN repetidos após o carregamento inicial
      if (isInitialLoad && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        isInitialLoad = false;
        return;
      }

      // Apenas processar eventos relevantes que indicam mudança real de estado
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(session);

        if (session?.user && event !== 'SIGNED_OUT') {
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
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Sem dependências para evitar re-criação do listener

  // Computar permissões baseadas na role do usuário
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const canManageUsers = isOwner || isAdmin;

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    clearSession,
    refreshUser,
    isOwner,
    isAdmin,
    isViewer,
    canManageUsers,
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
