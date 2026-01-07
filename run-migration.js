import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nwcsyvghonvlzrwwhhve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y3N5dmdob252bHpyd3doaHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDU0NzUsImV4cCI6MjA1MTUyMTQ3NX0.LZOzlKWQDfH2aRO2j_YT_bEWE6hHjjCL-ItjAKP1WpQ'
);

async function executeMigration() {
  console.log('🔧 Executando migration para adicionar movement_pattern_id à tabela trainings...');
  
  try {
    // Primeiro vamos verificar se a coluna já existe
    const { data: existingColumns, error: checkError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'trainings' 
        AND column_name = 'movement_pattern_id';
      `
    });
    
    if (checkError) {
      console.log('❌ Erro ao verificar coluna existente:', checkError.message);
    } else if (existingColumns && existingColumns.length > 0) {
      console.log('✅ Coluna movement_pattern_id já existe na tabela trainings');
      return;
    }
    
    // Executar a migration
    const { data, error } = await supabase.rpc('sql', {
      query: `
        -- Adicionar coluna movement_pattern_id à tabela trainings
        ALTER TABLE trainings ADD COLUMN movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL;
        
        -- Criar índice para melhor performance  
        CREATE INDEX IF NOT EXISTS idx_trainings_movement_pattern ON trainings(movement_pattern_id);
        
        SELECT 'Migration executada com sucesso' as status;
      `
    });
    
    if (error) {
      console.log('❌ Erro na migration:', error);
    } else {
      console.log('✅ Migration executada com sucesso!', data);
    }
    
  } catch (e) {
    console.log('❌ Erro geral:', e.message);
  }
}

executeMigration().catch(console.error);