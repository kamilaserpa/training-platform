import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import paths from '../../routes/paths';

interface User {
  [key: string]: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, isMockMode } = useAuth();
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (error) setError(null);
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
      const { error: signInError } = await signIn(user.email, user.password);

      if (signInError) {
        let errorMessage = 'Erro ao fazer login';

        if (signInError === 'Invalid login credentials') {
          errorMessage = 'Email ou senha incorretos';
        } else if (signInError) {
          errorMessage = signInError;
        }

        setError(errorMessage);
      } else {
        navigate(paths.dashboard);
      }
    } catch (error: any) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
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
          component={RouterLink}
          to={paths.landing}
          sx={{ ml: -1.75, pl: 1, pr: 2 }}
          startIcon={
            <IconifyIcon
              icon="ic:round-keyboard-arrow-left"
              sx={(theme) => ({ fontSize: `${theme.typography.h3.fontSize} !important` })}
            />
          }
        >
          Voltar ao início
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
          startIcon={<IconifyIcon icon="logos:google-icon" />}
          sx={{
            mt: 4,
            fontWeight: 600,
            bgcolor: 'info.main',
            '& .MuiButton-startIcon': { mr: 1.5 },
            '&:hover': { bgcolor: 'info.main' },
          }}
        >
          Sign in with Google
        </Button>

        <Divider sx={{ my: 3 }}>or</Divider>

        {isMockMode && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Modo <strong>MOCK</strong> ativo: o login não valida credenciais reais.
            Configure <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> e defina{' '}
            <strong>VITE_USE_MOCK=false</strong> para autenticação de verdade.
          </Alert>
        )}

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

          <Stack mt={1.5} alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={<Checkbox id="checkbox" name="checkbox" size="medium" color="primary" />}
              label="Keep me logged in"
              sx={{ ml: -0.75 }}
            />
            <Link href="#!" fontSize="body2.fontSize" fontWeight={600}>
              Forgot password?
            </Link>
          </Stack>

          <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} fullWidth disabled={loading}>
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
