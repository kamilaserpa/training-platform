// Test to check actual enum values in database
import { supabase } from './src/lib/supabase.js';

async function checkEnumValues() {
  try {
    console.log('🔍 Checking what enum values actually exist...');
    
    // Query to get enum values from the database
    const { data, error } = await supabase
      .rpc('get_enum_values', { enum_name: 'block_type' });
    
    if (error) {
      console.log('⚠️ RPC call failed:', error);
      
      // Alternative: try to query information_schema
      const { data: enumData, error: enumError } = await supabase
        .from('pg_enum')
        .select('enumlabel')
        .eq('enumtypid', 'block_type::regtype::oid');
      
      if (enumError) {
        console.log('❌ Could not query enum values:', enumError);
      } else {
        console.log('✅ Found enum values:', enumData);
      }
    } else {
      console.log('✅ Enum values from RPC:', data);
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
  
  process.exit(0);
}

checkEnumValues();