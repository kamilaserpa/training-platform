import {
  Edit as EditIcon,
  EventAvailable as EventAvailableIcon,
  ExpandMore as ExpandMoreIcon,
  FitnessCenter as FitnessCenterIcon,
  Info as InfoIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Divider,
  Fab,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import type { Training } from '../../types/database.types'
import {
  formatDate,
  formatDayOfWeek,
  formatExerciseProtocol,
  getBlockInfo,
} from '../../utils/trainingFormatters'
import { ExerciseVideo } from '../ExerciseVideo'

export interface TrainingViewProps {
  training: Training
  videoUrls?: Record<string, string>
  expandedVideos?: Record<string, boolean>
  onToggleVideo?: (exerciseId: string) => void
  onEdit?: () => void
  showEditButton?: boolean
}

/**
 * Componente de apresentação puro para exibir detalhes de um treino.
 * Não gerencia estado nem faz fetch de dados - apenas renderiza.
 */
export const TrainingView = ({
  training,
  videoUrls = {},
  expandedVideos = {},
  onToggleVideo,
  onEdit,
  showEditButton = false,
}: TrainingViewProps) => {
  const theme = useTheme()

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
          <Typography
            variant="h4"
            fontWeight="600"
            sx={{
              mb: 1.5,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              pr: { xs: 10, sm: 12 }
            }}
          >
            {training.name}
          </Typography>

          {/* Informações da Semana e Foco */}
          {training.training_week && (
            <Box sx={{ mb: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Chip
                  label={`Semana ${training.training_week.name}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                {training.training_week.week_focus && (
                  <Chip
                    label={training.training_week.week_focus.name}
                    size="small"
                    sx={{
                      bgcolor: training.training_week.week_focus.color_hex || 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 2.5 }}
            sx={{ opacity: 0.95 }}
          >
            <Box display="flex" alignItems="center" gap={0.75}>
              <EventAvailableIcon sx={{ fontSize: '1.125rem' }} />
              <Typography variant="body2" fontSize="0.875rem">
                {formatDate(training.scheduled_date)} - {formatDayOfWeek(training.scheduled_date)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.75}>
              <FitnessCenterIcon sx={{ fontSize: '1.125rem' }} />
              <Typography variant="body2" fontSize="0.875rem">
                {training.training_blocks?.length || 0} blocos de treino
              </Typography>
            </Box>
          </Stack>

          {training.description && (
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
                  {training.description}
                </Typography>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Grid de Blocos */}
        <Grid container spacing={2.5}>
          {training.training_blocks?.map((block, blockIndex) => {
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
                  {/* Cabeçalho do Card */}
                  <Box
                    sx={{
                      p: 2,
                      pb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      borderBottom: '2px solid',
                      borderColor: 'divider'
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
                    {block.exercise_prescriptions && block.exercise_prescriptions.length > 0 ? (
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
                              {prescription.exercise_id && videoUrls[prescription.exercise_id] && onToggleVideo && (
                                <Box sx={{ mb: 1, mt: 1 }}>
                                  <Button
                                    onClick={() => onToggleVideo(prescription.exercise_id!)}
                                    size="small"
                                    startIcon={<PlayCircleOutlineIcon />}
                                    endIcon={
                                      <ExpandMoreIcon
                                        sx={{
                                          transform: expandedVideos[prescription.exercise_id!] ? 'rotate(180deg)' : 'rotate(0deg)',
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
                                    {expandedVideos[prescription.exercise_id!] ? 'Ocultar vídeo' : 'Ver demonstração em vídeo'}
                                  </Button>
                                  <Collapse in={expandedVideos[prescription.exercise_id!]}>
                                    <Box sx={{ mt: 1 }}>
                                      <ExerciseVideo
                                        videoUrl={videoUrls[prescription.exercise_id!]}
                                        alt={`Demonstração: ${prescription.exercise?.name}`}
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
                              {block.exercise_prescriptions && exerciseIndex < block.exercise_prescriptions.length - 1 && (
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

        {/* Footer com botão de editar (se habilitado) */}
        {showEditButton && onEdit && (
          <>
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
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<EditIcon />}
                onClick={onEdit}
                sx={{ mb: 2 }}
              >
                Editar Treino
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Para modificar os exercícios, blocos ou configurações do treino
              </Typography>
            </Paper>

            {/* Floating Action Button para mobile - Editar */}
            <Fab
              color="primary"
              aria-label="edit"
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                display: { xs: 'flex', md: 'none' },
              }}
              onClick={onEdit}
            >
              <EditIcon />
            </Fab>
          </>
        )}
      </Container>
    </Box>
  )
}
