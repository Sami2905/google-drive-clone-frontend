#!/usr/bin/env node

/**
 * Pre-build script to check for accidental use of non-public environment variables in client code
 * This script scans the src directory for any process.env usage that doesn't start with NEXT_PUBLIC_
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Safe environment variables that can be used in client code
const SAFE_ENV_VARS = new Set([
  'NODE_ENV',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_DESCRIPTION',
  'NEXT_PUBLIC_APP_VERSION',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
  'NEXT_PUBLIC_LOGROCKET_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_ENABLE_ANALYTICS',
  'NEXT_PUBLIC_ENABLE_DEBUG',
  'NEXT_PUBLIC_ENABLE_SOURCE_MAPS',
  'NEXT_PUBLIC_ENABLE_BETA_FEATURES',
  'NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES',
  'NEXT_PUBLIC_ENABLE_PWA',
  'NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT',
  'NEXT_PUBLIC_ENABLE_CACHING',
  'NEXT_PUBLIC_MAX_FILE_SIZE',
  'NEXT_PUBLIC_MAX_UPLOAD_CONCURRENT',
  'NEXT_PUBLIC_SESSION_TIMEOUT',
  'NEXT_PUBLIC_AUTH_REDIRECT_URL',
  'NEXT_PUBLIC_LOGOUT_REDIRECT_URL',
  'NEXT_PUBLIC_ENABLE_HOT_RELOAD',
  'NEXT_PUBLIC_ENABLE_ERROR_BOUNDARY',
  'NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING',
  'NEXT_PUBLIC_ENABLE_ACCESSIBILITY_FEATURES',
  'NEXT_PUBLIC_SUPPORT_EMAIL',
  'NEXT_PUBLIC_DOCS_URL',
  'NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN',
  'NEXT_PUBLIC_ENABLE_TWO_FACTOR_AUTH',
  'NEXT_PUBLIC_ENABLE_SSO',
  'NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES',
  'NEXT_PUBLIC_SHOW_GALLERY'
]);

// File extensions to scan
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Directories to skip
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'coverage']);

async function scanDirectory(dirPath, relativePath = '') {
  const results = [];
  
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const relativeEntryPath = join(relativePath, entry);
      
      try {
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          if (!SKIP_DIRS.has(entry)) {
            results.push(...await scanDirectory(fullPath, relativeEntryPath));
          }
        } else if (stats.isFile() && SCAN_EXTENSIONS.has(extname(entry))) {
          const content = await readFile(fullPath, 'utf8');
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            // Check for process.env usage
            const envMatches = line.match(/process\.env\.([A-Z0-9_]+)/g);
            if (envMatches) {
              for (const match of envMatches) {
                const envVar = match.replace('process.env.', '');
                if (!SAFE_ENV_VARS.has(envVar)) {
                  results.push({
                    file: relativeEntryPath,
                    line: lineNumber,
                    envVar,
                    lineContent: line.trim()
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not process ${relativeEntryPath}:`, error.message);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return results;
}

async function main() {
  console.log('🔍 Scanning for non-public environment variables in client code...\n');
  
  const srcPath = join(__dirname, '..', 'src');
  const violations = await scanDirectory(srcPath);
  
  if (violations.length === 0) {
    console.log('✅ No violations found! All environment variables are properly prefixed with NEXT_PUBLIC_ or are safe to use.');
    process.exit(0);
  }
  
  console.log('❌ Found violations! The following environment variables are not safe for client-side use:\n');
  
  for (const violation of violations) {
    console.log(`📁 ${violation.file}:${violation.line}`);
    console.log(`   Environment variable: ${violation.envVar}`);
    console.log(`   Line: ${violation.lineContent}\n`);
  }
  
  console.log('🚨 Build blocked! Please fix these violations:');
  console.log('   - Add NEXT_PUBLIC_ prefix for variables that should be public');
  console.log('   - Move sensitive variables to server-side code only');
  console.log('   - Use server-only imports for sensitive environment variables\n');
  
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Error during scan:', error);
  process.exit(1);
});
