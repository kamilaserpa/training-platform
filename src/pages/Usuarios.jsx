// Página de gerenciamento de usuários (apenas Owner)
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import './Usuarios.css'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!canEdit) {
      navigate('/')
      return
    }
    loadUsuarios()
  }, [canEdit, navigate])

  const loadUsuarios = async () => {
    try {
      // Usar função RPC para listar usuários
      const { data, error } = await supabase.rpc('list_users')

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setCreating(true)

    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      // Chamar Edge Function para criar usuário
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-viewer-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar usuário')
      }

      alert('Usuário VIEWER criado com sucesso!')
      resetForm()
      loadUsuarios()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      alert('Erro ao criar usuário: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'ativar' : 'desativar'

    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return

    try {
      const { error } = await supabase.rpc('update_user_status', {
        p_user_id: userId,
        p_active: newStatus,
      })

      if (error) throw error

      alert(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`)
      loadUsuarios()
    } catch (error) {
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    })
    setShowForm(false)
  }

  if (loading) {
    return <div className="loading">Carregando usuários...</div>
  }

  return (
    <div className="usuarios-container">
      <Breadcrumb items={[{ label: 'Usuários', to: '/usuarios' }]} />
      
      <div className="page-header">
        <h1>Gerenciar Usuários</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Novo Usuário VIEWER'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateUser} className="usuario-form">
          <h3>Novo Usuário VIEWER</h3>
          <p className="form-description">
            Crie um novo usuário com acesso somente leitura ao sistema.
          </p>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="usuario@exemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Senha Inicial *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <small className="form-help">
              O usuário poderá alterar a senha após o primeiro login
            </small>
          </div>

          <div className="form-group">
            <label>Confirmar Senha *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              minLength={6}
              placeholder="Digite a senha novamente"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Criando...' : 'Criar Usuário'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="usuarios-list">
        <h2>Usuários do Sistema</h2>
        
        {usuarios.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <div className="usuarios-table">
            <div className="table-header">
              <div className="table-cell">Email</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Criado em</div>
              <div className="table-cell">Ações</div>
            </div>
            
            {usuarios.map((usuario) => (
              <div key={usuario.user_id} className="table-row">
                <div className="table-cell">
                  <strong>{usuario.email}</strong>
                </div>
                <div className="table-cell">
                  <span className={`role-badge ${usuario.role}`}>
                    {usuario.role === 'owner' ? '👑 OWNER' : '👁️ VIEWER'}
                  </span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${usuario.active ? 'active' : 'inactive'}`}>
                    {usuario.active ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                </div>
                <div className="table-cell">
                  {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="table-cell">
                  {usuario.role === 'viewer' && (
                    <button
                      onClick={() => handleToggleStatus(usuario.user_id, usuario.active)}
                      className={`btn-toggle ${usuario.active ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      {usuario.active ? 'Desativar' : 'Ativar'}
                    </button>
                  )}
                  {usuario.role === 'owner' && (
                    <span className="no-action">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Usuarios

