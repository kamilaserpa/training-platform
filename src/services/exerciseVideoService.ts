/**
 * Serviço para relação exercício ↔ vídeo (tabela exercise_videos).
 * Permite vincular vídeos a exercícios e fazer CRUD da relação.
 *
 * Requer no Supabase a tabela:
 *   exercise_videos (id uuid PK, exercise_id uuid FK exercises, video_id uuid FK videos,
 *                   order_index int default 0, created_at timestamptz,
 *                   UNIQUE(exercise_id, video_id))
 *   com RLS e políticas conforme o projeto.
 */
import { supabase } from '../lib/supabase';
import type { ExerciseVideo, Video } from '../types/database.types';

class ExerciseVideoService {
  /**
   * Lista todos os vínculos com vídeo carregado, agrupados por exercise_id.
   * Útil para a tela de listagem que exibe vários exercícios.
   */
  async getAllGroupedByExerciseId(): Promise<Record<string, ExerciseVideo[]>> {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select(
        `
        id,
        exercise_id,
        video_id,
        order_index,
        created_at,
        video:videos(*)
      `
      )
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar vínculos exercício-vídeo:', error);
      throw error;
    }

    const rows = (data || []) as ExerciseVideo[];
    const grouped: Record<string, ExerciseVideo[]> = {};
    for (const row of rows) {
      const key = row.exercise_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    return grouped;
  }

  /**
   * Lista vínculos apenas dos exercícios cujos IDs são passados.
   * Garante que os vídeos exibidos venham somente da tabela exercise_videos.
   * (A regra de quais exercícios carregar — criados pelo usuário ou por owners — fica na página.)
   */
  async getGroupedByExerciseIds(exerciseIds: string[]): Promise<Record<string, ExerciseVideo[]>> {
    if (exerciseIds.length === 0) return {};

    const { data, error } = await supabase
      .from('exercise_videos')
      .select(
        `
        id,
        exercise_id,
        video_id,
        order_index,
        created_at,
        video:videos(*)
      `
      )
      .in('exercise_id', exerciseIds)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar vínculos exercício-vídeo:', error);
      throw error;
    }

    const rows = (data || []) as ExerciseVideo[];
    const grouped: Record<string, ExerciseVideo[]> = {};
    for (const row of rows) {
      const key = row.exercise_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    return grouped;
  }

  /**
   * Lista todos os vínculos de um exercício, com o vídeo carregado.
   */
  async getByExerciseId(exerciseId: string): Promise<ExerciseVideo[]> {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select(
        `
        id,
        exercise_id,
        video_id,
        order_index,
        created_at,
        video:videos(*)
      `
      )
      .eq('exercise_id', exerciseId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar vídeos do exercício:', error);
      throw error;
    }

    return (data || []) as ExerciseVideo[];
  }

  /**
   * Retorna apenas os vídeos vinculados a um exercício (para exibição).
   */
  async getVideosByExerciseId(exerciseId: string): Promise<Video[]> {
    const rows = await this.getByExerciseId(exerciseId);
    return rows
      .map((r) => r.video)
      .filter((v): v is Video => !!v);
  }

  /**
   * Vincula um vídeo a um exercício. Idempotente: se já existir, retorna o existente.
   */
  async link(exerciseId: string, videoId: string, orderIndex = 0): Promise<ExerciseVideo> {
    const { data, error } = await supabase
      .from('exercise_videos')
      .insert({
        exercise_id: exerciseId,
        video_id: videoId,
        order_index: orderIndex,
      })
      .select(
        `
        id,
        exercise_id,
        video_id,
        order_index,
        created_at,
        video:videos(*)
      `
      )
      .single();

    if (error) {
      // Conflito único = já vinculado
      if (error.code === '23505') {
        const existing = await this.getByExerciseId(exerciseId);
        const found = existing.find((ev) => ev.video_id === videoId);
        if (found) return found;
      }
      console.error('Erro ao vincular vídeo ao exercício:', error);
      throw error;
    }

    return data as ExerciseVideo;
  }

  /**
   * Remove o vínculo pelo id do registro em exercise_videos.
   */
  async unlinkById(id: string): Promise<void> {
    const { error } = await supabase.from('exercise_videos').delete().eq('id', id);

    if (error) {
      console.error('Erro ao desvincular vídeo do exercício:', error);
      throw error;
    }
  }

  /**
   * Remove o vínculo entre um exercício e um vídeo específico.
   */
  async unlink(exerciseId: string, videoId: string): Promise<void> {
    const { data: rows, error: findError } = await supabase
      .from('exercise_videos')
      .select('id')
      .eq('exercise_id', exerciseId)
      .eq('video_id', videoId);

    if (findError) {
      console.error('Erro ao buscar vínculo:', findError);
      throw findError;
    }

    const id = rows?.[0]?.id;
    if (!id) return;
    await this.unlinkById(id);
  }

  /**
   * Atualiza a ordem do vínculo (opcional, para UI de reordenar).
   */
  async updateOrder(id: string, orderIndex: number): Promise<ExerciseVideo> {
    const { data, error } = await supabase
      .from('exercise_videos')
      .update({ order_index: orderIndex })
      .eq('id', id)
      .select(
        `
        id,
        exercise_id,
        video_id,
        order_index,
        created_at,
        video:videos(*)
      `
      )
      .single();

    if (error) {
      console.error('Erro ao atualizar ordem do vínculo:', error);
      throw error;
    }

    return data as ExerciseVideo;
  }
}

export const exerciseVideoService = new ExerciseVideoService();
