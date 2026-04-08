import {
  AccessTime as AccessTimeIcon,
  FitnessCenter as FitnessCenterIcon,
  Repeat as RepeatIcon,
  Timer as TimerIcon
} from '@mui/icons-material'
import { ReactElement } from 'react'
import { parseLocalDate } from './date'

/**
 * Informações de formatação para tipos de blocos de treino
 */
export const getBlockInfo = (blockType: string) => {
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

/**
 * Formata data para formato brasileiro
 */
export const formatDate = (dateString: string) => {
  return parseLocalDate(dateString).toLocaleDateString('pt-BR')
}

/**
 * Obtém o dia da semana em português
 */
export const formatDayOfWeek = (dateString: string) => {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return days[parseLocalDate(dateString).getDay()]
}

/**
 * Tipo de protocolo de exercício
 */
export interface ProtocolItem {
  icon: ReactElement
  text: string
  type: 'reps' | 'duration' | 'rest' | 'weight'
  color: 'primary' | 'warning' | 'success' | 'error'
}

/**
 * Formata protocolo de exercício (séries, reps, duração, descanso, carga)
 */
export const formatExerciseProtocol = (prescription: any): ProtocolItem[] => {
  const protocol: ProtocolItem[] = []

  // Séries e Repetições
  if (prescription.sets && prescription.reps) {
    protocol.push({
      icon: <RepeatIcon fontSize="small" />,
      text: `${prescription.sets} × ${prescription.reps}`,
      type: 'reps',
      color: 'primary'
    })
  } else if (prescription.sets) {
    protocol.push({
      icon: <RepeatIcon fontSize="small" />,
      text: `${prescription.sets} séries`,
      type: 'reps',
      color: 'primary'
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
      color: 'warning'
    })
  }

  // Descanso
  if (prescription.rest_seconds) {
    protocol.push({
      icon: <AccessTimeIcon fontSize="small" />,
      text: `${prescription.rest_seconds}s descanso`,
      type: 'rest',
      color: 'success'
    })
  }

  // Carga
  if (prescription.weight_kg) {
    protocol.push({
      icon: <FitnessCenterIcon fontSize="small" />,
      text: `${prescription.weight_kg}kg`,
      type: 'weight',
      color: 'error'
    })
  }

  return protocol
}
