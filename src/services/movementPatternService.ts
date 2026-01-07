// Serviço para gerenciar padrões de movimento
import { supabase, useMock } from '../lib/supabase';
import type { MovementPattern } from '../types/database.types';

// Mock data para desenvolvimento
const mockMovementPatterns: MovementPattern[] = [
  {
    id: '1',
    name: 'Agachar',
    description: 'Movimentos que envolvem flexão de joelho e quadril',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Empurrar Horizontal',
    description: 'Movimentos de empurrar no plano horizontal',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Puxar Vertical',
    description: 'Movimentos de puxar no plano vertical',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Empurrar Vertical',
    description: 'Movimentos de empurrar no plano vertical',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Puxar Horizontal',
    description: 'Movimentos de puxar no plano horizontal',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Dobrar (Dobradiça de Quadril)',
    description: 'Movimentos de flexão de quadril com joelhos estendidos',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Locomoção',
    description: 'Movimentos de deslocamento corporal',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Rotação',
    description: 'Movimentos que envolvem rotação do tronco',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '9',
    name: 'Carregar',
    description: 'Movimentos de transporte de carga',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    name: 'Anti-Movimento',
    description: 'Exercícios de estabilização e resistência ao movimento',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

class MovementPatternService {
  async getAllMovementPatterns(): Promise<MovementPattern[]> {
    if (useMock) {
      console.log('🎭 [MovementPatternService] Usando dados mockados');
      return mockMovementPatterns;
    }

    console.log('🔄 [MovementPatternService] Iniciando busca de padrões no Supabase...');

    try {
      const { data, error } = await supabase.from('movement_patterns').select('*').order('name');

      if (error) {
        console.error('❌ [MovementPatternService] Erro no Supabase:', error);
        throw error;
      }

      console.log(`✅ [MovementPatternService] Encontrados ${data?.length || 0} padrões`);
      return data || [];
    } catch (error: any) {
      console.error('❌ [MovementPatternService] Erro ao buscar padrões:', error);
      
      // Log detalhado do erro
      if (error.code) console.error('   Código:', error.code);
      if (error.message) console.error('   Mensagem:', error.message);
      if (error.details) console.error('   Detalhes:', error.details);
      
      throw error;
    }
  }

  async getMovementPatternById(id: string): Promise<MovementPattern | null> {
    if (useMock) {
      return mockMovementPatterns.find((mp) => mp.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('movement_patterns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ [MovementPatternService] Erro ao buscar padrão:', error);
      throw error;
    }
  }

  async createMovementPattern(name: string, description?: string): Promise<MovementPattern> {
    if (useMock) {
      console.log('🎭 [MovementPatternService] Create simulado para:', name);
      const newPattern: MovementPattern = {
        id: `mock-${Date.now()}`,
        name,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockMovementPatterns.push(newPattern);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('✅ [MovementPatternService] Padrão criado (mock):', newPattern);
      return newPattern;
    }

    try {
      const { data, error } = await supabase
        .from('movement_patterns')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [MovementPatternService] Padrão criado:', data);
      return data;
    } catch (error) {
      console.error('❌ [MovementPatternService] Erro ao criar padrão:', error);
      throw error;
    }
  }

  async updateMovementPattern(id: string, name: string, description?: string): Promise<MovementPattern> {
    if (useMock) {
      console.log('🎭 [MovementPatternService] Update simulado para:', id);
      const index = mockMovementPatterns.findIndex((mp) => mp.id === id);
      if (index !== -1) {
        mockMovementPatterns[index] = {
          ...mockMovementPatterns[index],
          name,
          description: description || null,
          updated_at: new Date().toISOString(),
        };
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('✅ [MovementPatternService] Padrão atualizado (mock):', mockMovementPatterns[index]);
        return mockMovementPatterns[index];
      }
      throw new Error('Padrão não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('movement_patterns')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [MovementPatternService] Padrão atualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ [MovementPatternService] Erro ao atualizar padrão:', error);
      throw error;
    }
  }

  async deleteMovementPattern(id: string): Promise<void> {
    if (useMock) {
      console.log('🎭 [MovementPatternService] Delete simulado para:', id);
      const index = mockMovementPatterns.findIndex((mp) => mp.id === id);
      if (index !== -1) {
        const deleted = mockMovementPatterns.splice(index, 1);
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('✅ [MovementPatternService] Padrão deletado (mock):', deleted[0]);
      }
      return;
    }

    try {
      const { error } = await supabase.from('movement_patterns').delete().eq('id', id);

      if (error) throw error;

      console.log('✅ [MovementPatternService] Padrão deletado:', id);
    } catch (error) {
      console.error('❌ [MovementPatternService] Erro ao deletar padrão:', error);
      throw error;
    }
  }
}

export const movementPatternService = new MovementPatternService();
