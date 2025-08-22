export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium' | 'enterprise';
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  user_id: string;
  path?: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children?: Folder[];
  file_count?: number;
  total_size?: number;
}

export interface File {
  id: string;
  name: string;
  original_name: string;
  description?: string;
  mime_type: string;
  size: number;
  folder_id?: string;
  user_id: string;
  storage_path: string;
  storage_provider: 'supabase' | 's3';
  is_shared: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FileWithMetadata extends File {
  url?: string;
  thumbnail_url?: string;
  preview_url?: string;
  tags?: string[];
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'file' | 'folder';
  permission_level: 'read' | 'write' | 'admin';
  granted_by: string;
  created_at: string;
  expires_at?: string;
}

export interface Share {
  id: string;
  resource_id: string;
  resource_type: 'file' | 'folder';
  share_token: string;
  access_level: 'read' | 'write';
  password_protected: boolean;
  expires_at?: string;
  created_by: string;
  created_at: string;
}

export interface ShareWithResource extends Share {
  resource_name?: string;
  resource_size?: number;
  resource_type_name?: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  storage_path: string;
  size: number;
  created_by: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface StorageUsage {
  total_size: number;
  file_count: number;
  last_calculated: string;
}

// Request/Response types
export interface CreateFolderRequest {
  name: string;
  description?: string;
  parent_id?: string;
  path?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  parent_id?: string;
  path?: string;
  is_shared?: boolean;
}

export interface CreateFileRequest {
  name: string;
  original_name: string;
  description?: string;
  mime_type: string;
  size: number;
  folder_id?: string;
  storage_path: string;
  storage_provider?: 'supabase' | 's3';
}

export interface UpdateFileRequest {
  name?: string;
  description?: string;
  folder_id?: string;
  is_shared?: boolean;
}

export interface CreatePermissionRequest {
  user_id: string;
  resource_id: string;
  resource_type: 'file' | 'folder';
  permission_level: 'read' | 'write' | 'admin';
  expires_at?: string;
}

export interface UpdatePermissionRequest {
  permission_level?: 'read' | 'write' | 'admin';
  expires_at?: string;
}

export interface CreateShareRequest {
  resource_id: string;
  resource_type: 'file' | 'folder';
  access_level: 'read' | 'write';
  password_protected?: boolean;
  password?: string;
  expires_at?: string;
}

export interface UpdateShareRequest {
  access_level?: 'read' | 'write';
  password_protected?: boolean;
  password?: string;
  expires_at?: string;
}

// Common types
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchParams {
  query: string;
  type?: 'file' | 'folder' | 'all';
  mime_type?: string;
  date_from?: string;
  date_to?: string;
  size_min?: number;
  size_max?: number;
  tags?: string[];
  sort_by?: 'name' | 'size' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  folder_id?: string;
  include_subfolders?: boolean;
  limit?: number;
  offset?: number;
  is_shared?: boolean;
  is_starred?: boolean;
  owner_id?: string;
  shared_with?: string;
  last_modified_by?: string;
}

// UI-specific types
export interface FileGridItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  is_shared: boolean;
  url?: string;
  thumbnail_url?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface SelectionState {
  selectedItems: Set<string>;
  lastSelected?: string;
  isSelecting: boolean;
}

export interface ViewMode {
  type: 'grid' | 'list' | 'details';
  size: 'small' | 'medium' | 'large';
}

export interface SortConfig {
  field: keyof File | 'name' | 'size' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  type?: 'file' | 'folder' | 'all';
  mime_type?: string[];
  size_range?: [number, number];
  date_range?: [string, string];
  tags?: string[];
  shared_only?: boolean;
}

export interface Activity {
  id: string;
  actor_id: string;
  action: 'upload' | 'rename' | 'delete' | 'restore' | 'move' | 'share' | 'download';
  resource_type: 'file' | 'folder';
  resource_id: string;
  context: Record<string, unknown>;
  created_at: Date;
}
