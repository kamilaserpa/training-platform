# 🎩 Criar Usuário OWNER de Forma Elegante

## 📋 Visão Geral

Este guia mostra como criar um **sistema elegante de convite para ADMIN/OWNER** usando:
- ✅ **Edge Function personalizada** para convites
- ✅ **Email de convite profissional**
- ✅ **Processo de onboarding automatizado**
- ✅ **Validação de token de convite**
- ✅ **Interface dedicada para aceitar convite**

---

## 🎯 ETAPA 1: Criar Edge Function de Convite para OWNER

### 1.1 Criar Edge Function `invite-admin-owner`

```bash
# Criar estrutura da função
mkdir -p supabase/functions/invite-admin-owner

# Criar arquivo da função
cat > supabase/functions/invite-admin-owner/index.ts << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string
  name: string
  role: 'owner' | 'admin'
  invitedBy?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    const { email, name, role, invitedBy }: InviteRequest = await req.json()

    // Validações
    if (!email || !name || !role) {
      throw new Error('Email, nome e role são obrigatórios')
    }

    if (!['owner', 'admin'].includes(role)) {
      throw new Error('Role deve ser "owner" ou "admin"')
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingUser.user) {
      throw new Error('Usuário já existe no sistema')
    }

    // Gerar token único de convite
    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    // Salvar convite na tabela
    const { error: inviteError } = await supabaseAdmin
      .from('admin_invites')
      .insert({
        email,
        name,
        role,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        invited_by: invitedBy,
        status: 'pending'
      })

    if (inviteError) throw inviteError

    // Preparar dados para o template de email
    const inviteUrl = `${Deno.env.get('SITE_URL')}/accept-invite?token=${inviteToken}`

    // Enviar email de convite usando Supabase Auth
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        invite_token: inviteToken,
        invite_url: inviteUrl,
        invited_by: invitedBy || 'Sistema',
        expires_at: expiresAt.toISOString()
      },
      redirectTo: inviteUrl
    })

    if (emailError) throw emailError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Convite enviado com sucesso',
        email,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
EOF
```

### 1.2 Deploy da Edge Function

```bash
# Conectar ao projeto PROD
supabase link --project-ref SEU_PROJECT_REF_PROD

# Deploy da função
supabase functions deploy invite-admin-owner

# Verificar deploy
supabase functions list
```

---

## 🎯 ETAPA 2: Criar Tabela para Controlar Convites

### 2.1 Migration para Tabela `admin_invites`

```bash
# Criar migration
supabase migration new create_admin_invites_table
```

```sql
-- supabase/migrations/XXXXXX_create_admin_invites_table.sql

-- Tabela para controlar convites de administradores
CREATE TABLE IF NOT EXISTS admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('owner', 'admin')),
  invite_token UUID NOT NULL UNIQUE,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_admin_invites_token ON admin_invites(invite_token);
CREATE INDEX idx_admin_invites_email ON admin_invites(email);
CREATE INDEX idx_admin_invites_status ON admin_invites(status);
CREATE INDEX idx_admin_invites_expires ON admin_invites(expires_at);

-- RLS na tabela
ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver convites
CREATE POLICY "Admins can manage invites" ON admin_invites
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- Função para limpar convites expirados
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS void AS $$
BEGIN
  UPDATE admin_invites
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admin_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_invites_updated_at
  BEFORE UPDATE ON admin_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_invites_updated_at();

-- Comentários para documentação
COMMENT ON TABLE admin_invites IS 'Controla convites para usuários administrativos (owner/admin)';
COMMENT ON COLUMN admin_invites.invite_token IS 'Token único para validar o convite';
COMMENT ON COLUMN admin_invites.status IS 'Status do convite: pending, accepted, expired, cancelled';
```

### 2.2 Aplicar Migration

```bash
supabase db push
```

---

## 🎯 ETAPA 3: Edge Function para Aceitar Convite

### 3.1 Criar `accept-admin-invite`

```bash
mkdir -p supabase/functions/accept-admin-invite

cat > supabase/functions/accept-admin-invite/index.ts << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AcceptInviteRequest {
  invite_token: string
  password: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    const { invite_token, password }: AcceptInviteRequest = await req.json()

    if (!invite_token || !password) {
      throw new Error('Token e senha são obrigatórios')
    }

    // Buscar convite válido
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('admin_invites')
      .select('*')
      .eq('invite_token', invite_token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invite) {
      throw new Error('Convite inválido ou expirado')
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(invite.email)
    if (existingUser.user) {
      throw new Error('Usuário já existe no sistema')
    }

    // Criar usuário no auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: invite.name,
        role: invite.role,
        invited_by: invite.invited_by
      }
    })

    if (createError) throw createError

    // Criar registro na tabela users
    const { error: userCreateError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (userCreateError) {
      // Reverter criação do usuário se falhar
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw userCreateError
    }

    // Marcar convite como aceito
    await supabaseAdmin
      .from('admin_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('invite_token', invite_token)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Convite aceito com sucesso!',
        user: {
          id: newUser.user.id,
          email: invite.email,
          name: invite.name,
          role: invite.role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
EOF
```

### 3.2 Deploy da Função

```bash
supabase functions deploy accept-admin-invite
```

---

## 🎯 ETAPA 4: Configurar Email Template Personalizado

### 4.0 ⚠️ CONFIGURAR SMTP CUSTOMIZADO (OBRIGATÓRIO PARA PRODUÇÃO)

**📧 PROBLEMA**: O Supabase usa email built-in com limitações severas:
- ❌ **Rate limits baixos** (poucos emails por hora)
- ❌ **Não confiável** para produção
- ❌ **Pode ir para SPAM** facilmente
- ❌ **Sem garantia de entrega**

**✅ SOLUÇÃO**: Configurar SMTP profissional.

#### 4.0.1 Opções de SMTP Recomendadas:

**🥇 SendGrid (Mais Popular)**
- ✅ 100 emails/dia GRÁTIS
- ✅ Excelente entregabilidade
- ✅ Dashboard completo
- ✅ Fácil configuração

**🥈 AWS SES (Mais Barato)**
- ✅ $0.10 por 1000 emails
- ✅ Integração com AWS
- ✅ Alta performance

**🥉 Mailgun (Alternativa)**
- ✅ 5.000 emails/mês grátis (3 meses)
- ✅ API poderosa

#### 4.0.2 Configurar SendGrid (RECOMENDADO)

**Passo 1: Criar Conta SendGrid**
1. Acesse [sendgrid.com](https://sendgrid.com)
2. **Sign Up** → Plano gratuito
3. Verificar email e completar onboarding

**Passo 2: Criar API Key**
1. **Settings** → **API Keys** → **Create API Key**
2. Nome: `training-platform-prod`
3. Permissions: **Full Access**
4. **Copiar a API Key** (só aparece uma vez!)

**Passo 3: Configurar no Supabase**
No **Dashboard Supabase PROD** → **Settings** → **Auth** → **SMTP Settings**:

```
Enable custom SMTP: ✅

SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [COLAR A API KEY DO SENDGRID]
Sender email: noreply@carolcavalcante.pages.dev
Sender name: Training Platform

Enable TLS: ✅
```

**Passo 4: Testar Configuração**
```bash
# Testar enviando um email de teste
curl -X POST 'https://SEU_PROJECT.supabase.co/auth/v1/recover' \
  -H 'apikey: SUA_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email": "seu-email@teste.com"}'
```

#### 4.0.3 Configurar AWS SES (Alternativa Avançada)

**Passo 1: AWS Console**
1. Console AWS → **Simple Email Service**
2. **Verified identities** → **Create identity**
3. **Domain**: `carolcavalcante.pages.dev`
4. Seguir processo de verificação DNS

**Passo 2: Criar SMTP Credentials**
1. **Account dashboard** → **SMTP settings**
2. **Create SMTP credentials**
3. Copiar **Username** e **Password**

**Passo 3: Configurar no Supabase**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [SMTP USERNAME]
SMTP Password: [SMTP PASSWORD]
Sender email: noreply@carolcavalcante.pages.dev
Sender name: Training Platform
```

#### 4.0.4 Verificar Domínio (IMPORTANTE)

**Para melhor entregabilidade**, configure registros DNS:

**SPF Record** (TXT):
```
v=spf1 include:sendgrid.net ~all
```

**DKIM** (configurado automaticamente pelo SendGrid)

**DMARC Record** (TXT):
```
v=DMARC1; p=none; rua=mailto:dmarc@carolcavalcante.pages.dev
```

#### 4.0.5 Testear SMTP Funcionando

```sql
-- No SQL Editor, testar reset de senha
SELECT auth.reset_password_for_email('teste@exemplo.com');
```

**✅ Se receber o email = SMTP configurado corretamente!**

#### 4.0.6 Limitações por Provedor

**SendGrid Free:**
- ✅ 100 emails/dia
- ✅ Suficiente para maioria dos casos
- 💰 $19.95/mês para 50k emails

**AWS SES:**
- ✅ Sandbox: 200 emails/dia
- ✅ Production: Ilimitado (pedir aprovação)
- 💰 $0.10 por 1000 emails

**⚠️ IMPORTANTE**: Configurar SMTP customizado é **OBRIGATÓRIO** para:
- Emails de convite funcionarem
- Emails de recuperação de senha
- Confirmação de cadastro
- Qualquer email da aplicação

### 4.1 Template de Convite Elegante

No **Supabase Dashboard PROD** → **Authentication** → **Email Templates**

**Selecionar: "Invite user"**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Convite para Training Platform</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .details strong {
            color: #2c3e50;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background: #2c3e50;
            color: #bdc3c7;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .expires {
            color: #e74c3c;
            font-weight: 500;
            background: #fdf2f2;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #e74c3c;
            margin: 20px 0;
        }
        .security-note {
            color: #7f8c8d;
            font-size: 13px;
            font-style: italic;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Training Platform</h1>
            <p>Você foi convidado(a) como Administrador!</p>
        </div>

        <div class="content">
            <p class="welcome">Olá <strong>{{ .UserMetaData.name }}</strong>,</p>

            <p>Você foi convidado(a) para ser <strong>{{ .UserMetaData.role | upper }}</strong> na Training Platform!</p>

            <div class="details">
                <strong>📧 Email:</strong> {{ .Email }}<br>
                <strong>👤 Nome:</strong> {{ .UserMetaData.name }}<br>
                <strong>🔑 Função:</strong> {{ .UserMetaData.role | upper }}<br>
                <strong>👨‍💼 Convidado por:</strong> {{ .UserMetaData.invited_by }}
            </div>

            <div class="expires">
                ⏰ <strong>Atenção:</strong> Este convite expira em 7 dias ({{ .UserMetaData.expires_at | date: "%d/%m/%Y às %H:%M" }})
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    ✨ Aceitar Convite e Criar Conta
                </a>
            </div>

            <p><strong>O que você poderá fazer:</strong></p>
            <ul style="color: #2c3e50;">
                <li>🏋️‍♀️ Gerenciar toda a plataforma de treinos</li>
                <li>👥 Criar e gerenciar usuários (OWNERs/VIEWERs)</li>
                <li>📊 Acessar relatórios e analytics</li>
                <li>⚙️ Configurar funcionalidades do sistema</li>
                <li>🎯 Supervisionar treinos e protocolos</li>
            </ul>

            <div class="security-note">
                🔐 Por segurança, este link é único e pessoal. Não compartilhe com terceiros.
            </div>
        </div>

        <div class="footer">
            <p>Training Platform © 2026</p>
            <p>Se você não esperava este convite, pode ignorar este email.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🎯 ETAPA 5: Criar Interface para Aceitar Convite

### 5.1 Página `AcceptInvite.tsx` (React/TypeScript)

```typescript
// src/pages/AcceptInvite.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface InviteDetails {
  email: string;
  name: string;
  role: string;
  invited_by: string;
  expires_at: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      validateInvite();
    } else {
      setError('Token de convite não encontrado');
      setValidating(false);
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('email, name, role, invited_by, expires_at')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setError('Convite inválido ou expirado');
        return;
      }

      setInvite(data);
    } catch (err) {
      setError('Erro ao validar convite');
    } finally {
      setValidating(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Senhas não conferem');
      return;
    }

    if (password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-admin-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          invite_token: token,
          password: password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Fazer login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invite!.email,
        password: password,
      });

      if (signInError) {
        throw new Error('Conta criada, mas erro no login automático. Tente fazer login manualmente.');
      }

      // Redirecionar para dashboard
      navigate('/dashboard', {
        replace: true,
        state: { message: 'Bem-vindo(a) à Training Platform!' }
      });

    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar convite');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Validando convite...</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-xl font-semibold mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎯 Training Platform</h1>
          <p className="text-gray-600">Finalizar Cadastro de Administrador</p>
        </div>

        {invite && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Detalhes do Convite:</h2>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> {invite.email}</p>
              <p><strong>Nome:</strong> {invite.name}</p>
              <p><strong>Função:</strong> {invite.role.toUpperCase()}</p>
              <p><strong>Convidado por:</strong> {invite.invited_by}</p>
              <p><strong>Expira em:</strong> {new Date(invite.expires_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Criar Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Criando Conta...' : '✨ Aceitar Convite e Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Ao aceitar, você concorda com nossos termos de uso.</p>
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Adicionar Rota no App

```typescript
// src/App.tsx ou src/routes/index.tsx
import AcceptInvite from './pages/AcceptInvite';

// Adicionar rota
<Route path="/accept-invite" element={<AcceptInvite />} />
```

---

## 🎯 ETAPA 6: Interface para Enviar Convites (Dashboard Admin)

### 6.1 Componente `InviteAdmin.tsx`

```typescript
// src/components/InviteAdmin.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface InviteForm {
  email: string;
  name: string;
  role: 'owner' | 'admin';
}

export default function InviteAdmin() {
  const [form, setForm] = useState<InviteForm>({
    email: '',
    name: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: user } = await supabase.auth.getUser();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-admin-owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          ...form,
          invitedBy: user.user?.email
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(`Convite enviado para ${form.email} com sucesso!`);
      setForm({ email: '', name: '', role: 'admin' });

    } catch (err: any) {
      setError(err.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">👑 Convidar Novo Administrador</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email do Convidado
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="João Silva"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Função
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as 'owner' | 'admin' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin (Gerenciar usuários e treinos)</option>
            <option value="owner">Owner (Controle total da plataforma)</option>
          </select>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-600 text-sm">✅ {success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">❌ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Enviando Convite...' : '📧 Enviar Convite'}
        </button>
      </form>
    </div>
  );
}
```

---

## 🎯 ETAPA 7: Como Usar o Sistema

### 7.1 Para o Primeiro Admin (Bootstrap)

```bash
# 1. Execute via SQL Editor do Supabase uma única vez:
curl -X POST 'https://SEU_PROJECT.supabase.co/functions/v1/invite-admin-owner' \
  -H 'Content-Type: application/json' \
  -H 'apikey: SUA_SERVICE_ROLE_KEY' \
  -d '{
    "email": "seu-email@exemplo.com",
    "name": "Seu Nome Completo",
    "role": "owner",
    "invitedBy": "Sistema"
  }'
```

### 7.2 Fluxo Normal de Uso

1. **Admin logado** acessa dashboard
2. **Vai para seção "Gerenciar Admins"**
3. **Preenche formulário** de convite
4. **Sistema envia email** elegante para o convidado
5. **Convidado clica no link** do email
6. **Convidado cria senha** na página dedicada
7. **Login automático** e redirecionamento para dashboard
8. **Convite marcado como "aceito"** no sistema

### 7.3 Vantagens desta Abordagem

- ✅ **Profissional**: Email bonito e processo elegante
- ✅ **Seguro**: Tokens únicos com expiração
- ✅ **Controlado**: Auditoria completa de convites
- ✅ **Escalável**: Funciona para múltiplos admins
- ✅ **UX Excelente**: Interface dedicada e intuitiva
- ✅ **Automático**: Login automático após aceite
- ✅ **Flexível**: Suporta roles (owner/admin)

---

## 🔧 Troubleshooting

### Problema: Email não chega
- Verificar SMTP configurado no Supabase
- Checar spam/lixo eletrônico
- Validar template de email

### Problema: Token inválido
- Verificar se convite não expirou (7 dias)
- Confirmar se já foi usado
- Validar URL completa com token

### Problema: Erro ao aceitar convite
- Verificar se usuário já existe
- Confirmar permissões RLS
- Checar logs das Edge Functions

---

## 📚 Próximos Passos

1. **Personalizar** email template com sua marca
2. **Adicionar** logs de auditoria
3. **Implementar** notificações push
4. **Criar** dashboard de convites pendentes
5. **Adicionar** re-envio de convites
6. **Integrar** com sistema de onboarding

Este sistema oferece uma experiência profissional e elegante para criar administradores da plataforma! 🎉
