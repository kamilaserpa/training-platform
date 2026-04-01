// Serviço para gerenciar exercícios
import { supabase, useMock } from '../lib/supabase';
import type { CreateExerciseDTO, Exercise, Video } from '../types/database.types';

export type ExerciseLiteForMatching = Pick<Exercise, 'id' | 'name'> & {
  movement_pattern?: { name: string } | null;
};

export type ExerciseLiteForSelector = Pick<Exercise, 'id' | 'name' | 'tags' | 'video_id'> & {
  movement_pattern?: { name: string } | null;
};

export type ExerciseForMediaList = Pick<
  Exercise,
  'id' | 'name' | 'tags' | 'video_id' | 'created_by' | 'created_at' | 'updated_at'
> & {
  movement_pattern?: { name: string } | null;
  video?: Pick<Video, 'id' | 'title' | 'storage_path' | 'description' | 'thumbnail_path'> | null;
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
      const { data, error } = await this.withTimeout(
        supabase
          .from('exercises')
          .select(
            `
            id,
            name,
            movement_pattern:movement_patterns(name)
          `,
          )
          .order('name')
          .overrideTypes<ExerciseLiteForMatching[], { merge: false }>(),
        60000,
        'carregando exercícios (lite para matching)'
      );

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios (lite):', error);
      throw error;
    }
  }

  async getExercisesLiteForSelector(): Promise<ExerciseLiteForSelector[]> {
    if (useMock) {
      return mockExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        tags: ex.tags ?? undefined,
        video_id: (ex as any).video_id ?? null,
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
          tags,
          video_id,
          movement_pattern:movement_patterns(name)
        `,
        )
        .order('name')
        .overrideTypes<ExerciseLiteForSelector[], { merge: false }>();

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios (selector lite):', error);
      throw error;
    }
  }

  /**
   * Versão lite (para selector): exercícios criados pelo usuário logado.
   */
  async getExercisesLiteForSelectorCreatedByUser(userId: string): Promise<ExerciseLiteForSelector[]> {
    if (useMock) {
      return (await this.getExercisesLiteForSelector()).filter((ex: any) => ex.created_by === userId);
    }

    const { data, error } = await this.withTimeout(
      supabase
        .from('exercises')
        .select(
          `
          id,
          name,
          tags,
          video_id,
          movement_pattern:movement_patterns(name)
        `,
        )
        .eq('created_by', userId)
        .order('name')
        .overrideTypes<ExerciseLiteForSelector[], { merge: false }>(),
      25000,
      'carregando exercícios (selector lite: meus)'
    );

    if (error) throw error;
    return data || [];
  }

  /**
   * Versão lite (para selector): exercícios do app (criadores owners ativos), excluindo os do usuário.
   * Usa join com `users` via PostgREST para filtrar `role` e `active`.
   */
  async getExercisesLiteForSelectorCreatedByOwnersExceptUser(userId: string): Promise<ExerciseLiteForSelector[]> {
    if (useMock) {
      return (await this.getExercisesLiteForSelector()).filter((ex: any) => ex.created_by !== userId);
    }

    const { data, error } = await this.withTimeout(
      supabase
        .from('exercises')
        .select(
          `
          id,
          name,
          tags,
          video_id,
          movement_pattern:movement_patterns(name),
          creator:users!created_by(role, active)
        `,
        )
        .neq('created_by', userId)
        .eq('creator.role', 'owner')
        .eq('creator.active', true)
        .order('name')
        .overrideTypes<any[], { merge: false }>(),
      25000,
      'carregando exercícios (selector lite: app)'
    );

    if (error) throw error;
    return (data || []).map((row: any) => {
      const { creator, ...exercise } = row;
      return exercise;
    }) as ExerciseLiteForSelector[];
  }

  /**
   * Versão lite (para selector): união de "meus" + "exercícios do app (owners)".
   * Útil para TreinoForm/AddExerciseModal sem duplicar lógica em componentes.
   */
  async getExercisesLiteForSelectorUserAndApp(userId: string): Promise<ExerciseLiteForSelector[]> {
    const results = await Promise.allSettled([
      this.getExercisesLiteForSelectorCreatedByUser(userId),
      this.getExercisesLiteForSelectorCreatedByOwnersExceptUser(userId),
    ]);

    const mine = results[0].status === 'fulfilled' ? results[0].value : [];
    const app = results[1].status === 'fulfilled' ? results[1].value : [];

    if (results[0].status === 'rejected') {
      console.warn('Falha ao carregar exercícios do usuário (selector lite).', results[0].reason);
    }
    if (results[1].status === 'rejected') {
      console.warn('Falha ao carregar exercícios do app (selector lite).', results[1].reason);
    }
    const byId = new Map<string, ExerciseLiteForSelector>();
    for (const ex of [...mine, ...app]) byId.set(ex.id, ex);
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
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
          movement_pattern:movement_patterns(*),
          video:videos!exercises_video_id_fkey(*)
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

  /**
   * Exercícios criados pelo usuário logado.
   */
  async getExercisesCreatedByUser(userId: string): Promise<Exercise[]> {
    if (useMock) {
      return mockExercises.filter((ex) => ex.created_by === userId);
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          movement_pattern:movement_patterns(*),
          video:videos!exercises_video_id_fkey(*)
        `,
        )
        .eq('created_by', userId)
        .order('name');

      if (error) throw error;
      return (data || []) as Exercise[];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios do usuário:', error);
      throw error;
    }
  }

  /**
   * Exercícios (listagem com mídia) criados pelo usuário logado.
   * Versão enxuta para performance em mobile (evita `*` + embeds grandes).
   */
  async getExercisesForMediaListCreatedByUser(userId: string): Promise<ExerciseForMediaList[]> {
    if (useMock) {
      return mockExercises
        .filter((ex) => ex.created_by === userId)
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          tags: ex.tags ?? undefined,
          video_id: (ex as any).video_id ?? null,
          created_by: ex.created_by,
          created_at: ex.created_at,
          updated_at: ex.updated_at,
          movement_pattern: ex.movement_pattern?.name ? { name: ex.movement_pattern.name } : null,
          video: (ex as any).video ?? null,
        }));
    }

    const { data, error } = await this.withTimeout(
      supabase
        .from('exercises')
        .select(
          `
          id,
          name,
          tags,
          video_id,
          created_by,
          created_at,
          updated_at,
          movement_pattern:movement_patterns(name),
          video:videos!exercises_video_id_fkey(id, title, storage_path, description, thumbnail_path)
        `,
        )
        .eq('created_by', userId)
        .order('name')
        .overrideTypes<ExerciseForMediaList[], { merge: false }>(),
      20000,
      'carregando exercícios (mídia: meus)'
    );

    if (error) throw error;
    return data || [];
  }

  /**
   * Exercícios do app (criados por usuários owners), excluindo os do usuário logado.
   *
   * Importante: usa filtro em tabela relacionada (`users`) via PostgREST:
   * - `creator:users!created_by(role, active)`
   * - filtros: `creator.role = owner` e `creator.active = true`
   */
  async getExercisesCreatedByOwnersExceptUser(userId: string): Promise<Exercise[]> {
    if (useMock) {
      return mockExercises.filter((ex) => ex.created_by !== userId);
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          *,
          movement_pattern:movement_patterns(*),
          creator:users!created_by(role, active),
          video:videos!exercises_video_id_fkey(*)
        `,
        )
        .neq('created_by', userId)
        .eq('creator.role', 'owner')
        .eq('creator.active', true)
        .order('name');

      if (error) throw error;

      // Remover o objeto embedado "creator" para manter o tipo Exercise
      return (data || []).map((row: any) => {
        const { creator, ...exercise } = row;
        return exercise;
      }) as Exercise[];
    } catch (error: any) {
      console.error('Erro ao buscar exercícios do app (owners):', error);
      throw error;
    }
  }

  /**
   * Exercícios (listagem com mídia) do app (criadores owners ativos), excluindo os do usuário.
   * Versão enxuta para performance em mobile (evita `*` + embeds grandes).
   */
  async getExercisesForMediaListCreatedByOwnersExceptUser(userId: string): Promise<ExerciseForMediaList[]> {
    if (useMock) {
      return mockExercises
        .filter((ex) => ex.created_by !== userId)
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          tags: ex.tags ?? undefined,
          video_id: (ex as any).video_id ?? null,
          created_by: ex.created_by,
          created_at: ex.created_at,
          updated_at: ex.updated_at,
          movement_pattern: ex.movement_pattern?.name ? { name: ex.movement_pattern.name } : null,
          video: (ex as any).video ?? null,
        }));
    }

    const { data, error } = await this.withTimeout(
      supabase
        .from('exercises')
        .select(
          `
          id,
          name,
          tags,
          video_id,
          created_by,
          created_at,
          updated_at,
          movement_pattern:movement_patterns(name),
          creator:users!created_by(role, active),
          video:videos!exercises_video_id_fkey(id, title, storage_path, description, thumbnail_path)
        `,
        )
        .neq('created_by', userId)
        .eq('creator.role', 'owner')
        .eq('creator.active', true)
        .order('name')
        .overrideTypes<any[], { merge: false }>(),
      20000,
      'carregando exercícios (mídia: app)'
    );

    if (error) throw error;

    return (data || []).map((row: any) => {
      const { creator, ...exercise } = row;
      return exercise;
    }) as ExerciseForMediaList[];
  }

  /**
   * Exercícios criados pelo usuário logado OU por usuários com role 'owner' (tabela users).
   * Mantido por compatibilidade: agrega "meus" + "owners do app" (exceto o próprio usuário).
   */
  async getExercisesCreatedByUserOrOwners(userId: string): Promise<Exercise[]> {
    const [mine, app] = await Promise.all([
      this.getExercisesCreatedByUser(userId),
      this.getExercisesCreatedByOwnersExceptUser(userId),
    ]);

    const byId = new Map<string, Exercise>();
    for (const ex of [...mine, ...app]) byId.set(ex.id, ex);
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
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
          movement_pattern:movement_patterns(*),
          video:videos!exercises_video_id_fkey(*)
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
      // Importante: timeout/erro aqui não deve abortar a criação — fazemos fallback para getUser().
      let sessionUser: { id: string } | null = null;
      try {
        const {
          data: { session },
          error: sessionError,
        } = await this.withTimeout(supabase.auth.getSession(), 5000, 'obtendo sessão');

        sessionUser = session?.user ?? null;
        if (sessionError) {
          console.warn('Aviso ao obter sessão (createExercise):', sessionError);
        }
      } catch (e) {
        console.warn('Aviso: timeout/erro ao obter sessão (createExercise). Usando fallback getUser().', e);
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
            movement_pattern:movement_patterns(*),
            video:videos!exercises_video_id_fkey(*)
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
          movement_pattern:movement_patterns(*),
          video:videos!exercises_video_id_fkey(*)
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
