// Página de gerenciamento de usuários (Owner e Admin)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, useMock } from '../../lib/supabase';

interface Usuario {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  owner_id?: string; // ID do owner que criou este usuário
  active: boolean;
  created_at: string;
}

// Mock data para desenvolvimento
// Em um sistema real, cada owner teria seu próprio workspace isolado
const mockUsuarios: Usuario[] = [
  {
    user_id: 'mock-user-id', // Este é o owner logado (você)
    email: 'usuario@mock.com',
    role: 'owner',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    user_id: 'mock-admin-1',
    email: 'admin@workspace.com',
    role: 'admin',
    owner_id: 'mock-user-id', // Criado pelo owner logado
    active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    user_id: 'mock-viewer-1',
    email: 'viewer1@workspace.com',
    role: 'viewer',
    owner_id: 'mock-user-id', // Criado pelo owner logado
    active: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    user_id: 'mock-viewer-2',
    email: 'viewer2@workspace.com',
    role: 'viewer',
    owner_id: 'mock-user-id', // Criado pelo owner logado
    active: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const { canManageUsers, isOwner, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!canManageUsers) {
      navigate('/');
      return;
    }
    loadUsuarios();
  }, [canManageUsers, navigate]);

  const loadUsuarios = async () => {
    try {
      if (useMock) {
        // Em modo mock, filtrar apenas usuários do workspace do owner logado
        const currentUserId = user?.id || 'mock-user-id';

        const filtered = mockUsuarios.filter((u) => {
          // Owner vê: ele mesmo + usuários criados por ele
          if (isOwner) {
            return u.user_id === currentUserId || u.owner_id === currentUserId;
          }
          // Admin vê: apenas viewers do mesmo workspace
          if (isAdmin) {
            return u.role === 'viewer' && u.owner_id === currentUserId;
          }
          return false;
        });

        setUsuarios(filtered);
        setLoading(false);
        return;
      }

      // Buscar usuários do banco
      // Owner vê: ele mesmo + usuários onde ele é o owner_id
      // Admin vê: apenas viewers onde ele é o owner_id
      const currentUserId = user?.id;
      if (!currentUserId) {
        throw new Error('Usuário não identificado');
      }

      let query = supabase
        .from('users')
        .select('id, email, role, owner_id, active, created_at')
        .order('created_at', { ascending: false });

      if (isOwner) {
        // Owner vê: ele mesmo OU usuários criados por ele
        query = query.or(`id.eq.${currentUserId},owner_id.eq.${currentUserId}`);
      } else if (isAdmin) {
        // Admin vê: apenas viewers criados por ele
        query = query.eq('owner_id', currentUserId).eq('role', 'viewer');
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsuarios(
        data?.map((u) => ({
          user_id: u.id,
          email: u.email,
          role: u.role,
          owner_id: u.owner_id,
          active: u.active ?? true,
          created_at: u.created_at,
        })) || [],
      );
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreating(true);

    try {
      if (useMock) {
        // Simular criação em modo mock
        const newUser: Usuario = {
          user_id: `mock-viewer-${Date.now()}`,
          email: formData.email,
          role: 'viewer',
          active: true,
          created_at: new Date().toISOString(),
        };
        mockUsuarios.push(newUser);
        alert('Usuário VIEWER criado com sucesso! (modo mock)');
        resetForm();
        loadUsuarios();
        return;
      }

      // Obter token de autenticação
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Chamar Edge Function para criar usuário
      const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-viewer-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      alert('Usuário VIEWER criado com sucesso!');
      resetForm();
      loadUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'ativar' : 'desativar';

    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    try {
      if (useMock) {
        // Simular atualização em modo mock
        const userIndex = mockUsuarios.findIndex((u) => u.user_id === userId);
        if (userIndex !== -1) {
          mockUsuarios[userIndex].active = newStatus;
        }
        alert(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso! (modo mock)`);
        loadUsuarios();
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ active: newStatus })
        .eq('id', userId);

      if (error) throw error;

      alert(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      loadUsuarios();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
    setShowForm(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'error';
      case 'admin':
        return 'warning';
      case 'viewer':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} mb={0.5}>
            Gerenciar Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isOwner
              ? 'Gerencie todos os usuários do sistema'
              : 'Gerencie usuários com acesso de visualização'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isMobile ? null : <IconifyIcon icon="ic:round-person-add" />}
          onClick={() => setShowForm(true)}
          sx={{ minWidth: isMobile ? '100%' : 'auto' }}
        >
          {isMobile ? <IconifyIcon icon="ic:round-person-add" /> : 'Novo Usuário Viewer'}
        </Button>
      </Stack>

      {/* Alert informativo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {isOwner ? (
            <>
              <strong>Owner:</strong> Você visualiza apenas usuários do <strong>seu workspace</strong>
              {' '}(você + admins e viewers que você criou). Outros owners não são visíveis.
            </>
          ) : (
            <>
              <strong>Admin:</strong> Você pode criar e gerenciar apenas usuários Viewers do seu workspace.
            </>
          )}
        </Typography>
      </Alert>

      {/* Tabela de usuários */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={4}>
                        <IconifyIcon
                          icon="ic:round-people-outline"
                          fontSize={48}
                          color="text.secondary"
                        />
                        <Typography variant="body1" color="text.secondary" mt={2}>
                          Nenhum usuário cadastrado ainda.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.user_id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {usuario.email}
                        </Typography>
                        {usuario.user_id === user?.id && (
                          <Chip label="Você" size="small" color="primary" sx={{ mt: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(usuario.role)}
                          color={getRoleColor(usuario.role) as any}
                          size="small"
                          icon={
                            <IconifyIcon
                              icon={
                                usuario.role === 'owner'
                                  ? 'ic:round-workspace-premium'
                                  : usuario.role === 'admin'
                                    ? 'ic:round-admin-panel-settings'
                                    : 'ic:round-visibility'
                              }
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.active ? 'Ativo' : 'Inativo'}
                          color={usuario.active ? 'success' : 'default'}
                          size="small"
                          variant={usuario.active ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {usuario.role === 'viewer' ? (
                          <IconButton
                            size="small"
                            color={usuario.active ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(usuario.user_id, usuario.active)}
                            title={usuario.active ? 'Desativar' : 'Ativar'}
                          >
                            <IconifyIcon
                              icon={
                                usuario.active
                                  ? 'ic:round-block'
                                  : 'ic:round-check-circle-outline'
                              }
                            />
                          </IconButton>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog de criação de usuário */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateUser}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconifyIcon icon="ic:round-person-add" />
              <Typography variant="h6">Novo Usuário Viewer</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={5}>
              Crie um novo usuário com acesso somente leitura ao sistema.
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  fullWidth
                  placeholder="usuario@exemplo.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Senha Inicial"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  fullWidth
                  inputProps={{ minLength: 6 }}
                  placeholder="Mínimo 6 caracteres"
                  helperText="O usuário poderá alterar a senha após o primeiro login"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirmar Senha"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  fullWidth
                  inputProps={{ minLength: 6 }}
                  placeholder="Digite a senha novamente"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={resetForm} disabled={creating}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
