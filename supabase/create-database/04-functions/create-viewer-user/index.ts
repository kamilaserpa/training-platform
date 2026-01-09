// ==========================================
// EDGE FUNCTION: create-viewer-user
// Cria usuários com role "viewer" no workspace do owner
// ==========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface para o body da requisição
interface CreateViewerUserRequest {
  email: string
  password: string
  name?: string
}

// Interface para o response
interface CreateViewerUserResponse {
  success: boolean
  user_id?: string
  message?: string
  error?: string
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ==========================================
    // 1. VALIDAR MÉTODO
    // ==========================================
    
    if (req.method !== 'POST') {
      throw new Error('Método não permitido. Use POST.')
    }

    // ==========================================
    // 2. CRIAR CLIENTE SUPABASE ADMIN
    // ==========================================
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // ==========================================
    // 3. AUTENTICAR USUÁRIO QUE ESTÁ CHAMANDO
    // ==========================================
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autenticação não fornecido')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !caller) {
      console.error('Erro de autenticação:', authError)
      throw new Error('Não autenticado')
    }

    // ==========================================
    // 4. VERIFICAR PERMISSÕES DO CALLER
    // ==========================================
    
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, owner_id, active')
      .eq('id', caller.id)
      .single()

    if (profileError || !callerProfile) {
      console.error('Erro ao buscar perfil:', profileError)
      throw new Error('Usuário não encontrado no sistema')
    }

    // Verificar se está ativo
    if (!callerProfile.active) {
      throw new Error('Usuário inativo')
    }

    // Verificar se é Owner ou Admin
    if (callerProfile.role !== 'owner' && callerProfile.role !== 'admin') {
      throw new Error('Apenas owners e admins podem criar usuários')
    }

    // ==========================================
    // 5. OBTER DADOS DA REQUISIÇÃO
    // ==========================================
    
    const body: CreateViewerUserRequest = await req.json()

    const { email, password, name } = body

    // Validações básicas
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido')
    }

    // ==========================================
    // 6. VERIFICAR SE EMAIL JÁ EXISTE
    // ==========================================
    
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('Este email já está cadastrado')
    }

    // ==========================================
    // 7. CRIAR USUÁRIO NO AUTH
    // ==========================================
    
    console.log(`Criando usuário: ${email}`)
    
    const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name: name || email.split('@')[0],
        created_by: caller.id,
        workspace_owner: callerProfile.role === 'owner' ? caller.id : callerProfile.owner_id
      }
    })

    if (createAuthError || !newAuthUser.user) {
      console.error('Erro ao criar usuário no Auth:', createAuthError)
      throw new Error(createAuthError?.message || 'Erro ao criar usuário no Auth')
    }

    // ==========================================
    // 8. DETERMINAR OWNER_ID DO WORKSPACE
    // ==========================================
    
    // Se quem está criando é Owner, owner_id = caller.id
    // Se quem está criando é Admin, owner_id = owner_id do admin
    const workspaceOwnerId = callerProfile.role === 'owner' 
      ? caller.id 
      : callerProfile.owner_id

    // ==========================================
    // 9. INSERIR NA TABELA USERS
    // ==========================================
    
    const { error: insertUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthUser.user.id,
        email,
        name: name || email.split('@')[0],
        role: 'viewer',
        owner_id: workspaceOwnerId, // Vincular ao workspace
        active: true,
      })

    if (insertUserError) {
      console.error('Erro ao inserir usuário na tabela:', insertUserError)
      
      // Rollback: Deletar usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id)
      
      throw new Error(insertUserError.message || 'Erro ao criar perfil do usuário')
    }

    // ==========================================
    // 10. LOG E RESPONSE
    // ==========================================
    
    console.log(`✅ Usuário criado com sucesso: ${email} (ID: ${newAuthUser.user.id})`)
    console.log(`   Workspace Owner: ${workspaceOwnerId}`)
    console.log(`   Created By: ${caller.id} (${callerProfile.role})`)

    const response: CreateViewerUserResponse = {
      success: true,
      user_id: newAuthUser.user.id,
      message: 'Usuário viewer criado com sucesso'
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    // ==========================================
    // TRATAMENTO DE ERROS
    // ==========================================
    
    console.error('❌ Erro ao criar usuário:', error)

    const response: CreateViewerUserResponse = {
      success: false,
      error: error.message || 'Erro desconhecido ao criar usuário'
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
