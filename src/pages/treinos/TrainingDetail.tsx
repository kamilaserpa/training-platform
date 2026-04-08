import {
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logoImage from '../../assets/images/logo-main.png'
import { TrainingView } from '../../components/training/TrainingView'
import { signedUrlCache } from '../../services/privateVideoStorage'
import { trainingService } from '../../services/trainingService'
import type { Training } from '../../types/database.types'
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
        <Box sx={{ position: 'relative' }}>
            {/* Botão de exportar PDF fixo no topo */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 80,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <Tooltip title="Exportar treino em PDF">
                    <Button
                        onClick={handleExportPDF}
                        startIcon={<PdfIcon />}
                        variant="contained"
                        size="small"
                        color="secondary"
                    >
                        PDF
                    </Button>
                </Tooltip>
            </Box>

            {/* Componente de apresentação puro */}
            <TrainingView
                training={treino}
                videoUrls={videoUrls}
                expandedVideos={expandedVideos}
                onToggleVideo={toggleVideoExpanded}
                onEdit={handleEdit}
                showEditButton={true}
            />
        </Box>
    )
}

export default TrainingDetail
