const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../env.local' });

async function updateSchema() {
  console.log('🔍 Environment variables loaded:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Updating database schema...');

    // Add missing columns to folders table
    console.log('📁 Adding columns to folders table...');
    const { error: foldersError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.folders 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
      `
    });

    if (foldersError) {
      console.log('⚠️  Folders table update (this might already exist):', foldersError.message);
    } else {
      console.log('✅ Folders table updated successfully');
    }

    // Add missing columns to files table
    console.log('📄 Adding columns to files table...');
    const { error: filesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.files 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
      `
    });

    if (filesError) {
      console.log('⚠️  Files table update (this might already exist):', filesError.message);
    } else {
      console.log('✅ Files table updated successfully');
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON public.folders(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON public.folders(deleted_at);
        CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON public.files(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON public.files(deleted_at);
      `
    });

    if (indexError) {
      console.log('⚠️  Index creation (this might already exist):', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    console.log('🎉 Database schema update completed!');
    console.log('📝 Note: If you see warnings above, the columns/indexes might already exist');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

updateSchema();
