import { apiClient } from './api-client';
import toast from 'react-hot-toast';

interface TestResult {
  name: string;
  success: boolean;
  data?: unknown;
  error?: Error;
}

export async function testApiEndpoints() {
  console.group('🧪 Testing API Endpoints');
  const results: TestResult[] = [];
  
  try {
    // First, authenticate with the backend
    try {
      console.group('🔐 Testing Authentication');
      const authResponse = await apiClient.testLogin();
      console.log('Authentication response:', authResponse);
      
      if (authResponse.success && authResponse.data?.token) {
        apiClient.setAuthToken(authResponse.data.token);
        results.push({
          name: 'Authentication',
          success: true,
          data: { user: authResponse.data.user }
        });
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: 'Authentication',
        success: false,
        error: new Error(errorMessage)
      });
    } finally {
      console.groupEnd();
    }

    // Test root folder contents
    try {
      console.group('📁 Testing Root Folder Contents');
      const rootResponse = await apiClient.getFolders(null);
      console.log('Root folder response:', rootResponse);
      results.push({
        name: 'Root Folder Contents',
        success: true,
        data: rootResponse
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: 'Root Folder Contents',
        success: false,
        error: new Error(errorMessage)
      });
    } finally {
      console.groupEnd();
    }

    // Test storage usage
    try {
      console.group('💾 Testing Storage Usage');
      const storageResponse = await apiClient.getStorageUsage();
      console.log('Storage usage response:', storageResponse);
      results.push({
        name: 'Storage Usage',
        success: true,
        data: storageResponse
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: 'Storage Usage',
        success: false,
        error: new Error(errorMessage)
      });
    } finally {
      console.groupEnd();
    }

    // Test folder operations
    try {
      console.group('📁 Testing Folder Operations');
      
      // Create folder
      const createResponse = await apiClient.createFolder({
        name: 'Test Folder',
        parent_id: undefined
      });
      console.log('Create folder response:', createResponse);
      results.push({
        name: 'Create Folder',
        success: true,
        data: createResponse
      });
      
      if (createResponse.success && createResponse.data) {
        const folderId = createResponse.data.id;
        
        // Ensure folderId is a string
        if (typeof folderId !== 'string') {
          throw new Error('Invalid folder ID received from create folder response');
        }

        // Get folder by ID
        const folderResponse = await apiClient.getFolderById(folderId);
        console.log('Get folder response:', folderResponse);
        results.push({
          name: 'Get Folder by ID',
          success: true,
          data: folderResponse
        });

        // Get folder contents
        const contentsResponse = await apiClient.getFolders(folderId);
        console.log('Folder contents response:', contentsResponse);
        results.push({
          name: 'Folder Contents',
          success: true,
          data: contentsResponse
        });

        // Update folder
        const updateResponse = await apiClient.updateFolder(folderId, {
          name: 'Updated Test Folder'
        });
        console.log('Update folder response:', updateResponse);
        results.push({
          name: 'Update Folder',
          success: true,
          data: updateResponse
        });

        // Delete folder
        const deleteResponse = await apiClient.deleteFolder(folderId);
        console.log('Delete folder response:', deleteResponse);
        results.push({
          name: 'Delete Folder',
          success: true,
          data: deleteResponse
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: 'Folder Operations',
        success: false,
        error: new Error(errorMessage)
      });
    } finally {
      console.groupEnd();
    }

    // Test file listing
    try {
      console.group('📄 Testing File Listing');
      const filesResponse = await apiClient.getFiles();
      console.log('Files response:', filesResponse);
      results.push({
        name: 'File Listing',
        success: true,
        data: filesResponse
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: 'File Listing',
        success: false,
        error: new Error(errorMessage)
      });
    } finally {
      console.groupEnd();
    }

    // Log test results
    console.group('📊 Test Results');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ ${successful.length} tests passed`);
    if (failed.length > 0) {
      console.log(`❌ ${failed.length} tests failed:`);
      failed.forEach(f => {
        console.log(`- ${f.name}: ${f.error?.message || 'Unknown error'}`);
      });
      throw new Error(`${failed.length} tests failed`);
    } else {
      console.log('✨ All tests passed successfully!');
      toast.success('All API tests passed!');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API tests failed:', errorMessage);
    toast.error(`API tests failed: ${errorMessage}`);
    throw error;
  } finally {
    // Clean up: logout after tests
    try {
      await apiClient.logout();
      console.log('🔓 Logged out successfully');
    } catch (logoutError: unknown) {
      const errorMessage = logoutError instanceof Error ? logoutError.message : 'Unknown error';
      console.warn('⚠️ Logout failed:', errorMessage);
    }
    console.groupEnd();
  }
  
  return results;
}
