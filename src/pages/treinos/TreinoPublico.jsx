import {
  AccessTime as AccessTimeIcon,
  EventAvailable as EventAvailableIcon,
  ExpandMore as ExpandMoreIcon,
  FitnessCenter as FitnessCenterIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Repeat as RepeatIcon,
  Timer as TimerIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import logoImage from '../../assets/images/logo-main.png'
import { ExerciseVideo } from '../../components/ExerciseVideo'
import { signedUrlCache } from '../../services/privateVideoStorage'
import { trainingService } from '../../services/trainingService'
import { generateTreinoPDF } from '../../utils/pdf/generateTreinoPDF'
import { imageToBase64 } from '../../utils/pdf/pdfUtils'

const TreinoPublico = () => {
  const { token } = useParams()
  const [treino, setTreino] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState('') // 'not-found', 'disabled', 'expired', 'generic'
  const [videoUrls, setVideoUrls] = useState({})
  const [expandedVideos, setExpandedVideos] = useState({})

  // Hooks do MUI devem estar no topo, antes de qualquer return condicional
  const theme = useTheme()

  const toggleVideoExpanded = (exerciseId) => {
    setExpandedVideos(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }))
  }

  useEffect(() => {
    const loadPublicTraining = async () => {
      try {
        setLoading(true)

        // Carregar treino público usando o service
        const trainingData = await trainingService.getPublicTraining(token)

        if (!trainingData) {
          setError('Treino não encontrado ou link expirado.')
          setErrorType('not-found')
          return
        }

        // Verificar se o link está ativo (share_status deve ser 'public')
        if (trainingData.share_status !== 'public') {
          setError('Este link de compartilhamento foi desativado.')
          setErrorType('disabled')
          return
        }

        // Verificar se o link expirou
        if (trainingData.share_expires_at) {
          const expirationDate = new Date(trainingData.share_expires_at)
          if (expirationDate < new Date()) {
            setError('Este link de compartilhamento expirou.')
            setErrorType('expired')
            return
          }
        }

        setTreino(trainingData)

        // Carregar vídeos dos exercícios (agora vem de prescription.video)
        const urls = {}
        for (const block of trainingData.training_blocks || []) {
          for (const prescription of block.exercise_prescriptions || []) {
            const video = prescription.video
            if (video?.storage_path) {
              try {
                console.log(`🎥 Carregando vídeo: ${video.title || video.id} - ${video.storage_path}`)
                const url = await signedUrlCache.getOrCreate(video.storage_path)
                // Usar exercise_id como chave para manter compatibilidade com o resto do código
                urls[prescription.exercise_id] = url
                console.log(`✅ Vídeo carregado: ${video.title}`)
              } catch (error) {
                console.error(`❌ Erro ao carregar vídeo ${video.title || video.id}:`, error)
              }
            }
          }
        }
        setVideoUrls(urls)
      } catch (err) {
        console.error('Erro ao carregar treino público:', err)
        setError('Não foi possível carregar o treino. Verifique se o link está correto.')
        setErrorType('generic')
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

  const handleExportPDF = async () => {
    try {
      const logoBase64 = await imageToBase64(logoImage)
      await generateTreinoPDF(treino, logoBase64)
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF: ' + error.message)
    }
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

  // Componente para exibir tela de link indisponível
  const LinkUnavailableScreen = () => {
    const getErrorContent = () => {
      switch (errorType) {
        case 'disabled':
          return {
            title: '🔒 Link Desativado',
            message: 'Este link de compartilhamento foi desativado pelo profissional.',
            subtitle: 'Entre em contato com seu treinador para solicitar um novo link.',
            color: 'warning'
          }
        case 'expired':
          return {
            title: '⏰ Link Expirado',
            message: 'Este link de compartilhamento expirou.',
            subtitle: 'Solicite um novo link ao seu treinador para acessar o treino.',
            color: 'info'
          }
        case 'not-found':
          return {
            title: '🔍 Treino Não Encontrado',
            message: 'O treino solicitado não foi encontrado.',
            subtitle: 'Verifique se o link está correto ou entre em contato com seu treinador.',
            color: 'error'
          }
        default:
          return {
            title: '⚠️ Link Indisponível',
            message: 'Não foi possível acessar este treino.',
            subtitle: 'Verifique o link ou entre em contato com seu treinador.',
            color: 'error'
          }
      }
    }

    const content = getErrorContent()

    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Box
            sx={{
              mb: 3,
              fontSize: { xs: 80, md: 120 },
              lineHeight: 1
            }}
          >
            {content.title.split(' ')[0]}
          </Box>

          <Typography
            variant="h4"
            fontWeight="700"
            gutterBottom
            color="text.primary"
            sx={{ mb: 2 }}
          >
            {content.title.substring(content.title.indexOf(' ') + 1)}
          </Typography>

          <Alert
            severity={content.color}
            sx={{
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center'
              }
            }}
          >
            <Typography variant="body1" fontWeight="500">
              {content.message}
            </Typography>
          </Alert>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.6 }}
          >
            {content.subtitle}
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Stack spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              <strong>💡 Dica:</strong> Links de compartilhamento são controlados pelo seu
              profissional e podem ser ativados ou desativados a qualquer momento.
            </Typography>

            {errorType === 'not-found' && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  width: '100%'
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  Token: {token || 'não fornecido'}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Footer com informação da plataforma */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <img
            src={logoImage}
            alt="Training Platform"
            style={{
              height: 40,
              opacity: 0.6,
              marginBottom: 8
            }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Training Platform - Sistema de Gestão de Treinos
          </Typography>
        </Box>
      </Container>
    )
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

  // Se há erro, mostrar tela de link indisponível
  if (error) {
    return <LinkUnavailableScreen />
  }

  // Se não tem treino (mas não tem erro), mostrar mensagem genérica
  if (!treino) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          Carregando treino...
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
            borderRadius: 2,
            position: 'relative'
          }}
        >
          {/* Botão de Exportar PDF */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 16 },
              right: { xs: 12, sm: 16 }
            }}
          >
            <Tooltip title="Exportar treino em PDF">
              <IconButton
                onClick={handleExportPDF}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                  },
                  backdropFilter: 'blur(10px)',
                }}
              >
                <PdfIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            variant="h4"
            fontWeight="600"
            sx={{
              mb: 1.5,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              pr: { xs: 6, sm: 7 }
            }}
          >
            {treino.name}
          </Typography>


          {/* Nome do Profissional */}
          {treino.user && (
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 500,
                opacity: 0.9,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Treino criado por: <Box component="span" fontWeight="600">{treino.user.name}</Box>
            </Typography>
          )}

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

                              {/* Vídeo demonstrativo com Collapse */}
                              {videoUrls[prescription.exercise?.id] && (
                                <Box sx={{ mb: 1, mt: 1 }}>
                                  <Button
                                    onClick={() => toggleVideoExpanded(prescription.exercise.id)}
                                    size="small"
                                    startIcon={<PlayCircleOutlineIcon />}
                                    endIcon={
                                      <ExpandMoreIcon
                                        sx={{
                                          transform: expandedVideos[prescription.exercise.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.3s'
                                        }}
                                      />
                                    }
                                    sx={{
                                      textTransform: 'none',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                      color: 'primary.main',
                                      mb: 0.5
                                    }}
                                  >
                                    {expandedVideos[prescription.exercise.id] ? 'Ocultar vídeo' : 'Ver demonstração em vídeo'}
                                  </Button>
                                  <Collapse in={expandedVideos[prescription.exercise.id]}>
                                    <Box sx={{ mt: 1 }}>
                                      <ExerciseVideo
                                        videoUrl={videoUrls[prescription.exercise.id]}
                                        alt={`Demonstração: ${prescription.exercise.name}`}
                                      />
                                    </Box>
                                  </Collapse>
                                </Box>
                              )}

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
