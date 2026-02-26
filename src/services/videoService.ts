// Service para gerenciar vídeos da biblioteca
import { supabase } from '../lib/supabase';
import type {
    CreateVideoDTO,
    UpdateVideoDTO,
    Video,
    VideoFilters,
} from '../types/database.types';

class VideoService {
  /**
   * Buscar todos os vídeos com filtros opcionais
   */
  async getVideos(filters?: VideoFilters): Promise<Video[]> {
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros

      if (filters?.level) {
        query = query.eq('level', filters.level);
      }

      if (filters?.plane) {
        query = query.eq('plane', filters.plane);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.genre) {
        query = query.eq('genre', filters.genre);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.overrideTypes<Video[], { merge: false }>();

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      throw error;
    }
  }

  /**
   * Buscar vídeo por ID
   */
  async getVideoById(id: string): Promise<Video | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single()
        .overrideTypes<Video, { merge: false }>();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
      throw error;
    }
  }

  /**
   * Buscar vídeos usados em prescrições de um exercício específico.
   * Fonte: exercise_prescriptions.video_id (vídeo escolhido ao adicionar exercício em um treino).
   * Para a tela "Exercícios com Vídeos" use exerciseVideoService.getVideosByExerciseId(), que usa a tabela exercise_videos.
   */
  async getVideosByExerciseId(exerciseId: string): Promise<Video[]> {
    try {
      // Buscar video_ids das prescrições deste exercício
      const { data: prescriptions, error: prescError } = await supabase
        .from('exercise_prescriptions')
        .select('video_id')
        .eq('exercise_id', exerciseId)
        .not('video_id', 'is', null)
        .overrideTypes<Array<{ video_id: string | null }>, { merge: false }>();

      if (prescError) throw prescError;
      if (!prescriptions || prescriptions.length === 0) return [];

      const videoIds = Array.from(
        new Set(prescriptions.map((p) => p.video_id).filter((id): id is string => !!id))
      );

      // Buscar os vídeos
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds)
        .order('created_at', { ascending: false })
        .overrideTypes<Video[], { merge: false }>();

      if (videoError) throw videoError;
      return videos || [];
    } catch (error) {
      console.error('Erro ao buscar vídeos do exercício:', error);
      throw error;
    }
  }

  /**
   * Criar novo vídeo
   */
  async createVideo(video: CreateVideoDTO): Promise<Video> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          ...video,
          created_by: user.id,
        })
        .select('*')
        .single()
        .overrideTypes<Video, { merge: false }>();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      throw error;
    }
  }

  /**
   * Atualizar vídeo
   */
  async updateVideo(id: string, updates: UpdateVideoDTO): Promise<Video> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()
        .overrideTypes<Video, { merge: false }>();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  /**
   * Deletar vídeo
   */
  async deleteVideo(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de vídeos
   */
  async getVideoStats(): Promise<{
    totalCount: number;
    platformCount: number;
    personalCount: number;
    totalSizeMB: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('source, file_size_kb')
        .overrideTypes<Array<Pick<Video, 'source' | 'file_size_kb'>>, { merge: false }>();

      if (error) throw error;

      const totalCount = data?.length || 0;
      const platformCount = data?.filter(v => v.source === 'platform').length || 0;
      const personalCount = data?.filter(v => v.source === 'personal').length || 0;
      const totalSizeKB = data?.reduce((sum, v) => sum + (v.file_size_kb || 0), 0) || 0;

      return {
        totalCount,
        platformCount,
        personalCount,
        totalSizeMB: Math.round(totalSizeKB / 1024 * 100) / 100,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Buscar tags únicas de todos os vídeos (para autocomplete)
   */
  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('tags')
        .overrideTypes<Array<Pick<Video, 'tags'>>, { merge: false }>();

      if (error) throw error;

      const allTags = data?.flatMap(v => v.tags || []) || [];
      return Array.from(new Set(allTags)).sort();
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      throw error;
    }
  }
}

export const videoService = new VideoService();
