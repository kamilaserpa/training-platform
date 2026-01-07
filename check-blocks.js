// Simple query to see existing training blocks and their types
import { supabase } from './src/lib/supabase.js';

async function checkExistingBlocks() {
  try {
    console.log('🔍 Checking existing training blocks...');
    
    const { data, error } = await supabase
      .from('training_blocks')
      .select('name, block_type')
      .limit(10);
    
    if (error) {
      console.log('❌ Error querying training_blocks:', error);
    } else {
      console.log('✅ Existing training blocks:', data);
      if (data && data.length > 0) {
        const uniqueTypes = [...new Set(data.map(block => block.block_type))];
        console.log('🔍 Unique block types found:', uniqueTypes);
      } else {
        console.log('⚠️ No existing training blocks found');
      }
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkExistingBlocks();