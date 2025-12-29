// Barra de navegação Material UI (AppBar + Drawer)
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarMonth as CalendarIcon,
  History as HistoryIcon,
  SportsMartialArts as ExerciseIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon,
  Science as ScienceIcon,
} from '@mui/icons-material'

const Navbar = () => {
  const { signOut, isOwner, isViewer, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  // Menu items baseado no papel do usuário
  const menuItems = []

  if (isOwner || isViewer) {
    menuItems.push(
      { label: 'Semanas', path: '/', icon: <CalendarIcon /> },
      { label: 'Treinos', path: '/treinos', icon: <FitnessCenterIcon /> },
      { label: 'Histórico', path: '/historico', icon: <HistoryIcon /> },
      { label: '🧪 Formulário (Teste)', path: '/treinos/form-demo', icon: <ScienceIcon />, isTest: true }
    )
  }

  if (isOwner) {
    menuItems.push(
      { label: 'Exercícios', path: '/exercicios', icon: <ExerciseIcon /> },
      { label: 'Tipos', path: '/tipos-treino', icon: <CategoryIcon /> },
      { label: 'Usuários', path: '/usuarios', icon: <PeopleIcon /> }
    )
  }

  // Renderizar menu
  const renderMenuItems = (mobile = false) => (
    <List sx={{ pt: mobile ? 2 : 0 }}>
      {menuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={mobile ? toggleDrawer : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: item.isTest ? 'warning.light' : 'primary.light',
                color: item.isTest ? 'warning.contrastText' : 'primary.contrastText',
                '&:hover': {
                  bgcolor: item.isTest ? 'warning.main' : 'primary.main',
                },
              },
              ...(item.isTest && {
                borderLeft: 3,
                borderColor: 'warning.main',
              }),
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? (item.isTest ? 'warning.contrastText' : 'primary.contrastText') : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              secondary={item.isTest ? 'Em desenvolvimento' : null}
              secondaryTypographyProps={{
                variant: 'caption',
                color: location.pathname === item.path ? 'inherit' : 'text.secondary'
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FitnessCenterIcon />
            Treinos Online
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, ml: 4, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    borderBottom: location.pathname === item.path ? 2 : 0,
                    borderRadius: 0,
                    px: 2,
                    ...(item.isTest && {
                      bgcolor: 'rgba(255, 193, 7, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 193, 7, 0.2)',
                      },
                    }),
                  }}
                  endIcon={
                    item.isTest ? (
                      <Chip
                        label="TESTE"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: 'warning.main',
                          color: 'warning.contrastText',
                        }}
                      />
                    ) : null
                  }
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* User Actions */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isViewer && (
                <Chip
                  icon={<VisibilityIcon />}
                  label="Visualização"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    display: { xs: 'none', sm: 'flex' },
                  }}
                />
              )}
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {isMobile ? '' : 'Sair'}
              </Button>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              color="inherit"
              variant="outlined"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FitnessCenterIcon color="primary" />
            Treinos Online
          </Typography>
          
          {isViewer && (
            <Chip
              icon={<VisibilityIcon />}
              label="Modo Visualização"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        <Divider />

        {renderMenuItems(true)}

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </Box>
      </Drawer>
    </>
  )
}

export default Navbar

