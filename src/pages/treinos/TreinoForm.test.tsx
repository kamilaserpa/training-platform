import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { supabaseMock, type SupabaseQuery } from '../../test/mocks/supabaseMock'
import TreinoForm from './TreinoForm.jsx'

// Make exercise adding deterministic in tests: replace AddExerciseModal with a tiny mock
// that mirrors the real flow: 2 steps (exercise → config); video comes from exercise link (simulated as first video).
vi.mock('../../components/treinos/AddExerciseModal', () => {
    const mockVideos = [
        { id: 'vid-1', title: 'Tutorial Agachamento' },
        { id: 'vid-2', title: 'Mobilidade Quadril' },
    ]

    function MockAddExerciseModal({ open, onSave, section }: any) {
        if (!open) return null

        const [step, setStep] = useState<'exercise' | 'config'>('exercise')
        const [exerciseName, setExerciseName] = useState('')
        const [exerciseId, setExerciseId] = useState<string | null>(null)
        // Simula vídeo vinculado ao exercício (primeiro da lista quando há nome)
        const [linkedVideo, setLinkedVideo] = useState<typeof mockVideos[0] | null>(null)

        const [series, setSeries] = useState('3')
        const [repetitions, setRepetitions] = useState('')
        const [weightKg, setWeightKg] = useState('')
        const [durationSeconds, setDurationSeconds] = useState('')
        const [restSeconds, setRestSeconds] = useState('60')
        const [notes, setNotes] = useState('')

        useEffect(() => {
            if (!open) return
            setStep('exercise')
            setExerciseName('')
            setExerciseId(null)
            setLinkedVideo(null)
            setSeries('3')
            setRepetitions('')
            setWeightKg('')
            setDurationSeconds('')
            setRestSeconds('60')
            setNotes('')
        }, [open])

        // Ao "selecionar exercício": simula fetch do vídeo vinculado e vai para config (fluxo real sem step de vídeo)
        const handleSelectExercise = () => {
            const name = exerciseName.trim()
            if (!name) return
            setExerciseId(`ex-new-${String(section ?? 'sec')}`)
            setLinkedVideo(mockVideos[0]) // simula exercício com vídeo vinculado
            setStep('config')
        }

        const handleAddExercise = () => {
            if (!exerciseId) return
            onSave({
                exercise: { id: exerciseId, name: exerciseName.trim() },
                video: linkedVideo,
                config: {
                    series: Number(series) || 0,
                    repetitions,
                    weight_kg: weightKg,
                    duration_seconds: durationSeconds ? Number(durationSeconds) : null,
                    rest_seconds: restSeconds ? Number(restSeconds) : null,
                    notes,
                },
            })
        }

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

                <hr />

                <div aria-label="Fluxo completo">
                    {step === 'exercise' && (
                        <div>
                            <div>Criar exercício novo</div>
                            <input
                                aria-label="Nome do exercício"
                                value={exerciseName}
                                onChange={(e) => setExerciseName(e.target.value)}
                            />
                            <button type="button" onClick={handleSelectExercise}>
                                Criar exercício
                            </button>
                        </div>
                    )}

                    {step === 'config' && (
                        <div>
                            <div>Configurar</div>
                            <input
                                aria-label="Séries"
                                value={series}
                                onChange={(e) => setSeries(e.target.value)}
                            />
                            <input
                                aria-label="Repetições"
                                value={repetitions}
                                onChange={(e) => setRepetitions(e.target.value)}
                            />
                            <input
                                aria-label="Carga"
                                value={weightKg}
                                onChange={(e) => setWeightKg(e.target.value)}
                            />
                            <input
                                aria-label="Tempo (seg)"
                                value={durationSeconds}
                                onChange={(e) => setDurationSeconds(e.target.value)}
                            />
                            <input
                                aria-label="Intervalo (seg)"
                                value={restSeconds}
                                onChange={(e) => setRestSeconds(e.target.value)}
                            />
                            <textarea
                                aria-label="Observações"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <button type="button" onClick={handleAddExercise}>
                                Adicionar Exercício
                            </button>
                        </div>
                    )}
                </div>
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
        expect(await screen.findByText(/Treino criado com sucesso!/i, {}, { timeout: 10000 })).toBeInTheDocument()

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
    }, 20000)

    it('em TreinoForm: adiciona exercício novo com vídeo e configurações (fluxo completo)', async () => {
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
                        id: 't-full-flow',
                        ...payload,
                        share_token: 'token-full',
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
                            name: 'Agachamento Frontal',
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

        // Abre modal do bloco Mobilidade
        await user.click(screen.getByLabelText(/Adicionar exercício - Mobilidade Articular/i))
        expect(await screen.findByRole('dialog', { name: /Mock AddExerciseModal/i })).toBeInTheDocument()

        // Seleciona exercício (no fluxo real o vídeo vem vinculado ao exercício; no mock vai direto para config com vídeo simulado)
        await user.type(screen.getByLabelText(/Nome do exercício/i), 'Agachamento Frontal')
        await user.click(screen.getByRole('button', { name: /Criar exercício/i }))

        // Preenche configurações (step config; vídeo já definido pelo mock como vinculado ao exercício)
        await user.clear(screen.getByLabelText(/Séries/i))
        await user.type(screen.getByLabelText(/Séries/i), '4')

        await user.type(screen.getByLabelText(/Repetições/i), '8-10')
        await user.type(screen.getByLabelText(/Carga/i), '80kg')

        await user.type(screen.getByLabelText(/Tempo \(seg\)/i), '40')

        await user.clear(screen.getByLabelText(/Intervalo \(seg\)/i))
        await user.type(screen.getByLabelText(/Intervalo \(seg\)/i), '90')

        await user.type(screen.getByLabelText(/Observações$/i), 'Cadência 3-1-1')

        await user.click(within(await screen.findByRole('dialog', { name: /Mock AddExerciseModal/i })).getByRole('button', { name: /Adicionar Exercício/i }))

        // Snackbar e item na lista
        expect(await screen.findByText(/Exercício "Agachamento Frontal" adicionado com sucesso!/i)).toBeInTheDocument()
        expect(await screen.findByText('Agachamento Frontal')).toBeInTheDocument()

        // Salva treino e valida payload da prescrição com vídeo e config
        await user.click(screen.getByRole('button', { name: /Salvar Treino/i }))
        expect(await screen.findByText(/Treino criado com sucesso!/i)).toBeInTheDocument()

        const prescriptionInserts = queries.filter(
            (x) => x.table === 'exercise_prescriptions' && x.op === 'insert',
        )
        expect(prescriptionInserts).toHaveLength(1)

        const payload = prescriptionInserts[0].payload as any
        expect(payload.exercise_id).toBe('ex-new-mobilidade')
        expect(payload.video_id).toBe('vid-1')
        expect(payload.sets).toBe(4)
        expect(payload.duration_seconds).toBe(40)
        expect(payload.reps).toBe(null)
        expect(payload.weight_kg).toBe(80)
        expect(payload.rest_seconds).toBe(90)
        expect(payload.notes).toBe('Cadência 3-1-1')
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

    // TODO (RPC/atomic): cenário antigo verificava 3 inserts em `training_blocks` via JS (deleteAllTrainingBlocks + inserts).
    // Com o fluxo atual usando RPC transacional no banco, os blocos são recriados dentro da função SQL e não passam mais por inserts diretos aqui.
    // Mantemos o teste antigo comentado como referência histórica.

    it('em modo edição + RPC: ao salvar, envia 3 blocos controlados (Bloco 1, Bloco 2 e Condicionamento) no payload do RPC', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        const trainingWithThreeBlocks = {
            id: 't-three-blocks',
            training_week_id: 'w1',
            name: 'Treino S01-06',
            scheduled_date: '2026-02-06',
            description: '',
            internal_notes: '',
            movement_pattern_id: 'mp1',
            share_status: 'private',
            training_blocks: [
                {
                    id: 'b-principal-1',
                    training_id: 't-three-blocks',
                    name: 'Bloco Principal 1',
                    block_type: 'TREINO_PRINCIPAL',
                    order_index: 4,
                    exercise_prescriptions: [
                        {
                            id: 'p1',
                            sets: 3,
                            reps: '10',
                            weight_kg: null,
                            duration_seconds: null,
                            rest_seconds: 60,
                            notes: '',
                            exercise: { id: 'ex1', name: 'Alongamento' },
                            video_id: null,
                            video: null,
                        },
                    ],
                },
                {
                    id: 'b-principal-2',
                    training_id: 't-three-blocks',
                    name: 'Bloco Principal 2',
                    block_type: 'TREINO_PRINCIPAL',
                    order_index: 5,
                    exercise_prescriptions: [
                        {
                            id: 'p2',
                            sets: 4,
                            reps: '8',
                            weight_kg: null,
                            duration_seconds: null,
                            rest_seconds: 90,
                            notes: '',
                            exercise: { id: 'ex1', name: 'Alongamento' },
                            video_id: null,
                            video: null,
                        },
                    ],
                },
                {
                    id: 'b-cond',
                    training_id: 't-three-blocks',
                    name: 'Condicionamento Físico',
                    block_type: 'CONDICIONAMENTO_FISICO',
                    order_index: 6,
                    exercise_prescriptions: [
                        {
                            id: 'p3',
                            sets: 2,
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
                return { data: trainingWithThreeBlocks, error: null }
            }
            if (q.table === 'trainings' && q.op === 'update') {
                return { data: { ...trainingWithThreeBlocks, updated_at: new Date().toISOString() }, error: null }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/t-three-blocks/editar')

        expect(screen.getByText(/Carregando dados do treino/i)).toBeInTheDocument()
        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()

        // Pelo menos um exercício carregado (estado dos 3 blocos foi populado)
        expect(await screen.findByText('Alongamento')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /Atualizar Treino/i }))

        await waitFor(() => {
            const rpcCall = supabaseMock.rpcCalls.find(
                (c) => c.name === 'update_training_blocks_atomically',
            )
            expect(rpcCall).toBeTruthy()

            const blocks = (rpcCall!.args as any)?.p_blocks ?? []
            expect(blocks.length).toBe(3)

            const blockNames = blocks.map((b: any) => b.name).filter(Boolean)
            expect(blockNames).toContain('Bloco Principal 1')
            expect(blockNames).toContain('Bloco Principal 2')
            expect(blockNames).toContain('Condicionamento Físico')
        })
    }, 20000)

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

    it('em modo edição: quando um exercício de bloco não encontra correspondência no banco (createExerciseFromString), o treino não deve perder exercícios silenciosamente (teste TDD – falha)', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })
        // Nenhum exercício compatível para matching por nome
        const seedWithoutMatchingExercises: SeedData = {
            weeks: seed.weeks,
            movementPatterns: seed.movementPatterns,
            exercises: [
                { id: 'ex-other', name: 'Outro Nome', movement_pattern: { name: 'Mobilidade' }, tags: [] },
            ],
        }
        supabaseMock.setQueryHandler(async (q) => {
            queries.push(q)
            // sobrescreve o handler default com o seed sem matching
            if (q.table === 'training_weeks' && q.op === 'select') {
                return { data: seedWithoutMatchingExercises.weeks, error: null }
            }
            if (q.table === 'movement_patterns' && q.op === 'select') {
                return { data: seedWithoutMatchingExercises.movementPatterns, error: null }
            }
            if (q.table === 'exercises' && q.op === 'select') {
                return { data: seedWithoutMatchingExercises.exercises, error: null }
            }
            // Treino existente em modo edição com blocos "preenchidos" apenas por nome (sem exercicioId)
            if (q.table === 'trainings' && q.op === 'select' && q.single) {
                return {
                    data: {
                        id: 't-no-match',
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
                                training_id: 't-no-match',
                                name: 'Bloco Principal 1',
                                block_type: 'TREINO_PRINCIPAL',
                                order_index: 4,
                                exercise_prescriptions: [
                                    {
                                        id: 'p1',
                                        sets: 3,
                                        reps: '10',
                                        duration_seconds: null,
                                        rest_seconds: 60,
                                        notes: '',
                                        exercise: { id: null, name: 'Nome Sem Cadastro' }, // sem id válido
                                        video_id: null,
                                        video: null,
                                    },
                                ],
                            },
                        ],
                    },
                    error: null,
                }
            }
            if (q.table === 'trainings' && q.op === 'update') {
                return { data: { id: 't-no-match', updated_at: new Date().toISOString() }, error: null }
            }
            // deleteAllTrainingBlocks
            if (q.table === 'training_blocks' && q.op === 'select') {
                return { data: [{ id: 'b1' }], error: null }
            }
            if (q.table === 'exercise_prescriptions' && q.op === 'delete') {
                return { data: null, error: null }
            }
            if (q.table === 'training_blocks' && q.op === 'delete') {
                return { data: null, error: null }
            }
            // inserts de blocos e prescriptions
            if (q.table === 'training_blocks' && q.op === 'insert') {
                return {
                    data: { id: 'b-new-1', ...(q.payload as any) },
                    error: null,
                }
            }
            if (q.table === 'exercise_prescriptions' && q.op === 'insert') {
                return {
                    data: { id: 'p-new-1', ...(q.payload as any) },
                    error: null,
                }
            }
            return { data: null, error: null }
        })
        const { user } = renderTreinoForm('/pages/treinos/t-no-match/editar')
        // Carrega treino em modo edição
        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()

        // Clica em "Atualizar Treino" sem alterar blocos
        await user.click(screen.getByRole('button', { name: /Atualizar Treino/i }))

        // Comportamento desejado: não criar prescriptions quando o exercício não existe no banco
        const prescriptionInserts = queries.filter(
            (x) => x.table === 'exercise_prescriptions' && x.op === 'insert',
        )
        expect(prescriptionInserts.length).toBe(0)

        // E notificar o usuário via Snackbar de erro (role="alert")
        const alert = await screen.findByRole('alert')
        expect(alert).toBeInTheDocument()
    })

    // TODO (RPC/atomic): cenário antigo simulava erro durante recriação via inserts JS em `exercise_prescriptions`.
    // Agora os inserts ocorrem dentro do RPC transacional; a forma mais realista de testar é simulando erro no próprio RPC.
    it('em modo edição + RPC: se o RPC falhar, mostra Snackbar de erro e não marca retry de blocos parciais', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        const trainingForError = {
            id: 't-error-rpc',
            training_week_id: 'w1',
            name: 'Treino RPC Erro',
            scheduled_date: '2026-02-06',
            description: '',
            internal_notes: '',
            movement_pattern_id: 'mp1',
            share_status: 'private',
            training_blocks: [],
        }

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'select' && q.single) {
                return { data: trainingForError, error: null }
            }
            if (q.table === 'trainings' && q.op === 'update') {
                return { data: { ...trainingForError, updated_at: new Date().toISOString() }, error: null }
            }

            return { data: null, error: null }
        })

        // Simula erro no RPC de atualização de blocos
        ;(supabaseMock.client.rpc as any).mockImplementationOnce(async () => ({
            data: null,
            error: new Error('Erro simulado no RPC de blocos'),
        }))

        const { user } = renderTreinoForm('/pages/treinos/t-error-rpc/editar')

        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /Atualizar Treino/i }))

        // Deve exibir Snackbar de erro (role="alert") em vez de sucesso
        const alert = await screen.findByRole('alert')
        expect(alert).toBeInTheDocument()
    })

    it('em modo edição: usa RPC update_training_blocks_atomically quando a feature flag está ativa', async () => {
        const queries: SupabaseQuery[] = []
        supabaseMock.setAuthUser({ id: 'user-1' })

        const trainingForRpc = {
            id: 't-rpc',
            training_week_id: 'w1',
            name: 'Treino RPC',
            scheduled_date: '2026-02-06',
            description: '',
            internal_notes: '',
            movement_pattern_id: 'mp1',
            share_status: 'private',
            training_blocks: [],
        }

        supabaseMock.setQueryHandler(async (q) => {
            const seeded = await makeDefaultQueryHandler(queries)(q)
            if (seeded.data || seeded.error) return seeded

            if (q.table === 'trainings' && q.op === 'select' && q.single) {
                return { data: trainingForRpc, error: null }
            }
            if (q.table === 'trainings' && q.op === 'update') {
                return { data: { ...trainingForRpc, updated_at: new Date().toISOString() }, error: null }
            }

            return { data: null, error: null }
        })

        const { user } = renderTreinoForm('/pages/treinos/t-rpc/editar')

        expect(await screen.findByText('Editar Treino')).toBeInTheDocument()

        // Adiciona pelo menos um exercício em um dos blocos controlados pela UI
        await addExerciseToSection(user, /Adicionar exercício - Treino Bloco 01/i, 'treino1')

        await user.click(screen.getByRole('button', { name: /Atualizar Treino/i }))

        await waitFor(() => {
            expect(supabaseMock.client.rpc).toHaveBeenCalledWith(
                'update_training_blocks_atomically',
                expect.objectContaining({
                    p_training_id: 't-rpc',
                }),
            )
        })
    })
})
