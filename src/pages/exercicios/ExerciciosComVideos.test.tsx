import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ExerciciosComVideos from './ExerciciosComVideos'
import { exerciseService } from '../../services/exerciseService'
import { movementPatternService } from '../../services/movementPatternService'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}))

vi.mock('../../components/PageHeader', () => ({
  default: ({ title, subtitle }: any) => (
    <div>
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
}))

vi.mock('../../components/exercicios/ExerciseWithVideoDialog', () => ({
  ExerciseWithVideoDialog: ({ open, editingExercise, mode }: any) => {
    if (!open) return null
    return (
      <div role="dialog" aria-label="ExerciseWithVideoDialog">
        <div>mode:{String(mode)}</div>
        <div>editing:{editingExercise?.name ?? ''}</div>
      </div>
    )
  },
}))

vi.mock('../../services/exerciseService', () => ({
  exerciseService: {
    getExercisesForMediaListCreatedByUser: vi.fn(),
    getExercisesForMediaListCreatedByOwnersExceptUser: vi.fn(),
    getExerciseById: vi.fn(),
    deleteExercise: vi.fn(),
  },
}))

vi.mock('../../services/movementPatternService', () => ({
  movementPatternService: {
    getAllMovementPatterns: vi.fn(),
  },
}))

describe('ExerciciosComVideos', () => {
  const exerciseServiceMock = vi.mocked(exerciseService)
  const movementPatternServiceMock = vi.mocked(movementPatternService)

  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('carrega e exibe exercícios (lista enxuta)', async () => {
    movementPatternServiceMock.getAllMovementPatterns.mockResolvedValue([])

    exerciseServiceMock.getExercisesForMediaListCreatedByUser.mockResolvedValue([
      {
        id: 'ex-1',
        name: 'Agachamento Livre',
        tags: ['forca'],
        video_id: null,
        created_by: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        movement_pattern: { name: 'Agachar' },
        video: null,
      },
      {
        id: 'ex-2',
        name: 'Supino Reto',
        tags: [],
        video_id: null,
        created_by: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        movement_pattern: null,
        video: null,
      },
    ] as any)

    render(<ExerciciosComVideos />)

    expect(screen.getByText(/Carregando exercícios/i)).toBeInTheDocument()

    expect(await screen.findByText('Agachamento Livre')).toBeInTheDocument()
    expect(screen.getByText('Supino Reto')).toBeInTheDocument()

    expect(exerciseServiceMock.getExercisesForMediaListCreatedByUser).toHaveBeenCalledWith('user-1')
  })

  it('faz retry com backoff e mostra "Conectando..." em timeout transitório', async () => {
    vi.useFakeTimers()
    try {
      movementPatternServiceMock.getAllMovementPatterns.mockResolvedValue([])

      const timeoutErr1 = new Error('Tempo esgotado (obtendo sessão). Verifique sua conexão e tente novamente.')
      ;(timeoutErr1 as any).name = 'TimeoutError'
      const timeoutErr2 = new Error('Tempo esgotado (obtendo sessão). Verifique sua conexão e tente novamente.')
      ;(timeoutErr2 as any).name = 'TimeoutError'

      exerciseServiceMock.getExercisesForMediaListCreatedByUser
        .mockRejectedValueOnce(timeoutErr1)
        .mockRejectedValueOnce(timeoutErr2)
        .mockResolvedValueOnce([
          {
            id: 'ex-1',
            name: 'Agachamento Livre',
            tags: [],
            video_id: null,
            created_by: 'user-1',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            movement_pattern: null,
            video: null,
          },
        ] as any)

      render(<ExerciciosComVideos />)

      // Let the first rejection happen
      await act(async () => {
        await Promise.resolve()
      })

      // 1s -> attempt 1
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })
      expect(screen.getByText('Conectando...')).toBeInTheDocument()

      // 2s -> attempt 2
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000)
      })

      // Let attempt 2 resolve and React commit.
      await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(exerciseServiceMock.getExercisesForMediaListCreatedByUser).toHaveBeenCalledTimes(3)
      expect(screen.getByText('Agachamento Livre')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('ao clicar em "Editar", busca o exercício completo antes de abrir o dialog', async () => {
    movementPatternServiceMock.getAllMovementPatterns.mockResolvedValue([])

    exerciseServiceMock.getExercisesForMediaListCreatedByUser.mockResolvedValue([
      {
        id: 'ex-1',
        name: 'Agachamento Livre',
        tags: [],
        video_id: null,
        created_by: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        movement_pattern: { name: 'Agachar' },
        video: null,
      },
    ] as any)

    exerciseServiceMock.getExerciseById.mockResolvedValue({
      id: 'ex-1',
      name: 'Agachamento Livre',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      created_by: 'user-1',
      movement_pattern_id: null,
      video_id: null,
      movement_pattern: { id: 'mp-1', name: 'Agachar', created_at: 'x', updated_at: 'x' },
      video: null,
      tags: [],
    } as any)

    const user = userEvent.setup()
    render(<ExerciciosComVideos />)

    expect(await screen.findByText('Agachamento Livre')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Editar/i }))

    expect(exerciseServiceMock.getExerciseById).toHaveBeenCalledWith('ex-1')
    expect(await screen.findByRole('dialog', { name: /ExerciseWithVideoDialog/i })).toBeInTheDocument()
    expect(screen.getByText('editing:Agachamento Livre')).toBeInTheDocument()
  })
})

