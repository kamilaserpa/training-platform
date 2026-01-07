// Test database enum values
import { supabase } from './src/lib/supabase.js';

async function testDatabase() {
  console.log('🔍 Testing database enum values...');
  
  try {
    // First, check if we can query the database
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Error querying tables:', tablesError);
    } else {
      console.log('✅ Available tables:', tables?.map(t => t.table_name));
    }
    
    // Try to get the training_blocks table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'training_blocks' });
    
    if (columnsError) {
      console.log('⚠️ Could not get columns info:', columnsError);
    }
    
    // Try a simple query to see what happens
    const { data: blocks, error: blocksError } = await supabase
      .from('training_blocks')
      .select('*')
      .limit(1);
    
    if (blocksError) {
      console.log('❌ Error querying training_blocks:', blocksError);
    } else {
      console.log('✅ Sample training blocks:', blocks);
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
  
  process.exit(0);
}

testDatabase();