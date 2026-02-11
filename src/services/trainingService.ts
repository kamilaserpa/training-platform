// Serviço para gerenciar treinos
import { supabase, useMock } from '../lib/supabase';
import type {
  CreateExercisePrescriptionDTO,
  CreateTrainingBlockDTO,
  CreateTrainingDTO,
  ExercisePrescription,
  Training,
  TrainingBlock,
  TrainingWeek,
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
    block_type: 'MOBILIDADE_ARTICULAR',
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
  private withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, operationName: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Tempo esgotado (${operationName}). Verifique sua conexão e tente novamente.`));
      }, timeoutMs);
    });

    const wrapped = Promise.resolve(promise);

    return Promise.race([wrapped, timeoutPromise]).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  }

  private async getCurrentUserId(): Promise<string> {
    const {
      data: { session },
      error: sessionError,
    } = await this.withTimeout(supabase.auth.getSession(), 5000, 'obtendo sessão');

    if (sessionError) {
      console.warn('Aviso ao obter sessão (trainingService):', sessionError);
    }

    const sessionUser = session?.user;
    if (sessionUser?.id) return sessionUser.id;

    const user = await this.withTimeout(
      supabase.auth.getUser().then((r) => {
        if (r.error) throw r.error;
        return r.data.user;
      }),
      10000,
      'obtendo usuário'
    );

    if (!user?.id) throw new Error('Usuário não autenticado');
    return user.id;
  }

  async getAllTrainings(): Promise<Training[]> {
    if (useMock) {
      return mockTrainings;
    }

    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('trainings')
        .select(
          `
          *,
          training_week:training_weeks(
            *,
            week_focus:week_focuses(*)
          ),
          movement_pattern:movement_patterns(*),
          training_blocks(
            *,
            exercise_prescriptions(
              *,
              exercise:exercises(*)
            )
          )
        `,
        )
        .eq('created_by', userId)
        .order('scheduled_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      throw error;
    }
  }

  async getTrainingsByWeek(weekId: string): Promise<Training[]> {
    if (useMock) {
      return mockTrainings.filter((training) => training.training_week_id === weekId);
    }

    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('trainings')
        .select(
          `
          *,
          training_week:training_weeks(
            *,
            week_focus:week_focuses(*)
          ),
          movement_pattern:movement_patterns(*),
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
        .eq('created_by', userId)
        .order('scheduled_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar treinos da semana:', error);
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
      const { data, error } = await this.withTimeout(
        supabase
          .from('trainings')
          .select(
            `
            *,
            training_week:training_weeks(
              *,
              week_focus:week_focuses(*)
            ),
            movement_pattern:movement_patterns(*),
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
          .single(),
        20000,
        'buscando treino'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
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
      // Obter usuário atual
        const userId = await this.getCurrentUserId();

      const trainingWithUser = {
        ...trainingData,
          created_by: userId
      }

        const { data, error } = await this.withTimeout(
          supabase
            .from('trainings')
            .insert(trainingWithUser)
            .select(
              `
              *,
              training_week:training_weeks(*)
            `,
            )
            .single(),
          20000,
          'criando treino'
        );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar treino:', error);
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
      const { data, error } = await this.withTimeout(
        supabase
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
          .single(),
        20000,
        'atualizando treino'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
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
      console.error('Erro ao deletar treino:', error);
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
      const { data, error } = await this.withTimeout(
        supabase
          .from('training_blocks')
          .insert(blockData)
          .select('*')
          .single()
          .overrideTypes<TrainingBlock, { merge: false }>(),
        20000,
        'criando bloco'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar bloco:', error);
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
      const { data, error } = await this.withTimeout(
        supabase
          .from('exercise_prescriptions')
          .insert(prescriptionData)
          .select(
            `
            *,
            exercise:exercises(*)
          `,
          )
          .single(),
        20000,
        'adicionando exercício ao bloco'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao adicionar exercício ao bloco:', error);
      throw error;
    }
  }

  // Deletar bloco de treino
  async deleteTrainingBlock(blockId: string): Promise<void> {
    if (useMock) {
      return;
    }

    try {
      // Primeiro deletar todas as prescrições de exercícios do bloco
      const { error: prescriptionsError } = await supabase
        .from('exercise_prescriptions')
        .delete()
        .eq('training_block_id', blockId);

      if (prescriptionsError) throw prescriptionsError;

      // Depois deletar o bloco
      const { error: blockError } = await supabase
        .from('training_blocks')
        .delete()
        .eq('id', blockId);

      if (blockError) throw blockError;
    } catch (error) {
      console.error('Erro ao deletar bloco:', error);
      throw error;
    }
  }

  // Deletar todos os blocos de um treino
  async deleteAllTrainingBlocks(trainingId: string): Promise<void> {
    if (useMock) {
      return;
    }

    try {
      // Primeiro buscar todos os blocos do treino
      const { data: blocks, error: blocksError } = await this.withTimeout(
        supabase.from('training_blocks').select('id').eq('training_id', trainingId),
        20000,
        'listando blocos do treino'
      );

      if (blocksError) throw blocksError;

      if (blocks && blocks.length > 0) {
        const blockIds = blocks.map(block => block.id);

        // Deletar todas as prescrições de exercícios dos blocos
        const { error: prescriptionsError } = await this.withTimeout(
          supabase.from('exercise_prescriptions').delete().in('training_block_id', blockIds),
          20000,
          'removendo exercícios dos blocos'
        );

        if (prescriptionsError) {
          // Continuar mesmo com erro
        }
      }

      // Depois deletar todos os blocos do treino
      const { error: blocksError2 } = await this.withTimeout(
        supabase.from('training_blocks').delete().eq('training_id', trainingId),
        20000,
        'removendo blocos do treino'
      );

      if (blocksError2) throw blocksError2;
    } catch (error) {
      console.error('Erro ao deletar blocos do treino:', error);
      throw error;
    }
  }

  // Buscar padrões de movimento disponíveis
  async getMovementPatterns(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('movement_patterns')
        .select('*')
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar padrões de movimento:', error);
      throw error;
    }
  }

  // Buscar treino público por token de compartilhamento
  async getPublicTraining(token: string): Promise<Training | null> {
    if (useMock) {
      // Em mock mode, retornar dados simulados
      const mockPublicTraining: Training = {
        id: '1',
        training_week_id: '1',
        name: 'Treino A - Semana 1',
        scheduled_date: '2024-01-15',
        intensity_level: 8,
        description: 'Treino focado em força e resistência',
        estimated_duration_minutes: 90,
        share_status: 'public',
        share_token: token,
        created_by: 'mock-user',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        training_blocks: [
          {
            id: '1',
            training_id: '1',
            name: 'Mobilidade Articular',
            block_type: 'MOBILIDADE_ARTICULAR',
            order_index: 1,
            rest_between_exercises_seconds: 30,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exercise_prescriptions: [
              {
                id: '1',
                training_block_id: '1',
                exercise_id: '1',
                order_index: 1,
                sets: 2,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                exercise: {
                  id: '1',
                  name: 'Rotação de ombros',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z'
                }
              },
              {
                id: '2',
                training_block_id: '1',
                exercise_id: '2',
                order_index: 2,
                sets: 2,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                exercise: {
                  id: '2',
                  name: 'Flexão de quadril',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z'
                }
              }
            ]
          },
          {
            id: '2',
            training_id: '1',
            name: 'Ativação Core',
            block_type: 'ATIVACAO_CORE',
            order_index: 2,
            rest_between_exercises_seconds: 60,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exercise_prescriptions: [
              {
                id: '3',
                training_block_id: '2',
                exercise_id: '3',
                order_index: 1,
                sets: 3,
                duration_seconds: 30,
                rest_seconds: 60,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                exercise: {
                  id: '3',
                  name: 'Prancha',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z'
                }
              }
            ]
          },
          {
            id: '3',
            training_id: '1',
            name: 'Treino Principal',
            block_type: 'TREINO_PRINCIPAL',
            order_index: 3,
            rest_between_exercises_seconds: 90,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            exercise_prescriptions: [
              {
                id: '4',
                training_block_id: '3',
                exercise_id: '4',
                order_index: 1,
                sets: 4,
                reps: '8-10',
                weight_kg: 80,
                rest_seconds: 120,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                exercise: {
                  id: '4',
                  name: 'Agachamento',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z'
                }
              },
              {
                id: '5',
                training_block_id: '3',
                exercise_id: '5',
                order_index: 2,
                sets: 4,
                reps: '8-10',
                weight_kg: 60,
                rest_seconds: 120,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                exercise: {
                  id: '5',
                  name: 'Supino',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z'
                }
              }
            ]
          }
        ]
      };

      return mockPublicTraining;
    }

    try {
      console.log('🔍 Buscando treino público com token:', token);

      const { data, error } = await supabase
        .from('trainings')
        .select(`
          *,
          user:users!created_by (
            id,
            name,
            email
          ),
          training_blocks (
            *,
            exercise_prescriptions (
              *,
              exercise:exercises (
                id,
                name,
                instructions
              ),
              video:videos (
                id,
                title,
                storage_path
              )
            )
          )
        `)
        .eq('share_token', token)
        .maybeSingle();

      console.log('📊 Resultado da query:', { data, error });

      if (error) {
        console.error('❌ Erro no Supabase:', error);
        throw error;
      }

      if (!data) {
        console.warn('⚠️ Nenhum treino encontrado com token:', token);
      }

      return data || null;
    } catch (error) {
      console.error('💥 Erro ao buscar treino público:', error);
      throw error;
    }
  }

  /**
   * Busca semanas com treinos organizados por dia da semana
   */
  async getWeeksWithTrainings(): Promise<any[]> {
    try {
      // Buscar todas as semanas com seus focos
      const { data: weeks, error: weeksError } = await supabase
        .from('training_weeks')
        .select(`
          *,
          week_focus:week_focuses(*)
        `)
        .order('start_date', { ascending: false })
        .overrideTypes<TrainingWeek[], { merge: false }>();

      if (weeksError) throw weeksError;

      if (!weeks || weeks.length === 0) {
        return [];
      }

      // Para cada semana, buscar seus treinos com blocos e exercícios
      const weeksWithTrainings = await Promise.all(
        weeks.map(async (week) => {
          const { data: trainings, error: trainingsError } = await supabase
            .from('trainings')
            .select(`
              *,
              training_blocks(
                *,
                exercise_prescriptions(
                  *,
                  exercise:exercises(*)
                )
              )
            `)
            .eq('training_week_id', week.id)
            .order('scheduled_date');

          if (trainingsError) {
            return { ...week, trainings: [] };
          }

          return {
            ...week,
            trainings: trainings || []
          };
        })
      );

      return weeksWithTrainings;
    } catch (error) {
      console.error('Erro ao buscar semanas com treinos:', error);
      throw error;
    }
  }
}

export const trainingService = new TrainingService();
