import {
    AccessTime as AccessTimeIcon,
    Edit as EditIcon,
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
    Fab,
    Grid,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logoImage from '../../assets/images/logo-main.png'
import { ExerciseVideo } from '../../components/ExerciseVideo'
import { signedUrlCache } from '../../services/privateVideoStorage'
import { trainingService } from '../../services/trainingService'
import type { Training } from '../../types/database.types'
import { parseLocalDate } from '../../utils/date'
import { generateTreinoPDF } from '../../utils/pdf/generateTreinoPDF'
import { imageToBase64 } from '../../utils/pdf/pdfUtils'

const TrainingDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [treino, setTreino] = useState<Training | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})
    const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({})

    const theme = useTheme()

    const toggleVideoExpanded = (exerciseId: string) => {
        setExpandedVideos(prev => ({
            ...prev,
            [exerciseId]: !prev[exerciseId]
        }))
    }

    useEffect(() => {
        const loadTraining = async () => {
            if (!id) {
                setError('ID do treino não fornecido')
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                // Carregar treino completo usando o service
                const trainingData = await trainingService.getTrainingById(id)

                if (!trainingData) {
                    setError('Treino não encontrado.')
                    return
                }

                setTreino(trainingData)

                // Carregar vídeos dos exercícios (de prescription.video)
                const urls: Record<string, string> = {}
                for (const block of trainingData.training_blocks || []) {
                    for (const prescription of block.exercise_prescriptions || []) {
                        const video = prescription.video
                        if (video?.storage_path) {
                            try {
                                console.log(`🎥 Carregando vídeo: ${video.title || video.id} - ${video.storage_path}`)
                                const url = await signedUrlCache.getOrCreate(video.storage_path)
                                // Usar exercise_id como chave
                                if (prescription.exercise_id) {
                                    urls[prescription.exercise_id] = url
                                }
                                console.log(`✅ Vídeo carregado: ${video.title}`)
                            } catch (error) {
                                console.error(`❌ Erro ao carregar vídeo ${video.title || video.id}:`, error)
                            }
                        }
                    }
                }
                setVideoUrls(urls)
            } catch (err) {
                console.error('Erro ao carregar treino:', err)
                setError('Não foi possível carregar o treino.')
            } finally {
                setLoading(false)
            }
        }

        loadTraining()
    }, [id])

    const formatDate = (dateString: string) => {
        return parseLocalDate(dateString).toLocaleDateString('pt-BR')
    }

    const formatDayOfWeek = (dateString: string) => {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
        return days[parseLocalDate(dateString).getDay()]
    }

    const handleExportPDF = async () => {
        if (!treino) return

        try {
            const logoBase64 = await imageToBase64(logoImage)
            await generateTreinoPDF(treino, logoBase64)
        } catch (error: any) {
            console.error('❌ Erro ao gerar PDF:', error)
            alert('Erro ao gerar PDF: ' + error.message)
        }
    }

    const handleEdit = () => {
        navigate(`/pages/treinos/${id}/editar`)
    }

    const getBlockInfo = (blockType: string) => {
        const blocks: Record<string, { title: string }> = {
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

    const formatExerciseProtocol = (prescription: any) => {
        const protocol = []

        // Séries e Repetições
        if (prescription.sets && prescription.reps) {
            protocol.push({
                icon: <RepeatIcon fontSize="small" />,
                text: `${prescription.sets} × ${prescription.reps}`,
                type: 'reps',
                color: 'primary' as const
            })
        } else if (prescription.sets) {
            protocol.push({
                icon: <RepeatIcon fontSize="small" />,
                text: `${prescription.sets} séries`,
                type: 'reps',
                color: 'primary' as const
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
                color: 'warning' as const
            })
        }

        // Descanso
        if (prescription.rest_seconds) {
            protocol.push({
                icon: <AccessTimeIcon fontSize="small" />,
                text: `${prescription.rest_seconds}s descanso`,
                type: 'rest',
                color: 'success' as const
            })
        }

        // Carga
        if (prescription.weight_kg) {
            protocol.push({
                icon: <FitnessCenterIcon fontSize="small" />,
                text: `${prescription.weight_kg}kg`,
                type: 'weight',
                color: 'error' as const
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

    if (error || !treino) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error || 'Treino não encontrado'}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/pages/treinos')}>
                    Voltar para listagem
                </Button>
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
                    {/* Botões de ação no canto superior direito */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: { xs: 12, sm: 16 },
                            right: { xs: 12, sm: 16 },
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        <Tooltip title="Exportar treino em PDF">
                            <Button
                                onClick={handleExportPDF}
                                startIcon={<PdfIcon />}
                                variant="contained"
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                PDF
                            </Button>
                        </Tooltip>
                    </Box>

                    <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{
                            mb: 1.5,
                            fontSize: { xs: '1.5rem', sm: '1.875rem' },
                            pr: { xs: 10, sm: 12 }
                        }}
                    >
                        {treino.name}
                    </Typography>

                    {/* Informações da Semana e Foco */}
                    {treino.training_week && (
                        <Box sx={{ mb: 2 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1, sm: 2 }}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                                <Chip
                                    label={`Semana ${treino.training_week.name}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                                {treino.training_week.week_focus && (
                                    <Chip
                                        label={treino.training_week.week_focus.name}
                                        size="small"
                                        sx={{
                                            bgcolor: treino.training_week.week_focus.color_hex || 'rgba(255, 255, 255, 0.2)',
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
                                {formatDate(treino.scheduled_date)} - {formatDayOfWeek(treino.scheduled_date)}
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
                                                            {prescription.exercise_id && videoUrls[prescription.exercise_id] && (
                                                                <Box sx={{ mb: 1, mt: 1 }}>
                                                                    <Button
                                                                        onClick={() => toggleVideoExpanded(prescription.exercise_id!)}
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

                {/* Footer com botão de editar */}
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
                        onClick={handleEdit}
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
                    onClick={handleEdit}
                >
                    <EditIcon />
                </Fab>
            </Container>
        </Box>
    )
}

export default TrainingDetail
