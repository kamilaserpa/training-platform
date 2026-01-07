// Simple test to check enum values
import { supabase } from './src/lib/supabase.js';

async function testMinimal() {
  console.log('🔍 Testing minimal block creation...');
  
  try {
    // Get auth user first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ No authenticated user');
      return;
    }
    
    console.log('✅ Authenticated as:', user.id);
    
    // Test with a simple training block
    const testBlock = {
      training_id: '00000000-1111-2222-3333-444444444444', // fake ID
      name: 'Test Block',
      block_type: 'AQUECIMENTO',
      order_index: 1
    };
    
    console.log('📤 Attempting to create block:', testBlock);
    
    const { data, error } = await supabase
      .from('training_blocks')
      .insert(testBlock)
      .select('*');
    
    if (error) {
      console.log('❌ Database error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);
    } else {
      console.log('✅ Block created successfully:', data);
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

testMinimal();