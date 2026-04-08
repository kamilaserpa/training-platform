import { describe, expect, it, vi } from 'vitest'
import {
    formatDate,
    formatDayOfWeek,
    formatExerciseProtocol,
    getBlockInfo,
} from './trainingFormatters'

// Mock do parseLocalDate
vi.mock('./date', () => ({
    parseLocalDate: (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number)
        return new Date(year, month - 1, day)
    }
}))

describe('trainingFormatters', () => {
    describe('getBlockInfo', () => {
        it('retorna informação correta para MOBILIDADE_ARTICULAR', () => {
            const result = getBlockInfo('MOBILIDADE_ARTICULAR')
            expect(result.title).toBe('Mobilidade Articular')
        })

        it('retorna informação correta para ATIVACAO_CORE', () => {
            const result = getBlockInfo('ATIVACAO_CORE')
            expect(result.title).toBe('Ativação de Core')
        })

        it('retorna informação correta para ATIVACAO_NEURAL', () => {
            const result = getBlockInfo('ATIVACAO_NEURAL')
            expect(result.title).toBe('Ativação Neural')
        })

        it('retorna informação correta para TREINO_PRINCIPAL', () => {
            const result = getBlockInfo('TREINO_PRINCIPAL')
            expect(result.title).toBe('Treino Principal')
        })

        it('retorna informação correta para CONDICIONAMENTO_FISICO', () => {
            const result = getBlockInfo('CONDICIONAMENTO_FISICO')
            expect(result.title).toBe('Condicionamento Físico')
        })

        it('retorna título formatado para tipo desconhecido', () => {
            const result = getBlockInfo('TIPO_DESCONHECIDO_AQUI')
            expect(result.title).toBe('TIPO DESCONHECIDO AQUI')
        })
    })

    describe('formatDate', () => {
        it('formata data no formato brasileiro', () => {
            const result = formatDate('2024-03-15')
            expect(result).toBe('15/03/2024')
        })

        it('formata data com dia único', () => {
            const result = formatDate('2024-01-05')
            expect(result).toBe('05/01/2024')
        })
    })

    describe('formatDayOfWeek', () => {
        it('retorna Segunda-feira', () => {
            const result = formatDayOfWeek('2024-04-01') // Segunda
            expect(result).toBe('Segunda-feira')
        })

        it('retorna Domingo', () => {
            const result = formatDayOfWeek('2024-03-31') // Domingo
            expect(result).toBe('Domingo')
        })

        it('retorna Sexta-feira', () => {
            const result = formatDayOfWeek('2024-04-05') // Sexta
            expect(result).toBe('Sexta-feira')
        })
    })

    describe('formatExerciseProtocol', () => {
        it('formata séries e repetições', () => {
            const prescription = {
                sets: 3,
                reps: '10-12'
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('3 × 10-12')
            expect(result[0].type).toBe('reps')
            expect(result[0].color).toBe('primary')
        })

        it('formata apenas séries quando não há reps', () => {
            const prescription = {
                sets: 4
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('4 séries')
            expect(result[0].type).toBe('reps')
        })

        it('formata duração em segundos', () => {
            const prescription = {
                duration_seconds: 45
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('45s')
            expect(result[0].type).toBe('duration')
            expect(result[0].color).toBe('warning')
        })

        it('formata duração em minutos e segundos', () => {
            const prescription = {
                duration_seconds: 90
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('1min 30s')
            expect(result[0].type).toBe('duration')
        })

        it('formata descanso', () => {
            const prescription = {
                rest_seconds: 60
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('60s descanso')
            expect(result[0].type).toBe('rest')
            expect(result[0].color).toBe('success')
        })

        it('formata carga', () => {
            const prescription = {
                weight_kg: 50
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(1)
            expect(result[0].text).toBe('50kg')
            expect(result[0].type).toBe('weight')
            expect(result[0].color).toBe('error')
        })

        it('formata protocolo completo com todos os campos', () => {
            const prescription = {
                sets: 3,
                reps: '8-10',
                duration_seconds: 120,
                rest_seconds: 90,
                weight_kg: 40
            }
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(4)
            expect(result[0].text).toBe('3 × 8-10')
            expect(result[1].text).toBe('2min 0s')
            expect(result[2].text).toBe('90s descanso')
            expect(result[3].text).toBe('40kg')
        })

        it('retorna array vazio quando não há dados', () => {
            const prescription = {}
            const result = formatExerciseProtocol(prescription)

            expect(result).toHaveLength(0)
        })

        it('cada item do protocolo possui ícone', () => {
            const prescription = {
                sets: 3,
                reps: '10'
            }
            const result = formatExerciseProtocol(prescription)

            expect(result[0].icon).toBeDefined()
            expect(result[0].icon.type).toBeDefined()
        })
    })
})
