import { supabase } from './supabase';

export interface FileUploadResult {
  path: string;
  size: number;
  mimeType: string;
  url: string;
}

export class SupabaseStorageService {
  private bucketName = 'files';

  // Upload file to Supabase Storage
  async uploadFile(
    file: File,
    userId: string,
    folderPath: string = ''
  ): Promise<FileUploadResult> {
    try {
      // Generate unique file path
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      const filePath = folderPath ? `${folderPath}/${uniqueFileName}` : uniqueFileName;
      const fullPath = `users/${userId}/${filePath}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase().storage
        .from(this.bucketName)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      // Get public URL
      const { data: urlData } = supabase().storage
        .from(this.bucketName)
        .getPublicUrl(fullPath);

      return {
        path: fullPath,
        size: file.size,
        mimeType: file.type,
        url: urlData.publicUrl
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Download file from Supabase Storage
  async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase().storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Download failed: No data returned');
      }

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get file URL (public or signed)
  async getFileUrl(filePath: string, signed: boolean = false, expiresIn: number = 3600): Promise<string> {
    try {
      if (signed) {
        const { data, error } = await supabase().storage
          .from(this.bucketName)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          throw new Error(`Failed to create signed URL: ${error.message}`);
        }

        return data.signedUrl;
      } else {
        const { data } = supabase().storage
          .from(this.bucketName)
          .getPublicUrl(filePath);

        return data.publicUrl;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Delete file from Supabase Storage
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase().storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // List files in a folder
  async listFiles(folderPath: string = '', limit: number = 100, offset: number = 0) {
    try {
      const { data, error } = await supabase().storage
        .from(this.bucketName)
        .list(folderPath, {
          limit,
          offset,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get storage usage for a user
  async getUserStorageUsage(userId: string): Promise<{ totalSize: number; fileCount: number }> {
    try {
      const { data, error } = await supabase().storage
        .from(this.bucketName)
        .list(`users/${userId}`, {
          limit: 1000,
          offset: 0
        });

      if (error) {
        throw new Error(`Failed to get user storage usage: ${error.message}`);
      }

      let totalSize = 0;
      let fileCount = 0;

      // Calculate size recursively
      const calculateSize = async (items: Array<{ name: string; metadata?: { size?: number } }>, path: string) => {
        for (const item of items) {
          if (item.metadata) {
            // It's a file
            totalSize += item.metadata.size || 0;
            fileCount++;
          } else {
            // It's a folder, list its contents
            const { data: subItems } = await supabase().storage
              .from(this.bucketName)
              .list(`${path}/${item.name}`, {
                limit: 1000,
                offset: 0
              });

            if (subItems) {
              await calculateSize(subItems, `${path}/${item.name}`);
            }
          }
        }
      };

      if (data) {
        await calculateSize(data, `users/${userId}`);
      }

      return { totalSize, fileCount };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Storage operation failed';
      console.error('Storage error:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const supabaseStorage = new SupabaseStorageService();
