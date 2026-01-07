// Test script to check the actual database schema
import { supabase } from './src/lib/supabase.js';

async function checkDatabaseSchema() {
  console.log('🔍 Checking actual database schema for exercises table...');
  
  // Try to get a single exercise to see the actual structure
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying exercises:', error);
    } else {
      console.log('✅ Sample exercise data:', data);
      if (data && data[0]) {
        console.log('📋 Exercise columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.error('💥 Exception:', err);
  }
  
  process.exit(0);
}

checkDatabaseSchema();