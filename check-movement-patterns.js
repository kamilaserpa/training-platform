const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nwcsyvghonvlzrwwhhve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y3N5dmdob252bHpyd3doaHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDU0NzUsImV4cCI6MjA1MTUyMTQ3NX0.LZOzlKWQDfH2aRO2j_YT_bEWE6hHjjCL-ItjAKP1WpQ'
);

async function checkTables() {
  console.log('🔍 Verificando estrutura das tabelas relacionadas a padrões de movimento...');
  
  // Verificar se a tabela movement_patterns existe
  try {
    const { data: movPatterns, error: mpError } = await supabase
      .from('movement_patterns')
      .select('*')
      .limit(5);
      
    if (mpError) {
      console.log('❌ Tabela movement_patterns não existe:', mpError.message);
    } else {
      console.log('✅ Tabela movement_patterns existe:', movPatterns.length, 'registros');
      if (movPatterns.length > 0) {
        console.log('📋 Primeiro registro:', movPatterns[0]);
      }
    }
  } catch (e) {
    console.log('❌ Erro ao acessar movement_patterns:', e.message);
  }
  
  // Verificar se a tabela training_block_movement_patterns existe
  try {
    const { data: blockPatterns, error: bpError } = await supabase
      .from('training_block_movement_patterns')
      .select('*')
      .limit(5);
      
    if (bpError) {
      console.log('❌ Tabela training_block_movement_patterns não existe:', bpError.message);
    } else {
      console.log('✅ Tabela training_block_movement_patterns existe:', blockPatterns.length, 'registros');
    }
  } catch (e) {
    console.log('❌ Erro ao acessar training_block_movement_patterns:', e.message);
  }

  // Verificar estrutura atual dos treinos com week_focus
  try {
    const { data: trainings, error: tError } = await supabase
      .from('trainings')
      .select(`
        id,
        name,
        training_week:training_weeks(
          name,
          week_focus:week_focuses(
            name,
            description
          )
        )
      `)
      .limit(3);
      
    if (tError) {
      console.log('❌ Erro ao buscar treinos com week_focus:', tError.message);
    } else {
      console.log('✅ Treinos com week_focus:', JSON.stringify(trainings, null, 2));
    }
  } catch (e) {
    console.log('❌ Erro geral:', e.message);
  }
}

checkTables().catch(console.error);