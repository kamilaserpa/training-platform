import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { 
  FitnessCenter as FitnessCenterIcon,
  AccessTime as AccessTimeIcon,
  EventAvailable as EventAvailableIcon,
  Info as InfoIcon,
  CheckCircleOutline as CheckCircleIcon,
  Repeat as RepeatIcon,
  Timer as TimerIcon,
} from '@mui/icons-material'
import { trainingService } from '../../services/trainingService'

const TreinoPublico = () => {
  const { token } = useParams()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Hooks do MUI devem estar no topo, antes de qualquer return condicional
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const loadPublicTraining = async () => {
      try {
        setLoading(true)
        
        // Carregar treino público usando o service
        const trainingData = await trainingService.getPublicTraining(token)
        
        if (!trainingData) {
          setError('Treino não encontrado ou link expirado.')
          return
        }

        // Verificar se o link está ativo
        if (trainingData.link_active === false) {
          setError('Este link de compartilhamento foi desativado.')
          return
        }
        
        setTreino(trainingData)
      } catch (err) {
        console.error('Erro ao carregar treino público:', err)
        setError('Não foi possível carregar o treino. Verifique se o link está correto.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadPublicTraining()
    }
  }, [token])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getBlockInfo = (blockType) => {
    const blocks = {
      'MOBILIDADE_ARTICULAR': {
        title: 'Mobilidade Articular'
      },
      'ATIVACAO_CORE': {
        title: 'Ativação de Core'
      },
      'ATIVACAO_NEURAL': {
        title: 'Ativação Neural'
      },
      'TREINO_PRINCIPAL': {
        title: 'Treino Principal'
      },
      'CONDICIONAMENTO_FISICO': {
        title: 'Condicionamento Físico'
      }
    }
    return blocks[blockType] || { 
      title: blockType.replace(/_/g, ' ')
    }
  }

  const formatExerciseProtocol = (prescription) => {
    const protocol = []
    
    // Séries e Repetições
    if (prescription.sets && prescription.reps) {
      protocol.push({
        icon: <RepeatIcon fontSize="small" />,
        text: `${prescription.sets} × ${prescription.reps}`,
        type: 'reps',
        color: 'primary'
      })
    } else if (prescription.sets) {
      protocol.push({
        icon: <RepeatIcon fontSize="small" />,
        text: `${prescription.sets} séries`,
        type: 'reps',
        color: 'primary'
      })
    }
    
    // Duração
    if (prescription.duration_seconds) {
      const minutes = Math.floor(prescription.duration_seconds / 60)
      const seconds = prescription.duration_seconds % 60
      const timeText = minutes > 0 
        ? `${minutes}min ${seconds}s` 
        : `${seconds}s`
      protocol.push({
        icon: <TimerIcon fontSize="small" />,
        text: timeText,
        type: 'duration',
        color: 'warning'
      })
    }
    
    // Descanso
    if (prescription.rest_seconds) {
      protocol.push({
        icon: <AccessTimeIcon fontSize="small" />,
        text: `${prescription.rest_seconds}s descanso`,
        type: 'rest',
        color: 'success'
      })
    }

    // Carga
    if (prescription.weight_kg) {
      protocol.push({
        icon: <FitnessCenterIcon fontSize="small" />,
        text: `${prescription.weight_kg}kg`,
        type: 'weight',
        color: 'error'
      })
    }
    
    return protocol
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Carregando treino...
            </Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!treino) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Treino não encontrado ou link expirado.
        </Alert>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: 'info.main', minHeight: '100vh', py: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        {/* Cabeçalho do Treino */}
        <Paper 
          elevation={2}
          sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'primary.contrastText',
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight="600"
            sx={{ 
              mb: 1.5,
              fontSize: { xs: '1.5rem', sm: '1.875rem' }
            }}
          >
            {treino.name}
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 0.75, sm: 2.5 }}
            sx={{ opacity: 0.95 }}
          >
            <Box display="flex" alignItems="center" gap={0.75}>
              <EventAvailableIcon sx={{ fontSize: '1.125rem' }} />
              <Typography variant="body2" fontSize="0.875rem">
                {formatDate(treino.scheduled_date)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.75}>
              <FitnessCenterIcon sx={{ fontSize: '1.125rem' }} />
              <Typography variant="body2" fontSize="0.875rem">
                {treino.training_blocks?.length || 0} blocos de treino
              </Typography>
            </Box>
          </Stack>
          
          {treino.description && (
            <Box 
              sx={{ 
                mt: 2,
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 1.5,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <InfoIcon sx={{ fontSize: '1rem', mt: 0.2 }} />
                <Typography variant="body2" fontSize="0.875rem" sx={{ flex: 1 }}>
                  {treino.description}
                </Typography>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Grid de Blocos */}
        <Grid container spacing={2.5}>
          {treino.training_blocks?.map((block, blockIndex) => {
            const blockInfo = getBlockInfo(block.block_type)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={blockIndex}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  {/* Cabeçalho do Card - Sem Background */}
                  <Box 
                    sx={{ 
                      p: 2,
                      pb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      borderBottom: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="600"
                        color="primary.main"
                        sx={{ 
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          lineHeight: 1.3
                        }}
                      >
                        {blockInfo.title}
                      </Typography>
                    </Box>
                    <Chip 
                      label={block.exercise_prescriptions?.length || 0}
                      size="small"
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        minWidth: 28,
                        height: 26,
                        fontSize: '0.813rem'
                      }}
                    />
                  </Box>

                  {/* Conteúdo do Card */}
                  <CardContent sx={{ p: 2, flexGrow: 1 }}>
                    {block.exercise_prescriptions?.length > 0 ? (
                      <Stack direction="column" spacing={2}>
                        {block.exercise_prescriptions.map((prescription, exerciseIndex) => {
                          const protocol = formatExerciseProtocol(prescription)
                          
                          return (
                            <Box key={exerciseIndex}>
                              {/* Nome do Exercício */}
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="600"
                                color="text.primary"
                                sx={{ 
                                  mb: 0.5,
                                  fontSize: '0.875rem',
                                  lineHeight: 1.4
                                }}
                              >
                                {exerciseIndex + 1}. {prescription.exercise?.name}
                              </Typography>
                              
                              {/* Instruções do Exercício */}
                              {prescription.exercise?.instructions && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    display: 'block',
                                    mb: 1,
                                    fontSize: '0.75rem',
                                    lineHeight: 1.5,
                                    fontStyle: 'italic'
                                  }}
                                >
                                  {prescription.exercise.instructions}
                                </Typography>
                              )}
                              
                              {/* Protocolo */}
                              {protocol.length > 0 && (
                                <Box 
                                  sx={{ 
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                    mb: 1
                                  }}
                                >
                                  {protocol.map((item, idx) => (
                                    <Chip
                                      key={idx}
                                      icon={item.icon}
                                      label={item.text}
                                      size="small"
                                      color={item.color}
                                      sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': {
                                          fontSize: '0.9rem'
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              {/* Observações */}
                              {prescription.notes && (
                                <Alert 
                                  severity="info" 
                                  icon={<InfoIcon sx={{ fontSize: '0.95rem' }} />}
                                  sx={{ 
                                    py: 0.5,
                                    px: 1,
                                    fontSize: '0.75rem',
                                    '& .MuiAlert-message': {
                                      padding: '2px 0',
                                      fontSize: '0.75rem'
                                    }
                                  }}
                                >
                                  {prescription.notes}
                                </Alert>
                              )}
                              
                              {/* Divider entre exercícios (exceto último) */}
                              {exerciseIndex < block.exercise_prescriptions.length - 1 && (
                                <Divider sx={{ mt: 2 }} />
                              )}
                            </Box>
                          )
                        })}
                      </Stack>
                    ) : (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        fontStyle="italic"
                        textAlign="center"
                        sx={{ py: 2, fontSize: '0.875rem' }}
                      >
                        Nenhum exercício definido
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Footer */}
        <Paper 
          elevation={0}
          sx={{ 
            mt: 3, 
            p: 2.5, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant="body2" 
            color="text.primary"
            fontWeight="500"
            sx={{ mb: 0.5, fontSize: '0.875rem' }}
          >
            Este treino foi compartilhado pelo seu personal trainer
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            Para dúvidas sobre os exercícios, entre em contato com seu profissional
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default TreinoPublico
