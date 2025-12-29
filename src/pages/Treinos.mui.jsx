// Página de listagem de treinos - Material UI
import { useEffect, useState } from 'react'
import { treinosService } from '../services/treinos'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Fab,
  Stack,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
} from '@mui/icons-material'

const Treinos = () => {
  const [treinos, setTreinos] = useState([])
  const [loading, setLoading] = useState(true)
  const { canEdit } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadTreinos()
  }, [])

  const loadTreinos = async () => {
    try {
      const { data, error } = await treinosService.getAll()
      if (error) throw error
      setTreinos(data || [])
    } catch (error) {
      console.error('Erro ao carregar treinos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return

    try {
      const { error } = await treinosService.delete(id)
      if (error) throw error
      loadTreinos()
    } catch (error) {
      alert('Erro ao excluir treino: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDateDisplay = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="700">
            Treinos
          </Typography>
        </Box>
        
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/treinos/novo')}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Novo Treino
          </Button>
        )}
      </Box>

      {/* Lista de Treinos */}
      {treinos.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <FitnessCenterIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum treino cadastrado ainda.
            </Typography>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/treinos/novo')}
                sx={{ mt: 2 }}
              >
                Criar primeiro treino
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {treinos.map((treino) => {
            const dateDisplay = getDateDisplay(treino.data)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={treino.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Data destacada */}
                    <Box display="flex" gap={2} mb={2}>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 2,
                          p: 1.5,
                          minWidth: 64,
                          textAlign: 'center',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4" fontWeight="700" lineHeight={1}>
                          {dateDisplay.day}
                        </Typography>
                        <Typography variant="caption" fontSize="0.75rem">
                          {dateDisplay.month}
                        </Typography>
                      </Box>

                      <Box flex={1}>
                        <Typography
                          variant="h6"
                          component="h3"
                          gutterBottom
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            lineHeight: 1.3,
                          }}
                        >
                          {formatDate(treino.data)}
                        </Typography>

                        {treino.semanas?.tipos_treino && (
                          <Chip
                            label={treino.semanas.tipos_treino.nome}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Observações */}
                    {treino.observacoes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 2,
                          pl: 1.5,
                          borderLeft: 3,
                          borderColor: 'primary.light',
                        }}
                      >
                        {treino.observacoes}
                      </Typography>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Stack direction="row" spacing={1} width="100%">
                      <Button
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => navigate(`/treinos/${treino.id}`)}
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        Ver
                      </Button>

                      {canEdit && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/treinos/${treino.id}/editar`)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(treino.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* FAB para mobile */}
      {canEdit && treinos.length > 0 && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/treinos/novo')}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' }, // Apenas mobile
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  )
}

export default Treinos

