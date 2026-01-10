/**
 * Adaptador para converter dados do banco para o formato esperado pelos componentes de Semana
 */

import type { Training, TrainingWeek } from '../types/database.types';

export interface SemanaComTreinos {
  id: string;
  name: string;
  numeroSemana: number;
  focoSemana: string;
  status: 'active' | 'completed' | 'draft' | 'archived';
  start_date: string;
  end_date: string;
  dias: {
    segunda: { treino?: Training };
    terca: { treino?: Training };
    quarta: { treino?: Training };
    quinta: { treino?: Training };
    sexta: { treino?: Training };
  };
}

/**
 * Determina o número da semana baseado na data de início
 */
function calcularNumeroSemana(startDate: string): number {
  const date = new Date(startDate);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Mapeia o dia da semana (0-6) para o dia correto (segunda-sexta)
 */
function getDiaDaSemana(date: Date): 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | null {
  const dayOfWeek = date.getDay();
  
  switch (dayOfWeek) {
    case 1: return 'segunda'; // Segunda-feira
    case 2: return 'terca';   // Terça-feira
    case 3: return 'quarta';  // Quarta-feira
    case 4: return 'quinta';  // Quinta-feira
    case 5: return 'sexta';   // Sexta-feira
    default: return null;     // Fim de semana
  }
}

/**
 * Converte dados do banco para o formato esperado pelos componentes
 */
export function adaptarSemanasParaVisualizacao(
  weeksWithTrainings: Array<TrainingWeek & { trainings: Training[] }>
): SemanaComTreinos[] {
  return weeksWithTrainings.map((week) => {
    // Inicializar estrutura de dias
    const dias: SemanaComTreinos['dias'] = {
      segunda: {},
      terca: {},
      quarta: {},
      quinta: {},
      sexta: {}
    };

    // Organizar treinos por dia da semana
    week.trainings.forEach((treino) => {
      if (treino.scheduled_date) {
        const date = new Date(treino.scheduled_date);
        const dia = getDiaDaSemana(date);
        
        if (dia) {
          dias[dia] = { treino };
        }
      }
    });

    // Calcular número da semana
    const numeroSemana = calcularNumeroSemana(week.start_date);

    // Montar nome do foco
    const focoSemana = week.week_focus?.name || 'Sem foco definido';

    return {
      id: week.id,
      name: week.name,
      numeroSemana,
      focoSemana,
      status: week.status as 'active' | 'completed' | 'draft' | 'archived',
      start_date: week.start_date,
      end_date: week.end_date,
      dias
    };
  });
}

/**
 * Formata o protocolo de um exercício para exibição
 */
export function formatarProtocolo(prescription: any): string {
  const parts: string[] = [];

  if (prescription.sets) {
    parts.push(`${prescription.sets}×`);
  }

  if (prescription.reps) {
    parts.push(prescription.reps);
  }

  if (prescription.duration_seconds) {
    const minutes = Math.floor(prescription.duration_seconds / 60);
    const seconds = prescription.duration_seconds % 60;
    if (minutes > 0) {
      parts.push(seconds > 0 ? `${minutes}'${seconds}"` : `${minutes}'`);
    } else {
      parts.push(`${seconds}"`);
    }
  }

  if (prescription.rest_seconds) {
    parts.push(`×${prescription.rest_seconds}"`);
  }

  return parts.length > 0 ? parts.join('') : 'N/A';
}
