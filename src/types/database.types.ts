// Tipos TypeScript baseados no schema v2 do Supabase

// Enums
export type UserRole = 'owner' | 'viewer' | 'admin';
export type ShareStatus = 'private' | 'shared' | 'public';
export type BlockType =
  | 'MOBILIDADE_ARTICULAR'
  | 'ATIVACAO_CORE'
  | 'ATIVACAO_NEURAL'
  | 'TREINO_PRINCIPAL'
  | 'CONDICIONAMENTO_FISICO';
export type WeekStatus = 'draft' | 'active' | 'completed' | 'archived';

// Video Enums
export type VideoLevel = 'beginner' | 'intermediate' | 'advanced';
export type VideoPlane = 'frontal' | 'lateral' | 'dorsal' | 'detail';
export type VideoType = 'demo' | 'education';
export type VideoGenre = 'strength' | 'cardio' | 'mobility' | 'core' | 'balance' | 'flexibility' | 'power' | 'endurance' | 'other';
export type VideoSource = 'platform' | 'personal';

// Tabelas principais
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  owner_id?: string; // ID do owner que criou este usuário (para multi-tenancy)
  avatar_url?: string;
  active?: boolean; // Se o usuário está ativo ou não
  created_at: string;
  updated_at: string;
}

export interface WeekFocus {
  id: string;
  name: string;
  description?: string;
  intensity_percentage?: number;
  color_hex: string;
  created_at: string;
  updated_at: string;
}

export interface MovementPattern {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  movement_pattern_id?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: number;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  tags?: string[]; // Tags para categorizar exercícios
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  movement_pattern?: MovementPattern;
  videos?: Video[]; // Lista de vídeos disponíveis para este exercício
}

// Nova interface: Video
export interface Video {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  level: VideoLevel;
  plane: VideoPlane;
  type: VideoType;
  genre: VideoGenre;
  tags: string[];
  source: VideoSource;
  duration_seconds?: number;
  file_size_kb?: number;
  thumbnail_path?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingWeek {
  id: string;
  name: string;
  week_focus_id: string;
  start_date: string;
  end_date: string;
  status: WeekStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  week_focus?: WeekFocus;
  trainings?: Training[];
}

export interface Training {
  id: string;
  training_week_id: string;
  name: string;
  scheduled_date: string;
  intensity_level?: number;
  description?: string;
  internal_notes?: string;
  estimated_duration_minutes?: number;
  movement_pattern_id?: string | null;
  share_status: ShareStatus;
  share_token?: string;
  share_expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  training_week?: TrainingWeek;
  movement_pattern?: MovementPattern;
  training_blocks?: TrainingBlock[];
}

export interface TrainingBlock {
  id: string;
  training_id: string;
  name: string;
  block_type: BlockType;
  order_index: number;
  instructions?: string;
  rest_between_exercises_seconds: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  training?: Training;
  exercise_prescriptions?: ExercisePrescription[];
  movement_patterns?: MovementPattern[];
}

export interface ExercisePrescription {
  id: string;
  training_block_id: string;
  exercise_id: string;
  video_id?: string; // Vídeo específico escolhido para este treino
  order_index: number;
  sets: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  duration_seconds?: number;
  rpe?: number;
  percentage_1rm?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  training_block?: TrainingBlock;
  exercise?: Exercise;
  video?: Video; // Vídeo selecionado
}

export interface TrainingBlockMovementPattern {
  id: string;
  training_block_id: string;
  movement_pattern_id: string;
  created_at: string;
  // Relacionamentos
  training_block?: TrainingBlock;
  movement_pattern?: MovementPattern;
}

export interface UserPermission {
  id: string;
  resource_id: string;
  resource_type: 'training_week' | 'training';
  user_id: string;
  role: UserRole;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  // Relacionamentos
  user?: User;
}

// DTOs para criação/atualização
export interface CreateWeekFocusDTO {
  name: string;
  description?: string;
  intensity_percentage?: number;
  color_hex?: string;
}

export interface UpdateWeekFocusDTO {
  name?: string;
  description?: string;
  intensity_percentage?: number;
  color_hex?: string;
}

export interface CreateTrainingWeekDTO {
  name: string;
  week_focus_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface CreateTrainingDTO {
  training_week_id: string;
  name: string;
  scheduled_date: string;
  intensity_level?: number;
  description?: string;
  internal_notes?: string;
  estimated_duration_minutes?: number;
  movement_pattern_id?: string | null;
}

export interface CreateTrainingBlockDTO {
  training_id: string;
  name: string;
  block_type: BlockType;
  order_index: number;
  instructions?: string;
  rest_between_exercises_seconds?: number;
}

export interface CreateExercisePrescriptionDTO {
  training_block_id: string;
  exercise_id: string;
  video_id?: string; // Vídeo específico para este treino
  order_index: number;
  sets: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  duration_seconds?: number;
  rpe?: number;
  percentage_1rm?: number;
  notes?: string;
}

export interface CreateExerciseDTO {
  name: string;
  movement_pattern_id?: string;
  instructions?: string;
  description?: string;
  tags?: string[]; // Tags para categorizar exercícios
  muscle_groups?: string[];
}

// DTOs para Videos
export interface CreateVideoDTO {
  title: string;
  description?: string | null;
  storage_path: string;
  level?: VideoLevel;
  plane?: VideoPlane;
  type?: VideoType;
  genre?: VideoGenre;
  tags?: string[];
  source?: VideoSource;
  duration_seconds?: number;
  file_size_kb?: number;
  thumbnail_path?: string;
}

export interface UpdateVideoDTO {
  title?: string;
  description?: string;
  level?: VideoLevel;
  plane?: VideoPlane;
  type?: VideoType;
  genre?: VideoGenre;
  tags?: string[];
  duration_seconds?: number;
  thumbnail_path?: string;
}

export interface VideoFilters {
  exercise_id?: string;
  level?: VideoLevel;
  plane?: VideoPlane;
  type?: VideoType;
  genre?: VideoGenre;
  source?: VideoSource;
  tags?: string[];
  search?: string; // Busca por título ou descrição
}
