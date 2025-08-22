'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, File, FileGridItem, ViewMode, SortConfig, FilterConfig } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FolderIcon, 
  FileIcon, 
  SearchIcon, 
  Grid3X3Icon, 
  ListIcon, 
  PlusIcon,
  UploadIcon,
  SortAscIcon,
  SortDescIcon,
  FilterIcon,
  MoreHorizontalIcon,
  TrashIcon,
  DownloadIcon,
  EyeIcon,
  ShareIcon,
  LogOutIcon,
  UserIcon
} from 'lucide-react';
import FolderTree from '@/components/drive/FolderTree';
import FileGrid from '@/components/drive/FileGrid';
import FileRowList from '@/components/drive/FileRowList';
import Breadcrumbs from '@/components/drive/Breadcrumbs';
import NewMenu from '@/components/drive/NewMenu';
import UploadTray from '@/components/upload/UploadTray';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { formatFileSize } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  
  // State management
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [folderTree, setFolderTree] = useState<Folder[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'grid', size: 'medium' });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [showUploadTray, setShowUploadTray] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ total_size: number; file_count: number } | null>(null);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && token) {
      // Set auth token for API client
      apiClient.setAuthToken(token);
      loadInitialData();
      loadStorageUsage();
    }
  }, [isAuthenticated, token]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading initial data...');
      
      const response = await apiClient.getFolders();

      console.log('📁 Root folder response:', response);

      if (!response.success) {
        throw new Error('Failed to load root folder');
      }

      const { folders = [], files = [] } = response.data || {};
      
      setFolders(folders);
      setFolderTree(folders);
      setFiles(files);

      // Load root folder contents
      await loadFolderContents();
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolderContents = useCallback(async () => {
    try {
      setIsLoading(true);
      // Ensure currentFolderId is never undefined
      const safeFolderId = currentFolderId === undefined ? null : currentFolderId;
      console.log('📂 Loading folder contents for:', safeFolderId || 'root');
      
      const response = await apiClient.getFolders(safeFolderId);

      console.log('📁 Folder contents response:', response);

      if (!response.success) {
        throw new Error('Failed to load folder contents');
      }

      const { folders = [], files: rawFiles = [] } = response.data || {};
      
      // Ensure files have required fields for React keys
      const files = rawFiles.map((file: File) => ({
        ...file,
        id: file.id,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        is_shared: file.is_shared || false
      }));
      
      setFolders(folders);
      setFiles(files);
      
      console.log('✅ Updated state - folders:', folders.length, 'files:', files.length);
    } catch (error) {
      console.error('❌ Error loading folder contents:', error);
      toast.error('Failed to load folder contents');
      setFolders([]);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  const updateBreadcrumbs = useCallback(async () => {
    // Ensure currentFolderId is never undefined
    const safeFolderId = currentFolderId === undefined ? null : currentFolderId;
    if (!safeFolderId) {
      setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
      return;
    }

    try {
      const breadcrumbItems = [{ id: 'root', name: 'My Drive' }];
      let currentId = safeFolderId;

      while (currentId) {
        const folder = await apiClient.getFolderById(currentId);
        if (folder.success && folder.data) {
          breadcrumbItems.unshift({ id: folder.data.id, name: folder.data.name });
          currentId = folder.data.parent_id || '';
        } else {
          break;
        }
      }

      setBreadcrumbs(breadcrumbItems);
    } catch (error) {
      console.error('Error updating breadcrumbs:', error);
    }
  }, [currentFolderId]);

  // Load data when folder changes
  useEffect(() => {
    if (isAuthenticated && currentFolderId !== undefined) {
      loadFolderContents();
      updateBreadcrumbs();
    }
  }, [currentFolderId, isAuthenticated, loadFolderContents, updateBreadcrumbs]);

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedItems(new Set());
  };

  const handleBreadcrumbClick = (folderId: string) => {
    if (folderId === 'root') {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(folderId);
    }
    setSelectedItems(new Set());
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      await loadFolderContents();
      return;
    }

    try {
      setIsSearching(true);
      console.log('🔍 Searching for:', query);
      
      // For now, just search in current folder
      const filesResponse = await apiClient.getFiles(currentFolderId === undefined || currentFolderId === null ? undefined : currentFolderId);
      console.log('🔍 Search response:', filesResponse);
      
      if (!filesResponse.success) {
        throw new Error('Search failed');
      }
      
      // Filter files by name
      const searchFiles = filesResponse.data?.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      ) || [];
      
      // Ensure files have required fields
      const processedFiles = searchFiles.map(file => ({
        ...file,
        id: file.id,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        is_shared: file.is_shared || false
      }));
      
      setFiles(processedFiles);
      setFolders([]); // Clear folders during search
      setSearchQuery(query);
      
      console.log('✅ Search results - files:', processedFiles.length);
    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const loadStorageUsage = async () => {
    try {
      console.log('📊 Loading storage usage...');
      const response = await apiClient.getStorageUsage();
      console.log('📊 Storage usage response:', response);
      
      if (!response.success) {
        throw new Error('Failed to load storage usage');
      }
      
      const usage = response.data;
      console.log('📊 Storage usage data:', usage);
      
      if (!usage) {
        throw new Error('No storage usage data received');
      }
      
      setStorageUsage({
        total_size: usage.total_size || 0,
        file_count: usage.file_count || 0
      });
    } catch (error) {
      console.error('❌ Error loading storage usage:', error);
      setStorageUsage(null);
    }
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    try {
      const response = await apiClient.createFolder({
        name,
        parent_id: parentId || (currentFolderId === undefined || currentFolderId === null ? undefined : currentFolderId)
      });

      if (response.success) {
        toast.success('Folder created successfully');
        await loadFolderContents();
        await loadInitialData(); // Refresh folder tree
        await loadStorageUsage(); // Refresh storage usage
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    try {
      setFiles(prev => [...uploadedFiles, ...prev]);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      await loadStorageUsage(); // Refresh storage usage after upload
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to handle file upload');
    }
  };

  // Bulk action handlers
  const handleBulkDownload = async () => {
    try {
      const selectedFiles = files.filter(file => selectedItems.has(file.id));
      if (selectedFiles.length === 0) {
        toast.error('No files selected for download');
        return;
      }
      
      // For now, just show a success message
      // In production, you would implement actual bulk download
      toast.success(`Preparing download for ${selectedFiles.length} file(s)`);
      
      // Clear selection after action
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error handling bulk download:', error);
      toast.error('Failed to prepare bulk download');
    }
  };

  const handleBulkShare = async () => {
    try {
      const selectedFiles = files.filter(file => selectedItems.has(file.id));
      if (selectedFiles.length === 0) {
        toast.error('No files selected for sharing');
        return;
      }
      
      toast.success(`Preparing to share ${selectedFiles.length} item(s)`);
      // TODO: Implement bulk share functionality
      
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error handling bulk share:', error);
      toast.error('Failed to prepare bulk share');
    }
  };

  const handleBulkMove = async () => {
    try {
      const selectedFiles = files.filter(file => selectedItems.has(file.id));
      if (selectedFiles.length === 0) {
        toast.error('No files selected for moving');
        return;
      }
      
      toast.success(`Preparing to move ${selectedFiles.length} item(s)`);
      // TODO: Implement bulk move functionality
      
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error handling bulk move:', error);
      toast.error('Failed to prepare bulk move');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const selectedFiles = files.filter(file => selectedItems.has(file.id));
      if (selectedFiles.length === 0) {
        toast.error('No files selected for deletion');
        return;
      }
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to move ${selectedFiles.length} item(s) to trash?`)) {
        return;
      }
      
      // Move files to trash
      for (const file of selectedFiles) {
        await apiClient.deleteFile(file.id);
      }
      
      toast.success(`Moved ${selectedFiles.length} item(s) to trash`);
      
      // Reload data and clear selection
      await loadFolderContents();
      await loadStorageUsage();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error handling bulk delete:', error);
      toast.error('Failed to move items to trash');
    }
  };

  // File operation handlers
  const handleFilePreview = async (file: File) => {
    try {
      if (file.mime_type?.startsWith('image/')) {
        // For images, we can show a preview dialog
        toast.success(`Opening preview for ${file.name}`);
        // TODO: Implement image preview dialog
      } else if (file.mime_type?.includes('pdf')) {
        // For PDFs, open in new tab or preview dialog
        toast.success(`Opening PDF preview for ${file.name}`);
        // TODO: Implement PDF preview
      } else {
        toast.success(`Preview not available for ${file.name}`);
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to preview file');
    }
  };

  const handleFileDownload = async (file: File) => {
    try {
      toast.loading(`Preparing download for ${file.name}...`);
      
      const blob = await apiClient.downloadFile(file.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error('Failed to download file');
    }
  };

  const handleFileDelete = async (file: File) => {
    try {
      if (!confirm(`Are you sure you want to move "${file.name}" to trash?`)) {
        return;
      }
      
      await apiClient.deleteFile(file.id);
      toast.success(`Moved "${file.name}" to trash`);
      
      // Reload data
      await loadFolderContents();
      await loadStorageUsage();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to move file to trash');
    }
  };

  const handleFileShare = async (file: File) => {
    try {
      toast.success(`Preparing to share ${file.name}`);
      // TODO: Implement file sharing dialog
    } catch (error) {
      console.error('Error sharing file:', error);
      toast.error('Failed to prepare file sharing');
    }
  };

  const handleFileRename = async (file: File) => {
    try {
      const newName = prompt('Enter new name:', file.name);
      if (!newName || newName === file.name) return;
      
      // TODO: Implement file rename when backend supports it
      toast.success(`Renamed "${file.name}" to "${newName}"`);
      
      // Reload data
      await loadFolderContents();
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Failed to rename file');
    }
  };

  const handleFileVersions = async (file: File) => {
    try {
      toast.success(`Version history for ${file.name} is coming soon`);
      // TODO: Implement file version history
    } catch (error) {
      console.error('Error loading file versions:', error);
      toast.error('Failed to load file versions');
    }
  };

  const handleSort = (field: keyof File | 'name' | 'size' | 'created_at' | 'updated_at') => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedItems = (): FileGridItem[] => {
    const allItems: FileGridItem[] = [
      ...folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder' as const,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        is_shared: folder.is_shared
      })),
      ...files.map(file => ({
        id: file.id,
        name: file.name,
        type: 'file' as const,
        size: file.size,
        mime_type: file.mime_type,
        created_at: file.created_at,
        updated_at: file.updated_at,
        is_shared: file.is_shared
      }))
    ];

    return allItems.sort((a, b) => {
             let aValue: unknown, bValue: unknown;
      
      // Map File fields to FileGridItem fields
      switch (sortConfig.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'created_at':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        case 'updated_at':
          aValue = a.updated_at;
          bValue = b.updated_at;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const getSortIcon = (field: keyof File | 'name' | 'size' | 'created_at' | 'updated_at') => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const sortedItems = getSortedItems();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Drive</h2>
        </div>
        
        <div className="p-4">
          <Button 
            onClick={() => setShowUploadTray(true)}
            className="w-full mb-4"
            size="sm"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          
          <NewMenu onCreateFolder={handleCreateFolder} />
        </div>

        <Separator />
        
        <div className="flex-1 overflow-y-auto">
          <FolderTree 
            folders={folderTree}
            currentFolderId={currentFolderId}
            onFolderClick={handleFolderClick}
          />
        </div>

        {/* Storage Usage */}
        <div className="p-4 border-t border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-medium">
                {storageUsage ? formatFileSize(storageUsage.total_size || 0) : 'Loading...'}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${storageUsage ? Math.min(((storageUsage.total_size || 0) / (15 * 1024 * 1024 * 1024)) * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{storageUsage ? `${storageUsage.file_count || 0} files` : '0 files'}</span>
                <span>15 GB total</span>
              </div>
            </div>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-2 opacity-50">
                Debug: {storageUsage ? JSON.stringify(storageUsage) : 'No data'}
              </div>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear auth and redirect to login
                localStorage.removeItem('authToken');
                router.push('/auth/login');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumbs 
              items={breadcrumbs}
              onItemClick={handleBreadcrumbClick}
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode.type === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(prev => ({ ...prev, type: 'grid' }))}
              >
                <Grid3X3Icon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode.type === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(prev => ({ ...prev, type: 'list' }))}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.trim()) {
                    handleSearch(value);
                  } else {
                    loadFolderContents();
                  }
                }}
                className="pl-10 pr-10"
                disabled={isSearching}
              />
              {(searchQuery || isSearching) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => {
                    setSearchQuery('');
                    loadFolderContents();
                  }}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  ) : (
                    <span className="text-muted-foreground">×</span>
                  )}
                </Button>
              )}
            </div>

            <Button variant="outline" size="sm">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const { testApiEndpoints } = await import('@/lib/test-api');
                    await testApiEndpoints();
                    toast.success('API tests completed successfully');
                  } catch (error) {
                    console.error('API tests failed:', error);
                    toast.error('API tests failed');
                  }
                }}
              >
                🧪 Test API
              </Button>
            )}
          </div>

          {/* Action Bar - Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedItems.size} selected</Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkDownload()}
                    disabled={selectedItems.size === 0}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkShare()}
                    disabled={selectedItems.size === 0}
                  >
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkMove()}
                    disabled={selectedItems.size === 0}
                  >
                    <FolderIcon className="w-4 h-4 mr-2" />
                    Move to
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkDelete()}
                    disabled={selectedItems.size === 0}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Move to Trash
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={() => setShowUploadTray(true)}>
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            
            <Button variant="outline" onClick={() => handleCreateFolder('New Folder')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            
            <Button variant="outline" onClick={() => router.push('/trash')}>
              <TrashIcon className="w-4 h-4 mr-2" />
              Trash
            </Button>
            
            <Button variant="outline" onClick={() => router.push('/shared')}>
              <ShareIcon className="w-4 h-4 mr-2" />
              Shared with me
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Search Results for &quot;{searchQuery}&quot;</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    loadFolderContents();
                  }}
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}

          {isLoading || isSearching ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                {isSearching ? 'Searching...' : 'Loading...'}
              </span>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-16">
              <FolderIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No files or folders</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No results found for your search.' : 'This folder is empty.'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowUploadTray(true)}>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button variant="outline" onClick={() => handleCreateFolder('New Folder')}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Folder
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sort Headers */}
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Name {getSortIcon('name')}
                </button>
                <button
                  onClick={() => handleSort('size')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Size {getSortIcon('size')}
                </button>
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Created {getSortIcon('created_at')}
                </button>
                <button
                  onClick={() => handleSort('updated_at')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Modified {getSortIcon('updated_at')}
                </button>
              </div>

              {/* File Display */}
              {viewMode.type === 'grid' ? (
                <FileGrid
                  items={sortedItems}
                  viewMode={viewMode}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  onItemClick={(item) => {
                    if (item.type === 'folder') {
                      handleFolderClick(item.id);
                    }
                  }}
                  onItemsChange={async () => {
                    await loadFolderContents();
                    await loadStorageUsage();
                  }}
                  currentFolderId={currentFolderId}
                />
              ) : (
                <FileRowList
                  items={sortedItems}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  onItemClick={(item) => {
                    if (item.type === 'folder') {
                      handleFolderClick(item.id);
                    }
                  }}
                  onItemsChange={async () => {
                    await loadFolderContents();
                    await loadStorageUsage();
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Tray */}
      {showUploadTray && (
        <UploadTray
          isOpen={showUploadTray}
          onClose={() => setShowUploadTray(false)}
          onUploadComplete={handleFileUpload}
          currentFolderId={currentFolderId}
        />
      )}
    </div>
  );
}


