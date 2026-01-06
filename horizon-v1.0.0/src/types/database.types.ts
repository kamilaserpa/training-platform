// Tipos TypeScript baseados no schema v2 do Supabase

// Enums
export type UserRole = 'owner' | 'viewer' | 'admin';
export type ShareStatus = 'private' | 'shared' | 'public';
export type BlockType =
  | 'AQUECIMENTO'
  | 'ATIVACAO_CORE'
  | 'PADRAO_MOVIMENTO'
  | 'TREINO_PRINCIPAL'
  | 'CONDICIONAMENTO_FISICO'
  | 'ALONGAMENTO';
export type WeekStatus = 'draft' | 'active' | 'completed' | 'archived';

// Tabelas principais
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WeekFocus {
  id: string;
  name: string;
  description?: string;
  color_hex: string;
  created_by?: string;
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
  muscle_group?: string;
  movement_pattern_id?: string;
  instructions?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  movement_pattern?: MovementPattern;
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
  estimated_duration_minutes?: number;
  share_status: ShareStatus;
  share_token?: string;
  share_expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  training_week?: TrainingWeek;
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
  order_index: number;
  sets: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  rpe?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  training_block?: TrainingBlock;
  exercise?: Exercise;
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
  color_hex?: string;
}

export interface UpdateWeekFocusDTO {
  name?: string;
  description?: string;
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
  estimated_duration_minutes?: number;
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
  order_index: number;
  sets: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  rpe?: number;
  notes?: string;
}

export interface CreateExerciseDTO {
  name: string;
  muscle_group?: string;
  movement_pattern_id?: string;
  instructions?: string;
  notes?: string;
}
