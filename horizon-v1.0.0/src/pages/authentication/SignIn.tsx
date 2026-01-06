import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { supabase } from '../../lib/supabase';

interface User {
  [key: string]: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (error) setError(null); // Limpar erro quando usuário começar a digitar
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user.email || !user.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Login bem-sucedido
        console.log('Login bem-sucedido:', data.user);
        
        // Verificar se usuário existe na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, role, email')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          // Usuário não existe na tabela users
          setError('Usuário não encontrado no sistema. Entre em contato com o administrador.');
          await supabase.auth.signOut();
          return;
        }

        console.log('Dados do usuário:', userData);
        
        // Redirecionar para o dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message === 'Email not confirmed') {
        errorMessage = 'Por favor, confirme seu email antes de fazer login';
      } else if (error.message === 'Too many requests') {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <Stack
      mx="auto"
      width={410}
      height="auto"
      minHeight={800}
      direction="column"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box width={1}>
        <Button
          variant="text"
          component={Link}
          href="/"
          sx={{ ml: -1.75, pl: 1, pr: 2 }}
          startIcon={
            <IconifyIcon
              icon="ic:round-keyboard-arrow-left"
              sx={(theme) => ({ fontSize: `${theme.typography.h3.fontSize} !important` })}
            />
          }
        >
          Back to dashboard
        </Button>
      </Box>

      <Box width={1}>
        <Typography variant="h3">Sign In</Typography>
        <Typography mt={1.5} variant="body2" color="text.disabled">
          Enter your email and password to sign in!
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          disabled={loading}
          onClick={handleGoogleSignIn}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <IconifyIcon icon="logos:google-icon" />
            )
          }
          sx={{
            mt: 4,
            fontWeight: 600,
            bgcolor: 'info.main',
            '& .MuiButton-startIcon': { mr: 1.5 },
            '&:hover': { bgcolor: 'info.main' },
            '&:disabled': { bgcolor: 'info.main', opacity: 0.7 },
          }}
        >
          {loading ? 'Conectando...' : 'Sign in with Google'}
        </Button>

        <Divider sx={{ my: 3 }}>or</Divider>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            value={user.email}
            onChange={handleInputChange}
            variant="filled"
            placeholder="mail@example.com"
            autoComplete="email"
            sx={{ mt: 3 }}
            fullWidth
            autoFocus
            required
            disabled={loading}
            error={error !== null && !user.email}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={user.password}
            onChange={handleInputChange}
            variant="filled"
            placeholder="Min. 8 characters"
            autoComplete="current-password"
            sx={{ mt: 6 }}
            fullWidth
            required
            disabled={loading}
            error={error !== null && !user.password}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    opacity: user.password ? 1 : 0,
                    pointerEvents: user.password ? 'auto' : 'none',
                  }}
                >
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ border: 'none', bgcolor: 'transparent !important' }}
                    edge="end"
                    disabled={loading}
                  >
                    <IconifyIcon
                      icon={showPassword ? 'ic:outline-visibility' : 'ic:outline-visibility-off'}
                      color="neutral.main"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack mt={1.5} direction="row" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={
                <Checkbox 
                  id="checkbox" 
                  name="checkbox" 
                  size="medium" 
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Keep me logged in"
              sx={{ ml: -0.75 }}
            />
            <Link href="#!" fontSize="body2.fontSize" fontWeight={600}>
              Forgot password?
            </Link>
          </Stack>

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            sx={{ mt: 3 }} 
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        <Typography
          mt={3}
          variant="body2"
          textAlign={{ xs: 'center', md: 'left' }}
          letterSpacing={0.25}
        >
          Not registered yet?{' '}
          <Link href={paths.signup} color="primary.main" fontWeight={600}>
            Create an Account
          </Link>
        </Typography>
      </Box>

      <Typography variant="body2" color="text.disabled" fontWeight={500}>
        © 2024 Horizon UI. Made with ❤️ by{' '}
        <Link href="https://themewagon.com/" target="_blank" rel="noreferrer" fontWeight={600}>
          {'ThemeWagon'}
        </Link>{' '}
      </Typography>
    </Stack>
  );
};

export default SignIn;
