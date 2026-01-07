import React from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  TextField,
  Chip,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Home,
  Settings,
  Person,
  Search,
  Notifications,
  Email,
} from '@mui/icons-material';

const ThemePlayground: React.FC = () => {
  const theme = useTheme();

  // Helpers para evitar repetição
  const colorVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
  const buttonVariants = ['contained', 'outlined', 'text'] as const;
  const buttonSizes = ['small', 'medium', 'large'] as const;
  const typographyVariants = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'caption', 'overline'
  ] as const;

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 6 }}>
        🎨 Theme Playground
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
        Referência visual completa do tema atual
      </Typography>

      {/* SEÇÃO 1: CORES DO THEME */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🌈 Cores do Theme
        </Typography>
        <Grid container spacing={3}>
          {colorVariants.map((color) => (
            <Grid item xs={12} sm={6} md={4} key={color}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {color}
                  </Typography>
                  <Stack spacing={1}>
                    {/* Main Color */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: theme.palette[color].main,
                        color: theme.palette[color].contrastText,
                        borderRadius: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">main</Typography>
                      <Typography variant="caption">{theme.palette[color].main}</Typography>
                    </Box>
                    
                    {/* Light Color */}
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: theme.palette[color].light,
                        color: theme.palette.getContrastText(theme.palette[color].light),
                        borderRadius: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption">light - {theme.palette[color].light}</Typography>
                    </Box>
                    
                    {/* Dark Color */}
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: theme.palette[color].dark,
                        color: theme.palette.getContrastText(theme.palette[color].dark),
                        borderRadius: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption">dark - {theme.palette[color].dark}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 2: TIPOGRAFIA */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          ✍️ Tipografia
        </Typography>
        <Grid container spacing={2}>
          {typographyVariants.map((variant) => (
            <Grid item xs={12} sm={6} key={variant}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ minWidth: 80, color: 'text.secondary' }}>
                  {variant}:
                </Typography>
                <Typography variant={variant as any}>
                  The quick brown fox jumps
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 3: BOTÕES */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🔘 Botões
        </Typography>
        
        {buttonVariants.map((variant) => (
          <Box key={variant} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize', mb: 2 }}>
              {variant}
            </Typography>
            
            {/* Por cor */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {colorVariants.map((color) => (
                <Grid item key={color}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant={variant} color={color}>
                      {color}
                    </Button>
                    <Button variant={variant} color={color} disabled>
                      Disabled
                    </Button>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            {/* Por tamanho */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              {buttonSizes.map((size) => (
                <Button key={size} variant={variant} color="primary" size={size}>
                  {size}
                </Button>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 4: INPUTS */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          📝 Inputs
        </Typography>
        
        <Grid container spacing={4}>
          {/* TextFields */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>TextFields</Typography>
            <Stack spacing={3}>
              {(['outlined', 'filled', 'standard'] as const).map((variant) => (
                <Box key={variant}>
                  <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'capitalize' }}>
                    {variant}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField variant={variant} label="Normal" placeholder="Digite algo..." />
                    <TextField variant={variant} label="Error" error helperText="Campo obrigatório" />
                    <TextField variant={variant} label="Disabled" disabled />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Select */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Select</Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Escolha uma opção</InputLabel>
                <Select label="Escolha uma opção" defaultValue="">
                  <MenuItem value="opcao1">Opção 1</MenuItem>
                  <MenuItem value="opcao2">Opção 2</MenuItem>
                  <MenuItem value="opcao3">Opção 3</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth disabled>
                <InputLabel>Disabled</InputLabel>
                <Select label="Disabled">
                  <MenuItem value="">Nenhuma opção</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Checkboxes, Radios, Switch */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Controles</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>Checkboxes</Typography>
                <Stack>
                  <FormControlLabel control={<Checkbox />} label="Normal" />
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Marcado" />
                  <FormControlLabel control={<Checkbox disabled />} label="Desabilitado" />
                  <FormControlLabel control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />} label="Com ícone" />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>Radio Buttons</Typography>
                <FormControl>
                  <RadioGroup defaultValue="opcao1">
                    <FormControlLabel value="opcao1" control={<Radio />} label="Opção 1" />
                    <FormControlLabel value="opcao2" control={<Radio />} label="Opção 2" />
                    <FormControlLabel value="opcao3" control={<Radio disabled />} label="Desabilitado" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>Switches</Typography>
                <Stack>
                  <FormControlLabel control={<Switch />} label="Normal" />
                  <FormControlLabel control={<Switch defaultChecked />} label="Ligado" />
                  <FormControlLabel control={<Switch disabled />} label="Desabilitado" />
                  <FormControlLabel control={<Switch color="secondary" defaultChecked />} label="Secondary" />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 5: CHIPS */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🏷️ Chips
        </Typography>
        
        {(['filled', 'outlined'] as const).map((variant) => (
          <Box key={variant} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {variant}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {colorVariants.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  variant={variant}
                  color={color}
                />
              ))}
              <Chip label="Deletable" variant={variant} onDelete={() => {}} />
              <Chip label="Clickable" variant={variant} onClick={() => {}} />
              <Chip label="With Icon" variant={variant} icon={<Home />} />
            </Stack>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 6: CARDS */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🃏 Cards
        </Typography>
        
        <Grid container spacing={3}>
          {/* Card Simples */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Card Simples
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Um card básico com apenas conteúdo. Ideal para exibir informações simples de forma organizada.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card com Header */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Card com Header"
                subheader="Subtítulo opcional"
                avatar={<Person />}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Card com cabeçalho personalizado, incluindo título, subtítulo e avatar.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card com Ações */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Card com Ações
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Card que inclui botões de ação na parte inferior.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Confirmar
                </Button>
                <Button size="small" color="secondary">
                  Cancelar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* SEÇÃO 7: ÍCONES */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🎯 Ícones
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Ícones Isolados</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {[
                { Icon: Home, name: 'Home' },
                { Icon: Settings, name: 'Settings' },
                { Icon: Person, name: 'Person' },
                { Icon: Search, name: 'Search' },
                { Icon: Notifications, name: 'Notifications' },
                { Icon: Email, name: 'Email' },
                { Icon: Favorite, name: 'Favorite' }
              ].map(({ Icon, name }, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Icon />
                  <Typography variant="caption">{name}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Ícones em Botões</Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" startIcon={<Home />}>
                  Início
                </Button>
                <Button variant="outlined" startIcon={<Settings />}>
                  Configurações
                </Button>
                <Button variant="text" startIcon={<Person />}>
                  Perfil
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" endIcon={<Search />}>
                  Buscar
                </Button>
                <Button variant="outlined" endIcon={<Notifications />}>
                  Notificações
                </Button>
                <Button variant="text" endIcon={<Email />}>
                  Email
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Informações do Theme */}
      <Box sx={{ mt: 8, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Informações do Theme
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Modo:</strong> {theme.palette.mode}
            </Typography>
            <Typography variant="body2">
              <strong>Primary:</strong> {theme.palette.primary.main}
            </Typography>
            <Typography variant="body2">
              <strong>Secondary:</strong> {theme.palette.secondary.main}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Background:</strong> {theme.palette.background.default}
            </Typography>
            <Typography variant="body2">
              <strong>Paper:</strong> {theme.palette.background.paper}
            </Typography>
            <Typography variant="body2">
              <strong>Text Primary:</strong> {theme.palette.text.primary}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ThemePlayground;