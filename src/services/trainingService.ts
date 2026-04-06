// Serviço para gerenciar treinos
import { supabase, useMock } from '../lib/supabase';
import type {
  CreateExercisePrescriptionDTO,
  CreateTrainingBlockDTO,
  CreateTrainingDTO,
  CreateTrainingWithWeekParams,
  ExercisePrescription,
  Training,
  TrainingBlock,
  TrainingWeek,
  UpdateTrainingWithWeekParams,
  WeekFocus,
} from '../types/database.types';
import { formatISODateOnlyLocal, getWeekEndSundayLocal, getWeekStartMondayLocal, parseLocalDate } from '../utils/date';
import { weekService } from './weekService';

export type CurrentWeekSummary = Pick<TrainingWeek, 'id' | 'name' | 'start_date' | 'end_date' | 'status'> & {
  week_focus?: Pick<WeekFocus, 'name'> | null;
  trainings: Array<Pick<Training, 'id' | 'scheduled_date'>>;
};

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
  private currentUserIdInFlight: Promise<string> | null = null;

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, operationName: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        const err = new Error(`Tempo esgotado (${operationName}). Verifique sua conexão e tente novamente.`);
        (err as Error & { name: string }).name = 'TimeoutError';
        reject(err);
      }, timeoutMs);
    });

    const wrapped = Promise.resolve(promise);

    return Promise.race([wrapped, timeoutPromise]).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  }

  private async getCurrentUserId(): Promise<string> {
    if (this.currentUserIdInFlight) return this.currentUserIdInFlight;

    this.currentUserIdInFlight = (async () => {
      let lastAuthError: unknown = null;

      const tryGetSessionUserId = async (): Promise<string | null> => {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await this.withTimeout(supabase.auth.getSession(), 20000, 'obtendo sessão');

          if (sessionError) {
            lastAuthError = sessionError;
            console.warn('Aviso ao obter sessão (trainingService):', sessionError);
          }

          return session?.user?.id ?? null;
        } catch (e) {
          lastAuthError = e;
          console.warn('Aviso ao obter sessão (trainingService):', e);
          return null;
        }
      };

      const tryGetUserId = async (): Promise<string | null> => {
        try {
          const user = await this.withTimeout(
            supabase.auth.getUser().then((r) => {
              if (r.error) throw r.error;
              return r.data.user;
            }),
            25000,
            'obtendo usuário'
          );
          return user?.id ?? null;
        } catch (e) {
          lastAuthError = e;
          console.warn('Aviso ao obter usuário (trainingService):', e);
          return null;
        }
      };

      // 1) Prefer session (fast path), but be tolerant to hangs/timeouts.
      let userId = await tryGetSessionUserId();
      if (!userId) {
        // Small delay helps when auth is still initializing (especially in dev StrictMode).
        await this.sleep(400);
        userId = await tryGetSessionUserId();
      }
      if (userId) return userId;

      // 2) Fallback to remote user fetch.
      userId = await tryGetUserId();
      if (userId) return userId;

      // If auth failed with a meaningful error, bubble it up (better UX and helps debugging).
      if (lastAuthError && typeof lastAuthError === 'object' && 'message' in lastAuthError) {
        throw lastAuthError as Error;
      }

      throw new Error('Usuário não autenticado');
    })().finally(() => {
      this.currentUserIdInFlight = null;
    });

    return this.currentUserIdInFlight;
  }

  async getAllTrainings(): Promise<Training[]> {
    if (useMock) {
      return mockTrainings;
    }

    try {
      const userId = await this.getCurrentUserId();

      // Mobile perf: evite `*` em joins profundos (payload enorme).
      const { data, error } = await this.withTimeout(
        supabase
          .from('trainings')
          .select(
            `
            id,
            name,
            scheduled_date,
            intensity_level,
            description,
            estimated_duration_minutes,
            share_status,
            training_week:training_weeks(
              id,
              name,
              start_date,
              end_date,
              status,
              week_focus:week_focuses(name)
            ),
            movement_pattern:movement_patterns(name),
            training_blocks(
              id,
              training_id,
              name,
              block_type,
              order_index,
              instructions,
              rest_between_exercises_seconds,
              exercise_prescriptions(
                id,
                exercise_id,
                sets,
                reps,
                duration_seconds,
                rest_seconds,
                exercise:exercises(name, muscle_groups)
              )
            )
          `,
          )
          .eq('created_by', userId)
          .order('scheduled_date'),
        20000,
        'carregando treinos'
      );

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
                exercise:exercises(
                  *,
                  video:videos!exercises_video_id_fkey(id, title, storage_path)
                )
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
          60000,
          'criando treino'
        );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      throw error;
    }
  }

  /**
   * Cria treino (e semana quando necessário) via RPC atômico no banco.
   * Após o RPC, recarrega o treino completo (incl. share_token gerado por triggers/defaults).
   */
  async createTrainingWithWeek(params: CreateTrainingWithWeekParams): Promise<Training> {
    if (useMock) {
      const monday = getWeekStartMondayLocal(parseLocalDate(params.scheduled_date));
      const mondayStr = formatISODateOnlyLocal(monday);
      const endSunday = getWeekEndSundayLocal(monday);

      let week = await weekService.getTrainingWeekByStartDate(mondayStr);

      if (!week) {
        week = await weekService.createTrainingWeek({
          name: `${params.scheduled_date.slice(0, 4)}-${mondayStr}`,
          week_focus_id: params.week_focus_id,
          start_date: mondayStr,
          end_date: formatISODateOnlyLocal(endSunday),
        });
      }

      return this.createTraining({
        training_week_id: week.id,
        name: params.name,
        scheduled_date: params.scheduled_date,
        movement_pattern_id: null,
      });
    }

    try {
      const userId = await this.getCurrentUserId();

      const rpcResult = (await this.withTimeout(
        (supabase as any).rpc('create_training_with_week', {
          p_name: params.name,
          p_scheduled_date: params.scheduled_date,
          p_week_focus_id: params.week_focus_id,
          p_created_by: userId,
          p_movement_pattern_id: params.movement_pattern_id || null,
          p_description: params.description || null,
          p_internal_notes: params.internal_notes || null,
          p_estimated_duration_minutes: params.estimated_duration_minutes || null,
          p_share_status: params.share_status || null,
          p_share_token: params.share_token || null,
        }),
        60000,
        'criando treino (RPC create_training_with_week)',
      )) as { data: unknown; error: unknown };

      const trainingId = rpcResult.data;
      if (rpcResult.error) throw rpcResult.error;
      if (!trainingId || typeof trainingId !== 'string') {
        throw new Error('Resposta inválida ao criar treino');
      }

      const training = await this.getTrainingById(trainingId);
      if (!training) throw new Error('Treino criado mas não foi possível recarregar os dados');

      return training;
    } catch (error) {
      console.error('Erro ao criar treino com semana (RPC):', error);
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
        60000,
        'atualizando treino'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      throw error;
    }
  }

  /**
   * Atualiza treino recalculando automaticamente a semana via RPC.
   * Permite mudança livre da data; a semana será recalculada/criada conforme necessário.
   */
  async updateTrainingWithWeek(params: UpdateTrainingWithWeekParams): Promise<Training> {
    if (useMock) {
      const monday = getWeekStartMondayLocal(parseLocalDate(params.scheduled_date));
      const mondayStr = formatISODateOnlyLocal(monday);
      const endSunday = getWeekEndSundayLocal(monday);

      let week = await weekService.getTrainingWeekByStartDate(mondayStr);

      if (!week) {
        week = await weekService.createTrainingWeek({
          name: `${params.scheduled_date.slice(0, 4)}-${mondayStr}`,
          week_focus_id: params.week_focus_id,
          start_date: mondayStr,
          end_date: formatISODateOnlyLocal(endSunday),
        });
      }

      return this.updateTraining(params.training_id, {
        training_week_id: week.id,
        name: params.name,
        scheduled_date: params.scheduled_date,
      });
    }

    try {
      const userId = await this.getCurrentUserId();

      const rpcResult = (await this.withTimeout(
        (supabase as any).rpc('update_training_with_week', {
          p_training_id: params.training_id,
          p_name: params.name,
          p_scheduled_date: params.scheduled_date,
          p_week_focus_id: params.week_focus_id,
          p_created_by: userId,
        }),
        60000,
        'atualizando treino (RPC update_training_with_week)',
      )) as { data: unknown; error: unknown };

      if (rpcResult.error) throw rpcResult.error;

      // Recarregar treino com todas as relações
      const training = await this.getTrainingById(params.training_id);
      if (!training) throw new Error('Treino atualizado mas não foi possível recarregar os dados');

      return training;
    } catch (error) {
      console.error('Erro ao atualizar treino com semana (RPC):', error);
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
        60000,
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
        60000,
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

  // Deletar um conjunto específico de blocos de treino (e suas prescrições)
  async deleteTrainingBlocksByIds(blockIds: string[]): Promise<void> {
    if (useMock) {
      return;
    }

    if (!blockIds || blockIds.length === 0) {
      return;
    }

    try {
      // Deletar todas as prescrições de exercícios dos blocos informados
      const { error: prescriptionsError } = await this.withTimeout(
        supabase.from('exercise_prescriptions').delete().in('training_block_id', blockIds),
        60000,
        'removendo exercícios de blocos específicos'
      );

      if (prescriptionsError) {
        // Mesmo em caso de erro nas prescrições, tentamos prosseguir com a remoção dos blocos
        console.warn('Aviso ao remover prescrições de blocos específicos:', prescriptionsError);
      }

      // Depois deletar os blocos em si
      const { error: blocksError } = await this.withTimeout(
        supabase.from('training_blocks').delete().in('id', blockIds),
        80000,
        'removendo blocos específicos do treino'
      );

      if (blocksError) throw blocksError;
    } catch (error) {
      console.error('Erro ao deletar blocos específicos do treino:', error);
      throw error;
    }
  }

  /**
   * Atualiza os blocos de um treino de forma atômica via RPC no Supabase.
   * Recebe os drafts já montados pelo `TreinoForm` e delega a recriação para o banco.
   */
  async updateTrainingBlocksAtomically(
    trainingId: string,
    blockDrafts: Array<{
      name: string;
      type: string;
      items: any[];
      order: number;
    }>
  ): Promise<void> {
    if (useMock) {
      // Em modo mock, mantemos o comportamento atual sem chamar o RPC real.
      return;
    }

    const blocksWithItems = (blockDrafts || []).filter(
      (b) => b && Array.isArray(b.items) && b.items.length > 0
    );

    if (blocksWithItems.length === 0) {
      // Nada a atualizar em termos de blocos/exercícios.
      return;
    }

    const payloadBlocks = blocksWithItems.map((block) => ({
      name: block.name,
      block_type: block.type,
      order_index: block.order,
      rest_between_exercises_seconds: 60,
      exercises: (block.items || []).map((item: any) => ({
        exercise_id: item.exercicioId,
        video_id: item.videoId ?? null,
        sets: Number(item.series) || 1,
        reps: item.repeticoes ?? null,
        duration_seconds:
          item.tempoSegundos != null && item.tempoSegundos !== ''
            ? Number(item.tempoSegundos)
            : null,
        rest_seconds:
          item.intervaloSegundos != null && item.intervaloSegundos !== ''
            ? Number(item.intervaloSegundos)
            : 0,
        weight_kg:
          item.carga && item.carga !== ''
            ? Number(String(item.carga).replace('kg', '').trim())
            : null,
        notes: item.observacoes ?? null,
      })),
    }));

    const rpcResult = await this.withTimeout<any>(
      (supabase as any).rpc('update_training_blocks_atomically', {
        p_training_id: trainingId,
        p_blocks: payloadBlocks,
      }),
      60000,
      'atualizando blocos do treino (RPC)'
    );

    if (rpcResult && rpcResult.error) {
      throw rpcResult.error;
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
        supabase.from('training_blocks')
        .select('id')
        .eq('training_id', trainingId),
        60000,
        'listando blocos do treino'
      );

      if (blocksError) throw blocksError;

      if (blocks && blocks.length > 0) {
        const blockIds = blocks.map(block => block.id);

        // Deletar todas as prescrições de exercícios dos blocos
        const { error: prescriptionsError } = await this.withTimeout(
          supabase.from('exercise_prescriptions').delete().in('training_block_id', blockIds),
          60000,
          'removendo exercícios dos blocos'
        );

        if (prescriptionsError) {
          // Continuar mesmo com erro
        }
      }

      // Depois deletar todos os blocos do treino
      const { error: blocksError2 } = await this.withTimeout(
        supabase.from('training_blocks').delete().eq('training_id', trainingId),
        60000,
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

  /**
   * Busca apenas a semana atual com dados mínimos para o dashboard
   */
  async getCurrentWeekSummary(dateISO?: string): Promise<CurrentWeekSummary | null> {
    if (useMock) {
      return null;
    }

    try {
      const userId = await this.getCurrentUserId();
      const today = dateISO ?? new Date().toISOString().slice(0, 10);

      const query = supabase
        .from('training_weeks')
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          status,
          week_focus:week_focuses(name),
          trainings(id, scheduled_date)
        `,
        )
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('created_by', userId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle()
        .overrideTypes<CurrentWeekSummary, { merge: false }>();

      const { data, error } = await this.withTimeout(query, 8000, 'buscando semana atual');

      if (error) throw error;

      return data ? { ...data, trainings: data.trainings ?? [] } : null;
    } catch (error) {
      console.error('Erro ao buscar semana atual (summary):', error);
      throw error;
    }
  }
}

export const trainingService = new TrainingService();
