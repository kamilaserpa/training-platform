import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Training } from '../../types/database.types'
import { TrainingView } from './TrainingView'

// Mock do ExerciseVideo
vi.mock('../ExerciseVideo', () => ({
    ExerciseVideo: ({ videoUrl, alt }: { videoUrl: string; alt: string }) => (
        <div data-testid="exercise-video" data-url={videoUrl}>
            {alt}
        </div>
    )
}))

// Mock dos formatters
vi.mock('../../utils/trainingFormatters', () => ({
    formatDate: (date: string) => '15/03/2024',
    formatDayOfWeek: (date: string) => 'Sexta-feira',
    formatExerciseProtocol: () => [
        {
            icon: <span>icon</span>,
            text: '3 × 10',
            type: 'reps',
            color: 'primary'
        }
    ],
    getBlockInfo: (type: string) => ({ title: 'Treino Principal' })
}))

describe('TrainingView', () => {
    const mockTraining: Training = {
        id: '1',
        name: 'Treino de Peito',
        training_week_id: 'week-1',
        scheduled_date: '2024-03-15',
        share_status: 'private',
        created_by: 'user-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        description: 'Treino focado em peitoral',
        training_week: {
            id: 'week-1',
            name: '01',
            week_focus_id: 'focus-1',
            start_date: '2024-03-11',
            end_date: '2024-03-17',
            status: 'active',
            created_by: 'user-1',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            week_focus: {
                id: 'focus-1',
                name: 'Hipertrofia',
                color_hex: '#FF5722',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            }
        },
        training_blocks: [
            {
                id: 'block-1',
                training_id: '1',
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
                        reps: '10',
                        created_at: '2024-01-01',
                        updated_at: '2024-01-01',
                        exercise: {
                            id: 'exercise-1',
                            name: 'Supino Reto',
                            created_by: 'user-1',
                            created_at: '2024-01-01',
                            updated_at: '2024-01-01',
                            instructions: 'Manter a postura correta'
                        }
                    }
                ]
            }
        ]
    }

    it('renderiza o nome do treino', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText('Treino de Peito')).toBeInTheDocument()
    })

    it('renderiza informações da semana', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText('Semana 01')).toBeInTheDocument()
        expect(screen.getByText('Hipertrofia')).toBeInTheDocument()
    })

    it('renderiza descrição do treino', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText('Treino focado em peitoral')).toBeInTheDocument()
    })

    it('renderiza blocos de treino', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText('Treino Principal')).toBeInTheDocument()
    })

    it('renderiza exercícios do bloco', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText(/Supino Reto/)).toBeInTheDocument()
    })

    it('renderiza instruções do exercício', () => {
        render(<TrainingView training={mockTraining} />)
        expect(screen.getByText('Manter a postura correta')).toBeInTheDocument()
    })

    it('renderiza botão de editar quando showEditButton=true', () => {
        const handleEdit = vi.fn()
        render(
            <TrainingView
                training={mockTraining}
                showEditButton={true}
                onEdit={handleEdit}
            />
        )
        expect(screen.getByText('Editar Treino')).toBeInTheDocument()
    })

    it('não renderiza botão de editar quando showEditButton=false', () => {
        render(
            <TrainingView
                training={mockTraining}
                showEditButton={false}
            />
        )
        expect(screen.queryByText('Editar Treino')).not.toBeInTheDocument()
    })

    it('chama onEdit ao clicar no botão de editar', async () => {
        const user = userEvent.setup()
        const handleEdit = vi.fn()

        render(
            <TrainingView
                training={mockTraining}
                showEditButton={true}
                onEdit={handleEdit}
            />
        )

        const editButton = screen.getByText('Editar Treino')
        await user.click(editButton)

        expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it('renderiza vídeo quando videoUrl está disponível', () => {
        const videoUrls = {
            'exercise-1': 'https://example.com/video.mp4'
        }
        const handleToggleVideo = vi.fn()

        render(
            <TrainingView
                training={mockTraining}
                videoUrls={videoUrls}
                onToggleVideo={handleToggleVideo}
            />
        )

        expect(screen.getByText('Ver demonstração em vídeo')).toBeInTheDocument()
    })

    it('expande vídeo ao clicar no botão', async () => {
        const user = userEvent.setup()
        const handleToggleVideo = vi.fn()
        const videoUrls = {
            'exercise-1': 'https://example.com/video.mp4'
        }

        render(
            <TrainingView
                training={mockTraining}
                videoUrls={videoUrls}
                onToggleVideo={handleToggleVideo}
            />
        )

        const videoButton = screen.getByText('Ver demonstração em vídeo')
        await user.click(videoButton)

        expect(handleToggleVideo).toHaveBeenCalledWith('exercise-1')
    })

    it('mostra vídeo expandido quando expandedVideos contém o ID', () => {
        const videoUrls = {
            'exercise-1': 'https://example.com/video.mp4'
        }
        const expandedVideos = {
            'exercise-1': true
        }
        const handleToggleVideo = vi.fn()

        render(
            <TrainingView
                training={mockTraining}
                videoUrls={videoUrls}
                expandedVideos={expandedVideos}
                onToggleVideo={handleToggleVideo}
            />
        )

        expect(screen.getByTestId('exercise-video')).toBeInTheDocument()
        expect(screen.getByText('Ocultar vídeo')).toBeInTheDocument()
    })

    it('renderiza mensagem quando bloco não tem exercícios', () => {
        const trainingWithoutExercises: Training = {
            ...mockTraining,
            training_blocks: [
                {
                    id: 'block-1',
                    training_id: '1',
                    name: 'Bloco Vazio',
                    block_type: 'TREINO_PRINCIPAL',
                    order_index: 1,
                    rest_between_exercises_seconds: 60,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    exercise_prescriptions: []
                }
            ]
        }

        render(<TrainingView training={trainingWithoutExercises} />)
        expect(screen.getByText('Nenhum exercício definido')).toBeInTheDocument()
    })

    it('renderiza observações da prescrição', () => {
        const trainingWithNotes: Training = {
            ...mockTraining,
            training_blocks: [
                {
                    ...mockTraining.training_blocks![0],
                    exercise_prescriptions: [
                        {
                            ...mockTraining.training_blocks![0].exercise_prescriptions![0],
                            notes: 'Atenção à execução'
                        }
                    ]
                }
            ]
        }

        render(<TrainingView training={trainingWithNotes} />)
        expect(screen.getByText('Atenção à execução')).toBeInTheDocument()
    })

    it('renderiza múltiplos blocos corretamente', () => {
        const trainingWithMultipleBlocks: Training = {
            ...mockTraining,
            training_blocks: [
                mockTraining.training_blocks![0],
                {
                    id: 'block-2',
                    training_id: '1',
                    name: 'Bloco Secundário',
                    block_type: 'CONDICIONAMENTO_FISICO',
                    order_index: 2,
                    rest_between_exercises_seconds: 60,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    exercise_prescriptions: []
                }
            ]
        }

        render(<TrainingView training={trainingWithMultipleBlocks} />)

        const blockHeaders = screen.getAllByText('Treino Principal')
        expect(blockHeaders).toHaveLength(2)
    })

    it('não renderiza seção de semana quando training_week é null', () => {
        const trainingWithoutWeek: Training = {
            ...mockTraining,
            training_week: undefined
        }

        render(<TrainingView training={trainingWithoutWeek} />)
        expect(screen.queryByText(/Semana/)).not.toBeInTheDocument()
    })
})
