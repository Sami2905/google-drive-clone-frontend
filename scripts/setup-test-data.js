#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'env.local') });

async function setupTestData() {
  console.log('🚀 Setting up test data for API tests...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration. Please check env.local file.');
    process.exit(1);
  }
  
  console.log('📡 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Create test user
    console.log('👤 Creating test user...');
    try {
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: '916375dc-f279-4130-94c7-09f42a06fa56',
          email: 'test@example.com',
          name: 'Test User',
          plan: 'free'
        }, { onConflict: 'id' });
      
      if (userError) {
        console.log('⚠️  Test user creation:', userError.message);
      } else {
        console.log('✅ Test user created/updated');
      }
    } catch (err) {
      console.log('⚠️  Test user creation:', err.message);
    }
    
    // Create root folder
    console.log('📁 Creating root folder...');
    try {
      const { error: folderError } = await supabase
        .from('folders')
        .upsert({
          id: '00000000-0000-0000-0000-000000000000',
          name: 'My Drive',
          description: 'Root folder',
          parent_id: null,
          user_id: '916375dc-f279-4130-94c7-09f42a06fa56',
          path: '/',
          is_shared: false
        }, { onConflict: 'id' });
      
      if (folderError) {
        console.log('⚠️  Root folder creation:', folderError.message);
      } else {
        console.log('✅ Root folder created/updated');
      }
    } catch (err) {
      console.log('⚠️  Root folder creation:', err.message);
    }
    
    // Initialize storage usage
    console.log('💾 Initializing storage usage...');
    try {
      const { error: storageError } = await supabase
        .from('storage_usage')
        .upsert({
          user_id: '916375dc-f279-4130-94c7-09f42a06fa56',
          total_size: 0,
          file_count: 0,
          last_calculated: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (storageError) {
        console.log('⚠️  Storage usage initialization:', storageError.message);
      } else {
        console.log('✅ Storage usage initialized');
      }
    } catch (err) {
      console.log('⚠️  Storage usage initialization:', err.message);
    }
    
    // Verify setup
    console.log('🔍 Verifying setup...');
    
    // Check test user
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', '916375dc-f279-4130-94c7-09f42a06fa56')
      .single();
    
    if (userError) {
      console.log('⚠️  Test user verification failed:', userError.message);
    } else {
      console.log('✅ Test user verified:', testUser.email);
    }
    
    // Check root folder
    const { data: rootFolder, error: folderError } = await supabase
      .from('folders')
      .select('id, name, user_id')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();
    
    if (folderError) {
      console.log('⚠️  Root folder verification failed:', folderError.message);
    } else {
      console.log('✅ Root folder verified:', rootFolder.name);
    }
    
    // Check storage usage
    const { data: storageUsage, error: storageError } = await supabase
      .from('storage_usage')
      .select('user_id, total_size, file_count')
      .eq('user_id', '916375dc-f279-4130-94c7-09f42a06fa56')
      .single();
    
    if (storageError) {
      console.log('⚠️  Storage usage verification failed:', storageError.message);
    } else {
      console.log('✅ Storage usage verified:', storageUsage.total_size, 'bytes,', storageUsage.file_count, 'files');
    }
    
    console.log('🎉 Test data setup completed!');
    console.log('🚀 Your API should now work correctly.');
    console.log('📝 Run your API tests again to verify the fix.');
    
  } catch (error) {
    console.error('❌ Test data setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupTestData().catch(console.error);
