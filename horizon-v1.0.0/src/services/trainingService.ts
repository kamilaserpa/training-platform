// Serviço para gerenciar treinos
import { supabase, useMock } from '../lib/supabase';
import type {
  Training,
  CreateTrainingDTO,
  TrainingBlock,
  CreateTrainingBlockDTO,
  ExercisePrescription,
  CreateExercisePrescriptionDTO,
} from '../types/database.types';

// Mock data para desenvolvimento
const mockTrainings: Training[] = [
  {
    id: '1',
    training_week_id: '1',
    name: 'Segunda-feira - EMPURRAR E AGACHAR',
    scheduled_date: '2024-01-08',
    intensity_level: 8,
    description: 'Treino focado em padrões de empurrar e agachar com alta intensidade',
    estimated_duration_minutes: 90,
    share_status: 'private',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    training_week_id: '1',
    name: 'Quarta-feira - PUXAR E DOBRAR',
    scheduled_date: '2024-01-10',
    intensity_level: 7,
    description: 'Treino focado em padrões de puxar e movimentos de dobradiça',
    estimated_duration_minutes: 85,
    share_status: 'private',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    training_week_id: '1',
    name: 'Sexta-feira - FULL BODY',
    scheduled_date: '2024-01-12',
    intensity_level: 9,
    description: 'Treino completo englobando todos os padrões de movimento',
    estimated_duration_minutes: 100,
    share_status: 'private',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTrainingBlocks: TrainingBlock[] = [
  {
    id: '1',
    training_id: '1',
    name: 'Aquecimento Articular',
    block_type: 'AQUECIMENTO',
    order_index: 1,
    instructions: 'Movimentos suaves para preparar articulações',
    rest_between_exercises_seconds: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    training_id: '1',
    name: 'Bloco Principal - Empurrar',
    block_type: 'TREINO_PRINCIPAL',
    order_index: 2,
    instructions: 'Foque na técnica e controle do movimento',
    rest_between_exercises_seconds: 120,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    training_id: '1',
    name: 'Bloco Principal - Agachar',
    block_type: 'TREINO_PRINCIPAL',
    order_index: 3,
    instructions: 'Mantenha a postura e desça controladamente',
    rest_between_exercises_seconds: 120,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

class TrainingService {
  async getAllTrainings(): Promise<Training[]> {
    if (useMock) {
      console.log('🎭 [TrainingService] Usando dados mockados');
      return mockTrainings;
    }

    try {
      const { data, error } = await supabase
        .from('trainings')
        .select(
          `
          *,
          training_week:training_weeks(*),
          training_blocks(
            *,
            exercise_prescriptions(
              *,
              exercise:exercises(*)
            )
          )
        `,
        )
        .order('scheduled_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao buscar treinos:', error);
      throw error;
    }
  }

  async getTrainingsByWeek(weekId: string): Promise<Training[]> {
    if (useMock) {
      return mockTrainings.filter((training) => training.training_week_id === weekId);
    }

    try {
      const { data, error } = await supabase
        .from('trainings')
        .select(
          `
          *,
          training_week:training_weeks(*),
          training_blocks(
            *,
            exercise_prescriptions(
              *,
              exercise:exercises(*)
            )
          )
        `,
        )
        .eq('training_week_id', weekId)
        .order('scheduled_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao buscar treinos da semana:', error);
      throw error;
    }
  }

  async getTrainingById(id: string): Promise<Training | null> {
    if (useMock) {
      const training = mockTrainings.find((t) => t.id === id);
      if (training) {
        return {
          ...training,
          training_blocks: mockTrainingBlocks.filter((b) => b.training_id === id),
        };
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('trainings')
        .select(
          `
          *,
          training_week:training_weeks(*),
          training_blocks(
            *,
            exercise_prescriptions(
              *,
              exercise:exercises(*)
            )
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao buscar treino:', error);
      throw error;
    }
  }

  async createTraining(trainingData: CreateTrainingDTO): Promise<Training> {
    if (useMock) {
      const newTraining: Training = {
        id: Math.random().toString(36).substr(2, 9),
        ...trainingData,
        share_status: 'private',
        created_by: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTrainings.push(newTraining);
      return newTraining;
    }

    try {
      const { data, error } = await supabase
        .from('trainings')
        .insert(trainingData)
        .select(
          `
          *,
          training_week:training_weeks(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao criar treino:', error);
      throw error;
    }
  }

  async updateTraining(id: string, updates: Partial<CreateTrainingDTO>): Promise<Training> {
    if (useMock) {
      const index = mockTrainings.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Treino não encontrado');

      mockTrainings[index] = {
        ...mockTrainings[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return mockTrainings[index];
    }

    try {
      const { data, error } = await supabase
        .from('trainings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          training_week:training_weeks(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao atualizar treino:', error);
      throw error;
    }
  }

  async deleteTraining(id: string): Promise<void> {
    if (useMock) {
      const index = mockTrainings.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockTrainings.splice(index, 1);
      }
      return;
    }

    try {
      const { error } = await supabase.from('trainings').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao deletar treino:', error);
      throw error;
    }
  }

  // Métodos para blocos de treino
  async createTrainingBlock(blockData: CreateTrainingBlockDTO): Promise<TrainingBlock> {
    if (useMock) {
      const newBlock: TrainingBlock = {
        id: Math.random().toString(36).substr(2, 9),
        ...blockData,
        rest_between_exercises_seconds: blockData.rest_between_exercises_seconds || 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTrainingBlocks.push(newBlock);
      return newBlock;
    }

    try {
      const { data, error } = await supabase
        .from('training_blocks')
        .insert(blockData)
        .select('*')
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao criar bloco:', error);
      throw error;
    }
  }

  async addExerciseToBlock(
    prescriptionData: CreateExercisePrescriptionDTO,
  ): Promise<ExercisePrescription> {
    if (useMock) {
      const newPrescription: ExercisePrescription = {
        id: Math.random().toString(36).substr(2, 9),
        ...prescriptionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newPrescription;
    }

    try {
      const { data, error } = await supabase
        .from('exercise_prescriptions')
        .insert(prescriptionData)
        .select(
          `
          *,
          exercise:exercises(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [TrainingService] Erro ao adicionar exercício ao bloco:', error);
      throw error;
    }
  }
}

export const trainingService = new TrainingService();
