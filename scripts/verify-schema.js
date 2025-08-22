#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', 'env.local') });

async function verifySchema() {
  console.log('🔍 Verifying database schema...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration. Please check env.local file.');
    process.exit(1);
  }
  
  console.log('📡 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test each table structure
    console.log('\n📋 Testing table structures...');
    
    // Test users table
    console.log('\n👤 Testing users table...');
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (userError) {
        console.log('❌ Users table error:', userError.message);
      } else {
        console.log('✅ Users table accessible');
        if (users && users.length > 0) {
          console.log('📝 Sample user columns:', Object.keys(users[0]));
        }
      }
    } catch (err) {
      console.log('❌ Users table exception:', err.message);
    }
    
    // Test folders table
    console.log('\n📁 Testing folders table...');
    try {
      const { data: folders, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .limit(1);
      
      if (folderError) {
        console.log('❌ Folders table error:', folderError.message);
      } else {
        console.log('✅ Folders table accessible');
        if (folders && folders.length > 0) {
          console.log('📝 Sample folder columns:', Object.keys(folders[0]));
        }
      }
    } catch (err) {
      console.log('❌ Folders table exception:', err.message);
    }
    
    // Test files table
    console.log('\n📄 Testing files table...');
    try {
      const { data: files, error: fileError } = await supabase
        .from('files')
        .select('*')
        .limit(1);
      
      if (fileError) {
        console.log('❌ Files table error:', fileError.message);
      } else {
        console.log('✅ Files table accessible');
        if (files && files.length > 0) {
          console.log('📝 Sample file columns:', Object.keys(files[0]));
        }
      }
    } catch (err) {
      console.log('❌ Files table exception:', err.message);
    }
    
    // Test storage_usage table
    console.log('\n💾 Testing storage_usage table...');
    try {
      const { data: storage, error: storageError } = await supabase
        .from('storage_usage')
        .select('*')
        .limit(1);
      
      if (storageError) {
        console.log('❌ Storage usage table error:', storageError.message);
      } else {
        console.log('✅ Storage usage table accessible');
        if (storage && storage.length > 0) {
          console.log('📝 Sample storage columns:', Object.keys(storage[0]));
        }
      }
    } catch (err) {
      console.log('❌ Storage usage table exception:', err.message);
    }
    
    // Test specific queries that the API uses
    console.log('\n🧪 Testing API-specific queries...');
    
    // Test getFoldersByParentId query
    console.log('\n📁 Testing getFoldersByParentId query...');
    try {
      const { data: rootFolders, error: rootError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', '916375dc-f279-4130-94c7-09f42a06fa56')
        .is('parent_id', null);
      
      if (rootError) {
        console.log('❌ Root folders query error:', rootError.message);
      } else {
        console.log('✅ Root folders query successful');
        console.log('📝 Found', rootFolders?.length || 0, 'root folders');
      }
    } catch (err) {
      console.log('❌ Root folders query exception:', err.message);
    }
    
    // Test getFilesByFolderId query
    console.log('\n📄 Testing getFilesByFolderId query...');
    try {
      const { data: rootFiles, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', '916375dc-f279-4130-94c7-09f42a06fa56')
        .eq('is_deleted', false);
      
      if (filesError) {
        console.log('❌ Root files query error:', filesError.message);
      } else {
        console.log('✅ Root files query successful');
        console.log('📝 Found', rootFiles?.length || 0, 'files');
      }
    } catch (err) {
      console.log('❌ Root files query exception:', err.message);
    }
    
    console.log('\n🎉 Schema verification completed!');
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
verifySchema().catch(console.error);
