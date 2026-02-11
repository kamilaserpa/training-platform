// Serviço para gerenciar exercícios
import { supabase, useMock } from '../lib/supabase';
import type { CreateExerciseDTO, Exercise } from '../types/database.types';

export type ExerciseLiteForMatching = Pick<Exercise, 'id' | 'name'> & {
  movement_pattern?: { name: string } | null;
};

// Mock data para desenvolvimento
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Agachamento Livre',
    muscle_groups: ['Pernas'],
    movement_pattern_id: '1',
    instructions: 'Desça mantendo o core ativo até 90 graus no joelho',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    movement_pattern: {
      id: '1',
      name: 'Agachar',
      description: 'Movimento de agachamento',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    name: 'Supino Reto',
    muscle_groups: ['Peito'],
    movement_pattern_id: '2',
    instructions: 'Controle a descida e exploda na subida',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    movement_pattern: {
      id: '2',
      name: 'Empurrar Horizontal',
      description: 'Movimento de empurrar no plano horizontal',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '3',
    name: 'Barra Fixa',
    muscle_groups: ['Costas'],
    movement_pattern_id: '3',
    instructions: 'Pegada pronada, desça até extensão completa dos braços',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    movement_pattern: {
      id: '3',
      name: 'Puxar Vertical',
      description: 'Movimento de puxar no plano vertical',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

class ExerciseService {
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

  async getExercisesLiteForMatching(): Promise<ExerciseLiteForMatching[]> {
    if (useMock) {
      return mockExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        movement_pattern: ex.movement_pattern?.name ? { name: ex.movement_pattern.name } : null,
      }));
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          id,
          name,
          movement_pattern:movement_patterns(name)
        `,
        )
        .order('name')
        .overrideTypes<ExerciseLiteForMatching[], { merge: false }>();

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios (lite):', error);
      throw error;
    }
  }

  async getAllExercises(): Promise<Exercise[]> {
    if (useMock) {
      return mockExercises;
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          movement_pattern:movement_patterns(*)
        `,
        )
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios:', error);
      throw error;
    }
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    if (useMock) {
      return mockExercises.find((ex) => ex.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          movement_pattern:movement_patterns(*)
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      throw error;
    }
  }

  async createExercise(exerciseData: CreateExerciseDTO): Promise<Exercise> {
    if (useMock) {
      const newExercise: Exercise = {
        id: Math.random().toString(36).substr(2, 9),
        ...exerciseData,
        created_by: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockExercises.push(newExercise);
      return newExercise;
    }

    try {
      // Preferir sessão local (evita request extra, mais resiliente em PWA standalone)
      const {
        data: { session },
        error: sessionError,
      } = await this.withTimeout(supabase.auth.getSession(), 5000, 'obtendo sessão');

      const sessionUser = session?.user;
      if (sessionError) {
        console.warn('Aviso ao obter sessão (createExercise):', sessionError);
      }

      // Fallback: buscar usuário via API (pode falhar/hangar em iOS PWA; protegido por timeout)
      const resolvedUser =
        sessionUser ??
        (
          await this.withTimeout(
            supabase.auth.getUser().then((r) => {
              if (r.error) throw r.error;
              return r.data.user;
            }),
            10000,
            'obtendo usuário'
          )
        );

      if (!resolvedUser) {
        throw new Error('Usuário não autenticado');
      }

      // Incluir o created_by no exercício
      const exerciseWithOwner = {
        ...exerciseData,
        created_by: resolvedUser.id
      };

      const { data, error } = await this.withTimeout(
        supabase
          .from('exercises')
          .insert(exerciseWithOwner)
          .select(
            `
            *,
            movement_pattern:movement_patterns(*)
          `,
          )
          .single(),
        20000,
        'criando exercício'
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      throw error;
    }
  }

  async updateExercise(id: string, updates: Partial<CreateExerciseDTO>): Promise<Exercise> {
    if (useMock) {
      const index = mockExercises.findIndex((ex) => ex.id === id);
      if (index === -1) throw new Error('Exercício não encontrado');

      mockExercises[index] = {
        ...mockExercises[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return mockExercises[index];
    }

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          movement_pattern:movement_patterns(*)
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar exercício:', error);
      throw error;
    }
  }

  async deleteExercise(id: string): Promise<void> {
    if (useMock) {
      const index = mockExercises.findIndex((ex) => ex.id === id);
      if (index !== -1) {
        mockExercises.splice(index, 1);
      }
      return;
    }

    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      throw error;
    }
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    if (useMock) {
      return mockExercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query.toLowerCase()) ||
          ex.muscle_groups?.some(mg => mg.toLowerCase().includes(query.toLowerCase())),
      );
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          movement_pattern:movement_patterns(*)
        `,
        )
        .or(`name.ilike.%${query}%,muscle_group.ilike.%${query}%`)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao pesquisar exercícios:', error);
      throw error;
    }
  }
}

export const exerciseService = new ExerciseService();
