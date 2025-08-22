'use client';

import { 
  Folder, 
  CreateFolderRequest, 
  UpdateFolderRequest,
  File,
  CreateFileRequest,
  UpdateFileRequest,
  Permission,
  CreatePermissionRequest,
  Share,
  CreateShareRequest,
  SearchParams,
  PaginatedResponse,
  ApiResponse
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getAuthToken(): string | null {
    if (!this.authToken && typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('token');
    }
    return this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Log request details
    console.log('🚀 API Request:', {
      method: config.method || 'GET',
      url,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body as string) : undefined
    });

    try {
      const response = await fetch(url, config);
      
      // Log response details
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
        } catch {
          errorData = { message: response.statusText };
          console.error('❌ API Error:', response.status, response.statusText);
        }

        throw new Error(
          errorData.message || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log('✅ API Response Data:', data);

      return data;
    } catch (error) {
      console.error('❌ API Request Failed:', {
        error,
        endpoint,
        options
      });
        throw error;
      }
  }

  // Folders
  async getFolders(parentId: string | null = null): Promise<ApiResponse<{ folders: Folder[]; files: File[] }>> {
    const params = new URLSearchParams();
    // Ensure we never pass undefined - convert to null if needed
    const safeParentId = parentId === undefined ? null : parentId;
    if (safeParentId) params.append('parent_id', safeParentId);
    const endpoint = `/folders${params.toString() ? `?${params}` : ''}`;
    return this.request<ApiResponse<{ folders: Folder[]; files: File[] }>>(endpoint);
  }

  async getFolderById(id: string): Promise<ApiResponse<Folder>> {
    return this.request<ApiResponse<Folder>>(`/folders/${id}`);
  }

  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<Folder>> {
    return this.request<ApiResponse<Folder>>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFolder(id: string, data: UpdateFolderRequest): Promise<ApiResponse<Folder>> {
    return this.request<ApiResponse<Folder>>(`/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Files
  async getFiles(folderId?: string): Promise<ApiResponse<File[]>> {
    const params = new URLSearchParams();
    // Ensure we never pass undefined - convert to null if needed
    const safeFolderId = folderId === undefined ? null : folderId;
    if (safeFolderId) params.append('folder_id', safeFolderId);
    return this.request<ApiResponse<File[]>>(`/files${params.toString() ? `?${params}` : ''}`);
  }

  async getFileById(id: string): Promise<ApiResponse<File>> {
    return this.request<ApiResponse<File>>(`/files/${id}`, {
      method: 'GET',
    });
  }

  async createFile(fileData: CreateFileRequest): Promise<ApiResponse<File>> {
    return this.request<ApiResponse<File>>('/files', {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
  }

  async updateFile(id: string, updates: Partial<File>): Promise<ApiResponse<File>> {
    return this.request<ApiResponse<File>>(`/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // File Operations
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async restoreFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/restore`, {
      method: 'POST',
    });
  }

  async permanentlyDeleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/permanent`, {
      method: 'DELETE',
    });
  }

  async getFileMetadata(fileId: string): Promise<ApiResponse<File>> {
    return this.request<File>(`/files/${fileId}/metadata`, {
      method: 'GET',
    });
  }

  async getFilePreview(fileId: string): Promise<ApiResponse<{ preview_url: string }>> {
    return this.request<{ preview_url: string }>(`/files/${fileId}/preview`, {
      method: 'GET',
    });
  }

  async getFileThumbnail(fileId: string): Promise<ApiResponse<{ thumbnail_url: string }>> {
    return this.request<{ thumbnail_url: string }>(`/files/${fileId}/thumbnail`, {
      method: 'GET',
    });
  }

  // Folder Operations
  async deleteFolder(folderId: string, permanent: boolean = false): Promise<ApiResponse<void>> {
    const url = permanent ? `/folders/${folderId}/permanent` : `/folders/${folderId}`;
    return this.request<void>(url, {
      method: 'DELETE',
    });
  }

  async restoreFolder(folderId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/folders/${folderId}/restore`, {
      method: 'POST',
    });
  }

  // Share Operations
  async getSharedItems(): Promise<ApiResponse<File[]>> {
    return this.request<File[]>('/shares/shared-with-me', {
      method: 'GET',
    });
  }

  async shareItem(itemId: string, itemType: 'file' | 'folder', permissions: string[], users: string[]): Promise<ApiResponse<Share>> {
    return this.request<Share>('/shares', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        item_type: itemType,
        permissions,
        users
      }),
    });
  }

  // Trash Operations
  async getTrashItems(limit: number = 100, offset: number = 0): Promise<ApiResponse<{ files: File[], folders: any[] }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<{ files: File[], folders: any[] }>(`/trash?${params.toString()}`, {
      method: 'GET',
    });
  }

  async restoreFile(fileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/files/${fileId}/restore`, {
      method: 'POST',
    });
  }

  async permanentlyDeleteFile(fileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/files/${fileId}/permanent`, {
      method: 'DELETE',
    });
  }

  // Share Operations
  async shareFile(fileId: string, expiresIn: number = 7): Promise<ApiResponse<{
    shareToken: string;
    shareUrl: string;
    signedUrl: string | null;
    expiresAt: string;
    file: {
      id: string;
      name: string;
      mime_type: string;
      size: number;
    };
  }>> {
    return this.request<{
      shareToken: string;
      shareUrl: string;
      signedUrl: string | null;
      expiresAt: string;
      file: {
        id: string;
        name: string;
        mime_type: string;
        size: number;
      };
    }>(`/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn }),
    });
  }

  async getSharedFile(token: string): Promise<ApiResponse<{
    message: string;
    token: string;
    expiresAt: string;
  }>> {
    return this.request(`/shared/${token}`, {
      method: 'GET',
    });
  }

  // Storage Usage
  async getStorageUsage(): Promise<ApiResponse<{ total_size: number; file_count: number }>> {
    return this.request<ApiResponse<{ total_size: number; file_count: number }>>('/storage/usage', {
      method: 'GET',
    });
  }

  async getShareByToken(token: string): Promise<ApiResponse<Share>> {
    return this.request<ApiResponse<Share>>(`/shares/public/${token}`, {
      method: 'GET',
    });
  }

  async getPermissions(resourceId: string, resourceType: string): Promise<ApiResponse<Permission[]>> {
    return this.request<ApiResponse<Permission[]>>(`/shares/${resourceId}/permissions`, {
      method: 'GET',
    });
  }

  // File Operations
  async downloadFile(fileId: string, onProgress?: (progress: number) => void): Promise<Blob> {
    try {
      const token = this.getAuthToken();
      const url = `${this.baseUrl}/api/files/${fileId}/download`;
      
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      if (onProgress) {
        onProgress(100);
      }

      return await response.blob();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      throw new Error(errorMessage);
    }
  }

  async uploadFile(
    file: globalThis.File,
    folderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<File>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder_id', folderId);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log('🚀 Upload Request:', {
      method: 'POST',
      url: `${this.baseUrl}/api/files/upload`,
      headers,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      folderId
    });

    const response = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Log response details
    console.log('📥 Upload Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ Upload Error Response:', errorData);
      } catch {
        errorData = { message: response.statusText };
        console.error('❌ Upload Error:', response.status, response.statusText);
      }
      throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Upload completed:', data);

    return data;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: { id: string; email: string; name: string; plan: string }; token: string; redirectUrl: string }>> {
    return this.request<ApiResponse<{ user: { id: string; email: string; name: string; plan: string }; token: string; redirectUrl: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ user: { id: string; email: string; name: string; plan: string }; token: string }>> {
    return this.request<ApiResponse<{ user: { id: string; email: string; name: string; plan: string }; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setAuthToken(null);
    }
  }

  // Test authentication method for development
  async testLogin(): Promise<ApiResponse<{ user: { id: string; email: string; name: string; plan: string }; token: string; redirectUrl: string }>> {
    return this.login('test@example.com', 'testpassword');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export type { ApiClient };