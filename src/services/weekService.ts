// Serviço para gerenciar semanas de treino
import { supabase, useMock } from '../lib/supabase';
import type { TrainingWeek, CreateTrainingWeekDTO, WeekFocus, CreateWeekFocusDTO, UpdateWeekFocusDTO } from '../types/database.types';

// Mock data para desenvolvimento
const mockWeekFocuses: WeekFocus[] = [
  {
    id: '1',
    name: 'Hipertrofia 65%',
    description: 'Foco em hipertrofia muscular com intensidade moderada',
    color_hex: '#3B82F6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Força Máxima',
    description: 'Desenvolvimento da força máxima com cargas altas',
    color_hex: '#EF4444',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Resistência Muscular',
    description: 'Trabalho de resistência com maior volume',
    color_hex: '#10B981',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Potência',
    description: 'Desenvolvimento de potência e explosão',
    color_hex: '#F59E0B',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Deload',
    description: 'Semana de recuperação com carga reduzida',
    color_hex: '#8B5CF6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTrainingWeeks: TrainingWeek[] = [
  {
    id: '1',
    name: 'Semana 1 - Janeiro 2024',
    week_focus_id: '1',
    start_date: '2024-01-08',
    end_date: '2024-01-14',
    status: 'active',
    notes: 'Primeira semana do ciclo de hipertrofia',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    week_focus: mockWeekFocuses[0],
  },
  {
    id: '2',
    name: 'Semana 2 - Janeiro 2024',
    week_focus_id: '2',
    start_date: '2024-01-15',
    end_date: '2024-01-21',
    status: 'draft',
    notes: 'Progressão para trabalho de força',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    week_focus: mockWeekFocuses[1],
  },
  {
    id: '3',
    name: 'Semana 3 - Janeiro 2024',
    week_focus_id: '5',
    start_date: '2024-01-22',
    end_date: '2024-01-28',
    status: 'draft',
    notes: 'Semana de recuperação e preparação',
    created_by: 'mock-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    week_focus: mockWeekFocuses[4],
  },
];

class WeekService {
  // ========================
  // Week Focuses CRUD
  // ========================
  async getAllWeekFocuses(): Promise<WeekFocus[]> {
    console.log('🔄 [WeekService] Buscando focos...');
    
    if (useMock) {
      console.log('🎭 [WeekService] Usando dados mockados para focos');
      console.log('✅ [WeekService] Encontrados', mockWeekFocuses.length, 'focos mockados');
      return mockWeekFocuses;
    }

    try {
      const { data, error } = await supabase.from('week_focuses').select('*').order('name');

      if (error) throw error;

      console.log(`✅ [WeekService] ${data?.length || 0} focos`);
      return data || [];
    } catch (error) {
      console.error('❌ [WeekService] Erro ao buscar focos de semana:', error);
      throw error;
    }
  }

  async createWeekFocus(focusData: CreateWeekFocusDTO): Promise<WeekFocus> {
    console.log('🎆 [WeekService] Criando foco da semana:', focusData);
    
    if (useMock) {
      console.log('🎭 [WeekService] Usando dados mockados para criar foco');
      const newFocus: WeekFocus = {
        id: crypto.randomUUID(),
        ...focusData,
        color_hex: focusData.color_hex || '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockWeekFocuses.push(newFocus);
      console.log('✅ [WeekService] Foco mock criado:', newFocus);
      return newFocus;
    }

    try {
      // Verificar se já existe um foco com o mesmo nome
      const { data: existing, error: existingError } = await supabase
        .from('week_focuses')
        .select('*')
        .eq('name', focusData.name)
        .single();

      if (!existingError && existing) {
        console.log('⚠️ [WeekService] Foco já existe, atualizando ao invés de criar:', existing.name);
        
        // Se já existe, atualizar ao invés de criar
        const { data, error } = await supabase
          .from('week_focuses')
          .update({
            ...focusData,
            color_hex: focusData.color_hex || existing.color_hex || '#3B82F6',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Se não existe, criar novo
      const { data, error } = await supabase
        .from('week_focuses')
        .insert({
          ...focusData,
          color_hex: focusData.color_hex || '#3B82F6',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao criar foco de semana:', error);
      throw error;
    }
  }

  async updateWeekFocus(id: string, updates: UpdateWeekFocusDTO): Promise<WeekFocus> {
    console.log('🔄 [WeekService] Atualizando foco da semana:', id, 'com dados:', updates);
    
    if (useMock) {
      console.log('🎭 [WeekService] Usando dados mockados para atualizar foco');
      const index = mockWeekFocuses.findIndex((focus) => focus.id === id);
      if (index === -1) throw new Error('Foco não encontrado');

      mockWeekFocuses[index] = {
        ...mockWeekFocuses[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      console.log('✅ [WeekService] Foco mock atualizado:', mockWeekFocuses[index]);
      return mockWeekFocuses[index];
    }

    try {
      console.log('📤 [WeekService] Enviando para Supabase:', { id, updates });
      const { data, error } = await supabase
        .from('week_focuses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      console.log('📋 [WeekService] Resposta do Supabase:', { data, error });

      if (error) throw error;

      console.log('✅ [WeekService] Foco atualizado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao atualizar foco de semana:', error);
      throw error;
    }
  }

  async deleteWeekFocus(id: string): Promise<void> {
    if (useMock) {
      const index = mockWeekFocuses.findIndex((focus) => focus.id === id);
      if (index !== -1) {
        mockWeekFocuses.splice(index, 1);
      }
      return;
    }

    try {
      const { error } = await supabase.from('week_focuses').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao deletar foco de semana:', error);
      throw error;
    }
  }

  // ========================
  // Training Weeks CRUD
  // ========================

  async getAllTrainingWeeks(): Promise<TrainingWeek[]> {
    if (useMock) {
      console.log('🎭 [WeekService] Usando dados mockados para semanas');
      return mockTrainingWeeks;
    }

    try {
      const { data, error } = await supabase
        .from('training_weeks')
        .select(
          `
          *,
          week_focus:week_focuses(*),
          trainings(*)
        `,
        )
        .order('start_date', { ascending: false });

      if (error) throw error;

      console.log('✅ [WeekService] Encontradas', data?.length || 0, 'semanas de treino');
      return data || [];
    } catch (error) {
      console.error('❌ [WeekService] Erro ao buscar semanas de treino:', error);
      throw error;
    }
  }

  async getTrainingWeekById(id: string): Promise<TrainingWeek | null> {
    if (useMock) {
      return mockTrainingWeeks.find((week) => week.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('training_weeks')
        .select(
          `
          *,
          week_focus:week_focuses(*),
          trainings(*)
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao buscar semana de treino:', error);
      throw error;
    }
  }

  async createTrainingWeek(weekData: CreateTrainingWeekDTO): Promise<TrainingWeek> {
    if (useMock) {
      const weekFocus = mockWeekFocuses.find((wf) => wf.id === weekData.week_focus_id);
      const newWeek: TrainingWeek = {
        id: Math.random().toString(36).substr(2, 9),
        ...weekData,
        status: 'draft',
        created_by: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        week_focus: weekFocus,
      };
      mockTrainingWeeks.unshift(newWeek); // Adiciona no início
      return newWeek;
    }

    try {
      // Não forçar created_by - deixar o trigger preencher automaticamente
      const { data, error } = await supabase
        .from('training_weeks')
        .insert(weekData)
        .select(
          `
          *,
          week_focus:week_focuses(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao criar semana de treino:', error);
      throw error;
    }
  }

  async updateTrainingWeek(
    id: string,
    updates: Partial<CreateTrainingWeekDTO>,
  ): Promise<TrainingWeek> {
    if (useMock) {
      const index = mockTrainingWeeks.findIndex((week) => week.id === id);
      if (index === -1) throw new Error('Semana não encontrada');

      const weekFocus = updates.week_focus_id
        ? mockWeekFocuses.find((wf) => wf.id === updates.week_focus_id)
        : mockTrainingWeeks[index].week_focus;

      mockTrainingWeeks[index] = {
        ...mockTrainingWeeks[index],
        ...updates,
        updated_at: new Date().toISOString(),
        week_focus: weekFocus,
      };

      return mockTrainingWeeks[index];
    }

    try {
      const { data, error } = await supabase
        .from('training_weeks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          week_focus:week_focuses(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao atualizar semana de treino:', error);
      throw error;
    }
  }

  async deleteTrainingWeek(id: string): Promise<void> {
    if (useMock) {
      const index = mockTrainingWeeks.findIndex((week) => week.id === id);
      if (index !== -1) {
        mockTrainingWeeks.splice(index, 1);
      }
      return;
    }

    try {
      const { error } = await supabase.from('training_weeks').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao deletar semana de treino:', error);
      throw error;
    }
  }

  async updateWeekStatus(id: string, status: TrainingWeek['status']): Promise<TrainingWeek> {
    if (useMock) {
      const index = mockTrainingWeeks.findIndex((week) => week.id === id);
      if (index === -1) throw new Error('Semana não encontrada');

      mockTrainingWeeks[index] = {
        ...mockTrainingWeeks[index],
        status,
        updated_at: new Date().toISOString(),
      };

      return mockTrainingWeeks[index];
    }

    try {
      const { data, error } = await supabase
        .from('training_weeks')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          week_focus:week_focuses(*)
        `,
        )
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [WeekService] Erro ao atualizar status da semana:', error);
      throw error;
    }
  }
}

export const weekService = new WeekService();
