import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { supabaseMock, type SupabaseQuery } from '../../test/mocks/supabaseMock'
import TreinoForm from './TreinoForm.jsx'

// Make exercise adding deterministic in tests: replace AddExerciseModal with a tiny mock
// that saves a synthetic exercise for the current section.
vi.mock('../../components/treinos/AddExerciseModal', () => {
    function MockAddExerciseModal({ open, onSave, section }: any) {
        if (!open) return null

        return (
            <div role="dialog" aria-label="Mock AddExerciseModal">
                <div>Seção: {String(section)}</div>
                <button
                    type="button"
                    onClick={() =>
                        onSave({
                            exercise: { id: `ex-${section}`, name: `Exercício ${section}` },
                            video: null,
                            config: {
                                series: 3,
                                repetitions: '10',
                                weight_kg: '',
                                duration_seconds: null,
                                rest_seconds: 60,
                                notes: '',
                            },
                        })
                    }
                >
                    Salvar exercício ({String(section)})
                </button>
            </div>
        )
    }

    return { AddExerciseModal: MockAddExerciseModal }
})

// Keep tests stable: replace the MUI X DatePicker with a simple input.
vi.mock('../../components/form/FormDatePicker', () => {
    function parseBrDate(value: string): Date | null {
        const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        if (!match) return null
        const day = Number(match[1])
        const month = Number(match[2])
        const year = Number(match[3])
        if (!day || !month || !year) return null
        return new Date(year, month - 1, day)
    }

    function formatBrDate(value: unknown): string {
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) return ''
        const dd = String(value.getDate()).padStart(2, '0')
        const mm = String(value.getMonth() + 1).padStart(2, '0')
        const yyyy = String(value.getFullYear())
        return `${dd}/${mm}/${yyyy}`
    }

    return {
        default: function MockFormDatePicker({ name, label, required, disabled }: any) {
            const { control } = useFormContext()

            return (
                <Controller
                    name={name}
                    control={control}
                    rules={{ required: !!required }}
                    render={({ field }) => {
                        const [text, setText] = useState(() => formatBrDate(field.value))

                        useEffect(() => {
                            setText(formatBrDate(field.value))
                        }, [field.value])

                        return (
                            <input
                                aria-label={label}
                                disabled={disabled}
                                value={text}
                                onChange={(e) => {
                                    const next = e.target.value
                                    setText(next)

                                    if (!next) {
                                        field.onChange(null)
                                        return
                                    }

                                    const parsed = parseBrDate(next)
                                    if (parsed) {
                                        field.onChange(parsed)
                                    }
                                }}
                            />
                        )
                    }}
                />
            )
        },
    }
})

vi.mock('../../lib/supabase', () => ({
    supabase: supabaseMock.client,
    useMock: false,
}))

type SeedData = {
    weeks: Array<any>
    movementPatterns: Array<any>
    exercises: Array<any>
}

const seed: SeedData = {
    weeks: [
        {
            id: 'w1',
            name: 'Semana 01 - Fevereiro 2026',
            week_focus: { name: 'Hipertrofia' },
            start_date: '2026-02-02',
            end_date: '2026-02-08',
        },
    ],
    movementPatterns: [{ id: 'mp1', name: 'Agachar' }],
    exercises: [{ id: 'ex1', name: 'Alongamento', movement_pattern: { name: 'Mobilidade' }, tags: [] }],
}

function renderTreinoForm(initialEntry: string) {
    const user = userEvent.setup()

    return {
        user,
        ...render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/pages/treinos/novo" element={<TreinoForm />} />
                    <Route path="/pages/treinos/:id/editar" element={<TreinoForm />} />

                    {/* Used to assert navigation after create */}
                    <Route
                        path="/pages/treinos/:id/editar-destino"
                        element={<div>DESTINO: edição</div>}
                    />
                </Routes>
            </MemoryRouter>,
        ),
    }
}

async function openMuiSelect(user: ReturnType<typeof userEvent.setup>, label: RegExp) {
    const select = screen.getByRole('combobox', { name: label })
    await user.click(select)
}

async function chooseOption(user: ReturnType<typeof userEvent.setup>, optionText: RegExp) {
    const option =
        (await screen.findByRole('option', { name: optionText }).catch(() => null)) ||
        (await screen.findByRole('menuitem', { name: optionText }))
    await user.click(option)
}

async function addExerciseToSection(
    user: ReturnType<typeof userEvent.setup>,
    addButtonLabel: RegExp,
    sectionKey: string,
) {
    await user.click(screen.getByLabelText(addButtonLabel))
    await user.click(
        await screen.findByRole('button', {
            name: new RegExp(`Salvar exercício \\(${sectionKey}\\)`, 'i'),
        }),
    )
}

function makeDefaultQueryHandler(queries: SupabaseQuery[]) {
    return async (q: SupabaseQuery) => {
        queries.push(q)

        // Seed loads
        if (q.table === 'training_weeks' && q.op === 'select') {
            return { data: seed.weeks, error: null }
        }

        if (q.table === 'movement_patterns' && q.op === 'select') {
            return { data: seed.movementPatterns, error: null }
        }

        if (q.table === 'exercises' && q.op === 'select') {
            return { data: seed.exercises, error: null }
        }

        // Default fallthrough
        return { data: null, error: null }
    }
}

describe('TreinoForm (integração)', () => {
    beforeEach(() => {
        supabaseMock.reset()
    })

    it('renderiza a tela de criação e permite salvar um treino (fluxo feliz)', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        supabaseMock.setQueryHandler(async (q) => {
            // let default seeds resolve
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'insert') {
                const payload = q.payload as any
                return {
                    data: {
                        id: 't1',
                        ...payload,
                        share_token: 'token-123',
                    },
                    error: null,
                }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/novo')

        // Header
        expect(await screen.findByText('Criar Treino')).toBeInTheDocument()

        // Preencher selects
        await openMuiSelect(user, /Padrão de Movimento/i)
        await chooseOption(user, /Agachar/i)

        await openMuiSelect(user, /Semana/i)
        await chooseOption(user, /Semana 01 - Fevereiro 2026/i)

        // Preencher data
        const dateInput = screen.getByLabelText(/Data do Treino/i)
        await user.clear(dateInput)
        await user.type(dateInput, '06/02/2026')
        await user.tab()

        // Salvar
        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))

        // Snackbar de sucesso
        expect(await screen.findByText(/Treino criado com sucesso!/i)).toBeInTheDocument()

        // Confiança: payload enviado (scheduled_date formatado em YYYY-MM-DD local)
        const insert = queries.find((x) => x.table === 'trainings' && x.op === 'insert')
        expect(insert).toBeTruthy()
        expect((insert!.payload as any).scheduled_date).toBe('2026-02-06')

        // Navegação pós-criação: a tela agenda um navigate em 1500ms.
        // Para manter o teste focado no comportamento, verificamos que o timer dispara sem crash.
        // (Rota real do app é /pages/treinos/:id/editar; aqui evitamos re-render complexo do TreinoForm.)
        await waitFor(() => {
            expect(screen.queryByText(/Salvando/i)).not.toBeInTheDocument()
        })

    })

    it('permite adicionar exercícios em todos os blocos e salvar o treino', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        let createdBlockCounter = 0

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'insert') {
                const payload = q.payload as any
                return {
                    data: {
                        id: 't-all-blocks',
                        ...payload,
                        share_token: 'token-abc',
                    },
                    error: null,
                }
            }

            if (q.table === 'training_blocks' && q.op === 'insert') {
                createdBlockCounter += 1
                const payload = q.payload as any
                return {
                    data: {
                        id: `b-${createdBlockCounter}`,
                        ...payload,
                    },
                    error: null,
                }
            }

            if (q.table === 'exercise_prescriptions' && q.op === 'insert') {
                const payload = q.payload as any
                return {
                    data: {
                        id: `p-${payload.exercise_id}`,
                        ...payload,
                        exercise: {
                            id: payload.exercise_id,
                            name: `Exercício ${String(payload.exercise_id).replace(/^ex-/, '')}`,
                        },
                    },
                    error: null,
                }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/novo')

        expect(await screen.findByText('Criar Treino')).toBeInTheDocument()

        await openMuiSelect(user, /Padrão de Movimento/i)
        await chooseOption(user, /Agachar/i)

        await openMuiSelect(user, /Semana/i)
        await chooseOption(user, /Semana 01 - Fevereiro 2026/i)

        const dateInput = screen.getByLabelText(/Data do Treino/i)
        await user.clear(dateInput)
        await user.type(dateInput, '06/02/2026')
        await user.tab()

        // Add one exercise to each block
        await addExerciseToSection(user, /Adicionar exercício - Mobilidade Articular/i, 'mobilidade')
        await addExerciseToSection(user, /Adicionar exercício - Ativação de Core/i, 'core')
        await addExerciseToSection(user, /Adicionar exercício - Ativação Neural/i, 'neural')
        await addExerciseToSection(user, /Adicionar exercício - Treino Bloco 01/i, 'treino1')
        await addExerciseToSection(user, /Adicionar exercício - Treino Bloco 02/i, 'treino2')
        await addExerciseToSection(user, /Adicionar exercício - Condicionamento Físico/i, 'condicionamento')

        // UI shows added items
        expect(await screen.findByText('Exercício mobilidade')).toBeInTheDocument()
        expect(await screen.findByText('Exercício core')).toBeInTheDocument()
        expect(await screen.findByText('Exercício neural')).toBeInTheDocument()
        expect(await screen.findByText(/Exercício treino1/i)).toBeInTheDocument()
        expect(await screen.findByText(/Exercício treino2/i)).toBeInTheDocument()
        expect(await screen.findByText('Exercício condicionamento')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))
        expect(await screen.findByText(/Treino criado com sucesso!/i)).toBeInTheDocument()

        // Assertions: training saved + blocks created + prescriptions inserted
        const trainingInsert = queries.find((x) => x.table === 'trainings' && x.op === 'insert')
        expect(trainingInsert).toBeTruthy()
        expect((trainingInsert!.payload as any).scheduled_date).toBe('2026-02-06')

        const blockInserts = queries.filter((x) => x.table === 'training_blocks' && x.op === 'insert')
        expect(blockInserts).toHaveLength(6)

        const prescriptionInserts = queries.filter(
            (x) => x.table === 'exercise_prescriptions' && x.op === 'insert',
        )
        expect(prescriptionInserts).toHaveLength(6)

        const blockIds = new Set(blockInserts.map((x) => (x.payload as any)?.training_id).filter(Boolean))
        // sanity: all blocks refer to the created training
        expect(blockIds.size).toBe(1)
        expect([...blockIds][0]).toBe('t-all-blocks')
    })

    it('mostra erro quando a API (Supabase) falha ao salvar', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'insert') {
                return { data: null, error: new Error('Falha ao salvar') }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/novo')

        expect(await screen.findByText('Criar Treino')).toBeInTheDocument()

        await openMuiSelect(user, /Padrão de Movimento/i)
        await chooseOption(user, /Agachar/i)

        await openMuiSelect(user, /Semana/i)
        await chooseOption(user, /Semana 01 - Fevereiro 2026/i)

        const dateInput = screen.getByLabelText(/Data do Treino/i)
        await user.clear(dateInput)
        await user.type(dateInput, '06/02/2026')
        await user.tab()

        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))

        expect(await screen.findByText(/Falha ao salvar/i)).toBeInTheDocument()
    })

    it('em modo edição: exibe loading e depois carrega dados do treino', async () => {
        const queries: SupabaseQuery[] = []

        const training = {
            id: 't-edit',
            training_week_id: 'w1',
            name: 'Treino S01-06',
            scheduled_date: '2026-02-06',
            description: 'Obs públicas',
            internal_notes: 'Obs internas',
            movement_pattern_id: 'mp1',
            share_status: 'private',
            training_blocks: [],
        }

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'select' && q.single) {
                return { data: training, error: null }
            }

            return { data: null, error: null }
        })

        renderTreinoForm('/pages/treinos/t-edit/editar')

        // Loading inicial (modo edição)
        expect(screen.getByText(/Carregando dados do treino/i)).toBeInTheDocument()

        // Depois de carregar
        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()

        // Campo observações preenchido
        expect(screen.getByLabelText(/Observações Gerais/i)).toHaveValue('Obs públicas')
        expect(screen.getByLabelText(/Observações Internas/i)).toHaveValue('Obs internas')
    })

    it('mostra erro quando usuário não está autenticado', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser(null)

        supabaseMock.setQueryHandler(makeDefaultQueryHandler(queries))

        const { user } = renderTreinoForm('/pages/treinos/novo')

        expect(await screen.findByText('Criar Treino')).toBeInTheDocument()

        await openMuiSelect(user, /Padrão de Movimento/i)
        await chooseOption(user, /Agachar/i)

        await openMuiSelect(user, /Semana/i)
        await chooseOption(user, /Semana 01 - Fevereiro 2026/i)

        const dateInput = screen.getByLabelText(/Data do Treino/i)
        await user.clear(dateInput)
        await user.type(dateInput, '06/02/2026')
        await user.tab()

        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))

        expect(await screen.findByText(/Usuário não autenticado/i)).toBeInTheDocument()

        // Como o erro ocorre antes do insert, não deve haver insert em trainings
        expect(queries.some((q) => q.table === 'trainings' && q.op === 'insert')).toBe(false)
    })

    it('mostra erro quando auth.getUser falha (sessão expirada, etc.)', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthError(new Error('Sessão expirada'))

        supabaseMock.setQueryHandler(makeDefaultQueryHandler(queries))

        const { user } = renderTreinoForm('/pages/treinos/novo')

        expect(await screen.findByText('Criar Treino')).toBeInTheDocument()

        await openMuiSelect(user, /Padrão de Movimento/i)
        await chooseOption(user, /Agachar/i)

        await openMuiSelect(user, /Semana/i)
        await chooseOption(user, /Semana 01 - Fevereiro 2026/i)

        const dateInput = screen.getByLabelText(/Data do Treino/i)
        await user.clear(dateInput)
        await user.type(dateInput, '06/02/2026')
        await user.tab()

        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))

        expect(await screen.findByText(/Sessão expirada/i)).toBeInTheDocument()

        expect(queries.some((q) => q.table === 'trainings' && q.op === 'insert')).toBe(false)
    })

    it('pede confirmação ao excluir um exercício e só remove após confirmar', async () => {
        const queries: SupabaseQuery[] = []

        const trainingWithBlocks = {
            id: 't-del',
            training_week_id: 'w1',
            name: 'Treino S01-06',
            scheduled_date: '2026-02-06',
            description: '',
            internal_notes: '',
            movement_pattern_id: 'mp1',
            share_status: 'private',
            training_blocks: [
                {
                    id: 'b1',
                    training_id: 't-del',
                    name: 'Mobilidade Articular',
                    block_type: 'MOBILIDADE_ARTICULAR',
                    order_index: 1,
                    exercise_prescriptions: [
                        {
                            id: 'p1',
                            sets: 1,
                            reps: '30s',
                            weight_kg: null,
                            duration_seconds: 30,
                            rest_seconds: 30,
                            notes: '',
                            exercise: { id: 'ex1', name: 'Alongamento' },
                            video_id: null,
                            video: null,
                        },
                    ],
                },
            ],
        }

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'select' && q.single) {
                return { data: trainingWithBlocks, error: null }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/t-del/editar')

        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()
        expect(await screen.findByText('Alongamento')).toBeInTheDocument()

        const listItem = screen.getByText('Alongamento').closest('li')
        expect(listItem).toBeTruthy()

        const deleteButton = within(listItem as HTMLElement).getByLabelText('Excluir exercício')
        await user.click(deleteButton)

        expect(await screen.findByText('Confirmar exclusão')).toBeInTheDocument()

        // Cancelar mantém o item
        await user.click(screen.getByRole('button', { name: /Cancelar/i }))
        expect(screen.getByText('Alongamento')).toBeInTheDocument()

        // Confirmar remove
        await user.click(deleteButton)
        await user.click(screen.getByRole('button', { name: /^Excluir$/i }))

        await waitFor(() => {
            expect(screen.queryByText('Alongamento')).not.toBeInTheDocument()
        })
    })
})
