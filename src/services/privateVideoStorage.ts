import { supabase } from '../lib/supabase';

export interface VideoUploadResult {
  path: string;
  size: number;
  format: string;
  url?: string;
}

export interface VideoListItem {
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
}

/**
 * Serviço para gerenciar armazenamento privado de vídeos de exercícios
 *
 * Características:
 * - Bucket privado com RLS
 * - Signed URLs com expiração
 * - Suporte a MP4 e GIF
 * - Validação de tamanho
 */
export const privateVideoStorage = {
  BUCKET_NAME: 'exercise-videos',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  SIGNED_URL_EXPIRY: 86400, // 24 horas em segundos (permite treinos longos)

  /**
   * Upload de vídeo para bucket privado
   * Aceita MP4, WEBM ou GIF
   *
   * @param file - Arquivo de vídeo
   * @param videoId - ID único do vídeo (UUID)
   * @returns Informações do upload
   *
   * @example
   * const videoId = crypto.randomUUID();
   * const result = await privateVideoStorage.uploadVideo(file, videoId);
   * console.log(result.path); // 'videos/uuid.mp4'
   */
  async uploadVideo(file: File, videoId: string): Promise<VideoUploadResult> {
    // Validar tipo de arquivo
    const allowedTypes = ['video/mp4', 'video/webm', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Formato não suportado. Use MP4, WEBM ou GIF.\n' +
          'Recomendado: MP4 (10-20× menor que GIF)',
      );
    }

    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      throw new Error(
        `Arquivo muito grande (${sizeMB} MB).\n` +
          `Máximo permitido: ${this.MAX_FILE_SIZE / 1024 / 1024} MB.\n` +
          'Dica: Converta para MP4 ou comprima o vídeo.',
      );
    }

    // Determinar extensão
    const fileExt = this.getFileExtension(file);
    const filePath = `videos/${videoId}.${fileExt}`;

    console.log(`📤 Fazendo upload: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);

    // Upload para Supabase Storage
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Substitui se já existir
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    console.log('✅ Upload concluído:', filePath);

    return {
      path: filePath,
      size: file.size,
      format: fileExt,
    };
  },

  /**
   * Obter URL assinada (privada com expiração)
   *
   * @param filePath - Caminho do arquivo (ex: 'exercises/123.mp4')
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada
   *
   * @example
   * const url = await privateVideoStorage.getSignedUrl('exercises/123.mp4');
   * // URL válida por 1 hora
   */
  async getSignedUrl(filePath: string, expiresIn?: number): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn || this.SIGNED_URL_EXPIRY);

    if (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw new Error(`Erro ao gerar URL: ${error.message}`);
    }

    return data.signedUrl;
  },

  /**
   * Download de vídeo (blob)
   *
   * @param filePath - Caminho do arquivo
   * @returns Blob do vídeo
   */
  async downloadVideo(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath);

    if (error) {
      throw new Error(`Erro ao baixar vídeo: ${error.message}`);
    }

    return data;
  },

  /**
   * Deletar vídeo
   *
   * @param filePath - Caminho do arquivo
   */
  async deleteVideo(filePath: string): Promise<void> {
    const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar vídeo: ${error.message}`);
    }

    console.log('🗑️ Vídeo deletado:', filePath);
  },

  /**
   * Listar todos os vídeos de exercícios
   *
   * @returns Lista de arquivos
   */
  async listVideos(): Promise<VideoListItem[]> {
    const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list('exercises');

    if (error) {
      throw new Error(`Erro ao listar vídeos: ${error.message}`);
    }

    return data as VideoListItem[];
  },

  /**
   * Obter estatísticas de uso do storage
   *
   * @returns Estatísticas (tamanho total, contagem, etc)
   */
  async getStorageStats() {
    const files = await this.listVideos();

    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    const totalGB = totalSize / (1024 * 1024 * 1024);
    const usagePercent = (totalGB / 1.0) * 100; // 1 GB = limite free

    return {
      totalSizeBytes: totalSize,
      totalSizeGB: parseFloat(totalGB.toFixed(3)),
      totalSizeMB: parseFloat((totalSize / (1024 * 1024)).toFixed(2)),
      usagePercent: parseFloat(usagePercent.toFixed(1)),
      filesCount: files.length,
      avgSizeKB:
        files.length > 0 ? parseFloat((totalSize / files.length / 1024).toFixed(0)) : 0,
      remainingGB: parseFloat((1.0 - totalGB).toFixed(3)),
    };
  },

  /**
   * Verificar se bucket existe e está configurado
   */
  async checkBucketStatus(): Promise<boolean> {
    try {
      await this.listVideos();
      return true;
    } catch (error) {
      console.error('Bucket não encontrado ou sem permissão:', error);
      return false;
    }
  },

  /**
   * Helpers privados
   */
  getFileExtension(file: File): string {
    if (file.type === 'video/mp4') return 'mp4';
    if (file.type === 'video/webm') return 'webm';
    if (file.type === 'image/gif') return 'gif';
    return 'mp4'; // fallback
  },
};

/**
 * Cache de URLs assinadas para evitar regeneração excessiva
 */
class SignedUrlCache {
  private cache = new Map<string, { url: string; expires: number }>();

  async getOrCreate(
    filePath: string,
    expiresIn: number = privateVideoStorage.SIGNED_URL_EXPIRY,
  ): Promise<string> {
    const cached = this.cache.get(filePath);
    const now = Date.now();

    // Se cache válido (ainda não expirou), retornar
    if (cached && cached.expires > now) {
      return cached.url;
    }

    // Gerar nova URL assinada
    const signedUrl = await privateVideoStorage.getSignedUrl(filePath, expiresIn);

    // Cachear por 90% do tempo de expiração (margem de segurança)
    const cacheExpiry = now + expiresIn * 1000 * 0.9;
    this.cache.set(filePath, {
      url: signedUrl,
      expires: cacheExpiry,
    });

    return signedUrl;
  }

  clear(filePath?: string) {
    if (filePath) {
      this.cache.delete(filePath);
    } else {
      this.cache.clear();
    }
  }
}

export const signedUrlCache = new SignedUrlCache();
