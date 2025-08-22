#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'env.local') });

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration. Please check env.local file.');
    process.exit(1);
  }
  
  console.log('📡 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test connection by trying to create a simple table
    console.log('🔍 Testing connection...');
    
    // Create users table
    console.log('🔧 Creating users table...');
    try {
      const { error: userTableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (userTableError && userTableError.message.includes('does not exist')) {
        console.log('📋 Users table does not exist, will create it...');
      } else {
        console.log('✅ Users table already exists');
      }
    } catch (err) {
      console.log('📋 Users table does not exist, will create it...');
    }
    
    // Create folders table
    console.log('🔧 Creating folders table...');
    try {
      const { error: folderTableError } = await supabase
        .from('folders')
        .select('id')
        .limit(1);
      
      if (folderTableError && folderTableError.message.includes('does not exist')) {
        console.log('📋 Folders table does not exist, will create it...');
      } else {
        console.log('✅ Folders table already exists');
      }
    } catch (err) {
      console.log('📋 Folders table does not exist, will create it...');
    }
    
    // Create files table
    console.log('🔧 Creating files table...');
    try {
      const { error: fileTableError } = await supabase
        .from('files')
        .select('id')
        .limit(1);
      
      if (fileTableError && fileTableError.message.includes('does not exist')) {
        console.log('📋 Files table does not exist, will create it...');
      } else {
        console.log('✅ Files table already exists');
      }
    } catch (err) {
      console.log('📋 Files table does not exist, will create it...');
    }
    
    // Create storage_usage table
    console.log('🔧 Creating storage_usage table...');
    try {
      const { error: storageTableError } = await supabase
        .from('storage_usage')
        .select('user_id')
        .limit(1);
      
      if (storageTableError && storageTableError.message.includes('does not exist')) {
        console.log('📋 Storage usage table does not exist, will create it...');
      } else {
        console.log('✅ Storage usage table already exists');
      }
    } catch (err) {
      console.log('📋 Storage usage table does not exist, will create it...');
    }
    
    console.log('⚠️  Tables need to be created manually in Supabase SQL Editor');
    console.log('📝 Please run the following SQL in your Supabase dashboard:');
    console.log('');
    console.log('1. Go to: https://zkgqoeaszrwszzynxazo.supabase.co');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the contents of scripts/setup-supabase-dev.sql');
    console.log('4. Then run the contents of scripts/init-root-folder.sql');
    console.log('');
    console.log('🚀 After running the SQL scripts, your API should work correctly!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(console.error);
