import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signedUrlCache } from '../../services/privateVideoStorage'
import { trainingService } from '../../services/trainingService'
import type { Training } from '../../types/database.types'
import TrainingDetail from './TrainingDetail'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useParams: () => ({ id: 'training-123' }),
    useNavigate: () => mockNavigate,
}))

// Mock do TrainingView
vi.mock('../../components/training/TrainingView', () => ({
    TrainingView: ({ training, onEdit, showEditButton }: any) => (
        <div data-testid="training-view">
            <h1>{training.name}</h1>
            {showEditButton && (
                <button onClick={onEdit}>Editar Treino</button>
            )}
        </div>
    )
}))

// Mock dos services
vi.mock('../../services/trainingService', () => ({
    trainingService: {
        getTrainingById: vi.fn()
    }
}))

vi.mock('../../services/privateVideoStorage', () => ({
    signedUrlCache: {
        getOrCreate: vi.fn()
    }
}))

// Mock dos utils
vi.mock('../../utils/pdf/generateTreinoPDF', () => ({
    generateTreinoPDF: vi.fn()
}))

vi.mock('../../utils/pdf/pdfUtils', () => ({
    imageToBase64: vi.fn().mockResolvedValue('base64-image')
}))

describe('TrainingDetail', () => {
    const mockTraining: Training = {
        id: 'training-123',
        name: 'Treino de Teste',
        training_week_id: 'week-1',
        scheduled_date: '2024-03-15',
        share_status: 'private',
        created_by: 'user-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        training_blocks: [
            {
                id: 'block-1',
                training_id: 'training-123',
                name: 'Bloco Principal',
                block_type: 'TREINO_PRINCIPAL',
                order_index: 1,
                rest_between_exercises_seconds: 60,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                exercise_prescriptions: [
                    {
                        id: 'prescription-1',
                        training_block_id: 'block-1',
                        exercise_id: 'exercise-1',
                        order_index: 1,
                        sets: 3,
                        created_at: '2024-01-01',
                        updated_at: '2024-01-01',
                        video: {
                            id: 'video-1',
                            title: 'Vídeo Demonstrativo',
                            storage_path: 'videos/demo.mp4',
                            level: 'intermediate',
                            plane: 'frontal',
                            type: 'demo',
                            genre: 'strength',
                            tags: [],
                            source: 'platform',
                            created_by: 'user-1',
                            created_at: '2024-01-01',
                            updated_at: '2024-01-01'
                        }
                    }
                ]
            }
        ]
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('mostra loading enquanto carrega dados', () => {
        vi.mocked(trainingService.getTrainingById).mockImplementation(
            () => new Promise(() => { }) // Promise que nunca resolve
        )

        render(<TrainingDetail />)

        expect(screen.getByText('Carregando treino...')).toBeInTheDocument()
    })

    it('carrega e exibe treino com sucesso', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)
        vi.mocked(signedUrlCache.getOrCreate).mockResolvedValue('https://video-url.com/demo.mp4')

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByTestId('training-view')).toBeInTheDocument()
        })

        expect(screen.getByText('Treino de Teste')).toBeInTheDocument()
        expect(trainingService.getTrainingById).toHaveBeenCalledWith('training-123')
    })

    it('carrega URLs de vídeos dos exercícios', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)
        vi.mocked(signedUrlCache.getOrCreate).mockResolvedValue('https://video-url.com/demo.mp4')

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(signedUrlCache.getOrCreate).toHaveBeenCalledWith('videos/demo.mp4')
        })
    })

    it('mostra erro quando treino não é encontrado', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(null)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByText('Treino não encontrado.')).toBeInTheDocument()
        })

        expect(screen.getByText('Voltar para listagem')).toBeInTheDocument()
    })

    it('mostra erro quando falha ao carregar', async () => {
        vi.mocked(trainingService.getTrainingById).mockRejectedValue(
            new Error('Erro de rede')
        )

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByText('Não foi possível carregar o treino.')).toBeInTheDocument()
        })
    })

    it('navega para listagem ao clicar em voltar', async () => {
        const user = userEvent.setup()
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(null)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByText('Voltar para listagem')).toBeInTheDocument()
        })

        const backButton = screen.getByText('Voltar para listagem')
        await user.click(backButton)

        expect(mockNavigate).toHaveBeenCalledWith('/pages/treinos')
    })

    it('navega para edição ao clicar em editar', async () => {
        const user = userEvent.setup()
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByText('Editar Treino')).toBeInTheDocument()
        })

        const editButton = screen.getByText('Editar Treino')
        await user.click(editButton)

        expect(mockNavigate).toHaveBeenCalledWith('/pages/treinos/training-123/editar')
    })

    it('passa showEditButton=true para TrainingView', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByTestId('training-view')).toBeInTheDocument()
        })

        expect(screen.getByText('Editar Treino')).toBeInTheDocument()
    })

    it('ignora vídeos sem storage_path', async () => {
        const trainingWithoutVideoPath: Training = {
            ...mockTraining,
            training_blocks: [
                {
                    ...mockTraining.training_blocks![0],
                    exercise_prescriptions: [
                        {
                            ...mockTraining.training_blocks![0].exercise_prescriptions![0],
                            video: {
                                id: 'video-1',
                                title: 'Vídeo sem path',
                                storage_path: '',
                                level: 'intermediate',
                                plane: 'frontal',
                                type: 'demo',
                                genre: 'strength',
                                tags: [],
                                source: 'platform',
                                created_by: 'user-1',
                                created_at: '2024-01-01',
                                updated_at: '2024-01-01'
                            }
                        }
                    ]
                }
            ]
        }

        vi.mocked(trainingService.getTrainingById).mockResolvedValue(trainingWithoutVideoPath)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByTestId('training-view')).toBeInTheDocument()
        })

        expect(signedUrlCache.getOrCreate).not.toHaveBeenCalled()
    })

    it('continua carregando mesmo com erro ao carregar vídeo', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)
        vi.mocked(signedUrlCache.getOrCreate).mockRejectedValue(
            new Error('Erro ao carregar vídeo')
        )

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByTestId('training-view')).toBeInTheDocument()
        })

        expect(screen.getByText('Treino de Teste')).toBeInTheDocument()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })

    it('mostra botão de exportar PDF', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByText('PDF')).toBeInTheDocument()
        })
    })

    it('loga carregamento de vídeos no console', async () => {
        vi.mocked(trainingService.getTrainingById).mockResolvedValue(mockTraining)
        vi.mocked(signedUrlCache.getOrCreate).mockResolvedValue('https://video-url.com/demo.mp4')

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        render(<TrainingDetail />)

        await waitFor(() => {
            expect(screen.getByTestId('training-view')).toBeInTheDocument()
        })

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('🎥 Carregando vídeo')
        )
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('✅ Vídeo carregado')
        )

        consoleSpy.mockRestore()
    })
})
