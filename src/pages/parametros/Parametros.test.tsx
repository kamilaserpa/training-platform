import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { movementPatternService } from '../../services/movementPatternService'
import { weekService } from '../../services/weekService'
import Parametros from './Parametros'

vi.mock('../../components/DevModeAlert', () => ({
    DevModeAlert: () => null,
}))

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        clearSession: vi.fn(),
    }),
}))

vi.mock('../../services/movementPatternService', () => ({
    movementPatternService: {
        getAllMovementPatternsSummary: vi.fn(),
        createMovementPattern: vi.fn(),
        updateMovementPattern: vi.fn(),
        deleteMovementPattern: vi.fn(),
    },
}))

vi.mock('../../services/weekService', () => ({
    weekService: {
        getAllWeekFocusesSummary: vi.fn(),
        createWeekFocus: vi.fn(),
        updateWeekFocus: vi.fn(),
        deleteWeekFocus: vi.fn(),
    },
}))

describe('Parametros', () => {
    const movementPatternServiceMock = vi.mocked(movementPatternService)
    const weekServiceMock = vi.mocked(weekService)

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('carrega e exibe focos e padrões', async () => {
        movementPatternServiceMock.getAllMovementPatternsSummary.mockResolvedValue([
            { id: 'mp-1', name: 'Agachar', description: 'Movimento de agachamento' },
        ])
        weekServiceMock.getAllWeekFocusesSummary.mockResolvedValue([
            { id: 'wf-1', name: 'Hipertrofia 65%', description: 'Foco em hipertrofia', intensity_percentage: 65 },
        ])

        render(<Parametros />)

        expect(movementPatternServiceMock.getAllMovementPatternsSummary).toHaveBeenCalled()
        expect(weekServiceMock.getAllWeekFocusesSummary).toHaveBeenCalled()

        expect(await screen.findByText('Hipertrofia 65%')).toBeInTheDocument()
        expect(screen.getByText('Agachar')).toBeInTheDocument()
        expect(screen.getByText('65%')).toBeInTheDocument()
    })

    it('cria um novo padrão de movimento', async () => {
        const user = userEvent.setup()

        movementPatternServiceMock.getAllMovementPatternsSummary.mockResolvedValue([])
        weekServiceMock.getAllWeekFocusesSummary.mockResolvedValue([])
        movementPatternServiceMock.createMovementPattern.mockResolvedValue({
            id: 'mp-2',
            name: 'Empurrar Horizontal',
            description: 'Movimento de empurrar',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        } as any)

        render(<Parametros />)

        expect(await screen.findByText('Nenhum padrão de movimento cadastrado')).toBeInTheDocument()

        const novoPadraoButton = screen.getByRole('button', { name: /novo padrão/i })
        await waitFor(() => expect(novoPadraoButton).toBeEnabled())

        await user.click(novoPadraoButton)

        const dialog = await screen.findByRole('dialog', { name: /padrão de movimento/i })
        const dialogQueries = within(dialog)

        await user.type(
            dialogQueries.getByRole('textbox', { name: /nome do padrão/i }),
            'Empurrar Horizontal',
        )
        await user.type(dialogQueries.getByRole('textbox', { name: /descrição/i }), 'Movimento de empurrar')
        await user.click(screen.getByRole('button', { name: /salvar/i }))

        expect(movementPatternServiceMock.createMovementPattern).toHaveBeenCalledWith(
            'Empurrar Horizontal',
            'Movimento de empurrar',
        )

        expect(await screen.findByText('Empurrar Horizontal')).toBeInTheDocument()
    })

    it('exclui um foco da semana', async () => {
        const user = userEvent.setup()

        movementPatternServiceMock.getAllMovementPatternsSummary.mockResolvedValue([])
        weekServiceMock.getAllWeekFocusesSummary
            .mockResolvedValueOnce([
                { id: 'wf-1', name: 'Deload', description: 'Semana de recuperação', intensity_percentage: 40 },
            ])
            .mockResolvedValueOnce([])

        render(<Parametros />)

        const focoCell = await screen.findByText('Deload')
        const focoRow = focoCell.closest('tr')
        expect(focoRow).toBeTruthy()

        const deleteButton = within(focoRow as HTMLElement).getByLabelText('Excluir foco')
        await user.click(deleteButton)

        await user.click(screen.getByRole('button', { name: /excluir/i }))

        await waitFor(() => {
            expect(weekServiceMock.deleteWeekFocus).toHaveBeenCalledWith('wf-1')
        })

        expect(await screen.findByText(/excluído com sucesso/i)).toBeInTheDocument()
    })
})
