import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PageHeader from '../../components/PageHeader';

const Perfil = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Senha
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (user) {
      setNewName(user.name || '');
      loadAvatar();
    }
  }, [user]);

  // Detectar fluxo de recuperação de senha via link do Supabase
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && hash.includes('type=recovery')) {
      setIsRecovery(true);
      setEditing(false);
    }
  }, []);

  const loadAvatar = async () => {
    if (!user?.avatar_url) return;

    try {
      const { data, error } = await supabase.storage.from('images').download(user.avatar_url);

      if (error) {
        console.error('Erro ao carregar avatar:', error);
        return;
      }

      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Erro ao carregar avatar:', err);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB');
      return;
    }

    // Armazenar arquivo e criar preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setEditing(true);
    setError('');
  };

  const handleSaveChanges = async () => {
    if (!user || (!newName.trim() && !selectedFile)) {
      setError('Nenhuma alteração para salvar');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let newAvatarPath = user.avatar_url;

      // Upload da foto se uma nova foi selecionada
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `avatars/${user.id}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
        }

        newAvatarPath = filePath;
      }

      // Atualizar perfil no banco
      const updateData: any = {};

      if (newName.trim() !== user.name) {
        updateData.name = newName.trim();
      }

      if (newAvatarPath !== user.avatar_url) {
        updateData.avatar_url = newAvatarPath;
      }

      if (Object.keys(updateData).length > 0) {
        const { data: userData, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id)
          .select();

        if (updateError) {
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
        }
      }

      // Atualizar preview com a nova imagem
      if (previewUrl) {
        setAvatarUrl(previewUrl);
      }

      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);

      // Atualizar contexto do usuário
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user?.name || '');
    setEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validações básicas
    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setError('Preencha todos os campos de senha');
      return;
    }
    if (pwdNew.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setError('A confirmação da senha não confere');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Se veio de link de recuperação, não é necessário verificar a senha atual
      if (!isRecovery) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: pwdCurrent,
        });
        if (verifyError) {
          throw new Error('Senha atual incorreta');
        }
      }

      // Atualizar senha (válido para ambos os fluxos)
      const { error: updateError } = await supabase.auth.updateUser({ password: pwdNew });
      if (updateError) {
        throw new Error(updateError.message || 'Erro ao atualizar senha');
      }

      setSuccess('Senha atualizada com sucesso!');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      if (isRecovery) {
        setIsRecovery(false);
        // Limpar fragmento da URL para evitar estado persistente
        if (typeof window !== 'undefined' && window.history && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível alterar a senha');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const redirectTo = `${window.location.origin}/pages/perfil`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo,
      });
      if (resetError) {
        throw new Error(resetError.message || 'Erro ao enviar e-mail de redefinição');
      }
      setSuccess(
        'Enviamos um e-mail com o link para redefinir sua senha. Verifique sua caixa de entrada.',
      );
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o e-mail de redefinição');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning">Você precisa estar logado para acessar esta página</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais" />
      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} display="flex" flexDirection="column" alignItems="center">
              <Box position="relative" mb={2}>
                <Avatar
                  src={previewUrl || avatarUrl || undefined}
                  alt={user.name}
                  sx={{
                    width: 150,
                    height: 150,
                    fontSize: '3rem',
                    border: '4px solid',
                    borderColor: previewUrl ? 'warning.main' : 'primary.main',
                    transition: 'border-color 0.3s',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>

                <IconButton
                  component="label"
                  disabled={loading}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    disabled={loading}
                  />
                </IconButton>
              </Box>

              <Typography variant="caption" color="text.secondary" textAlign="center">
                Clique no ícone da câmera para selecionar uma foto
                <br />
                (Máximo 2MB - JPG, PNG ou GIF)
              </Typography>

              {previewUrl && (
                <Alert severity="info" sx={{ mt: 2, maxWidth: 400 }}>
                  Nova foto selecionada. Clique em "Salvar Alterações" para confirmar.
                </Alert>
              )}
            </Grid>

            {/* Alerts */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              </Grid>
            )}

            {/* Divider */}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Name Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} mb={4}>
                Informações do Perfil
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nome"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setEditing(true);
                    }}
                    fullWidth
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    value={user.email}
                    fullWidth
                    disabled
                    helperText="O email não pode ser alterado"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Função"
                    value={
                      user.role === 'owner'
                        ? 'Proprietário'
                        : user.role === 'admin'
                          ? 'Administrador'
                          : 'Visualizador'
                    }
                    fullWidth
                    disabled
                  />
                </Grid>

                {editing && (
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={
                          loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
                        }
                        onClick={handleSaveChanges}
                        disabled={loading || (!newName.trim() && !selectedFile)}
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Divider */}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Password Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} mb={4}>
                Segurança
              </Typography>
              <Grid container spacing={3}>
                {isRecovery && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Você acessou um link de recuperação. Defina uma nova senha abaixo. Não é
                      necessário informar a senha atual.
                    </Alert>
                  </Grid>
                )}
                {!isRecovery && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      type="password"
                      label="Senha atual"
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                      fullWidth
                      disabled={loading}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <TextField
                    type="password"
                    label="Nova senha"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    helperText="Mínimo de 8 caracteres"
                    fullWidth
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="password"
                    label="Confirmar nova senha"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="flex-end"
                  >
                    <Button variant="contained" onClick={handleChangePassword} disabled={loading}>
                      {loading ? 'Atualizando...' : 'Alterar Senha'}
                    </Button>
                    {!isRecovery && (
                      <Button variant="outlined" onClick={handleSendResetEmail} disabled={loading}>
                        Redefinir via e-mail
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Perfil;
