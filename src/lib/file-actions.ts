'use client';

import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// Global test function for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).testSignedUrl = async (fileId: string) => {
    console.log('Testing signed URL for file:', fileId);
    try {
      const url = await getSignedUrl(fileId, 'inline');
      console.log('Signed URL obtained:', url);
      toast.success('Signed URL test successful');
      return url;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      toast.error(errorMessage);
      throw error;
    }
  };
}

export function getFileUrl(id: string, disposition: 'inline'|'attachment' = 'inline') {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
  const authStore = useAuthStore.getState();
  const token = authStore.token;
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  // Use direct serve endpoint instead of signed URLs
  const endpoint = disposition === 'inline' ? 'serve' : 'download';
  const url = new URL(`${base}/files/${id}/${endpoint}`);
  
  if (disposition === 'inline') {
    url.searchParams.set('inline', 'true');
  }
  
  return url.toString();
}

export async function getSignedUrl(id: string, disposition: 'inline'|'attachment' = 'inline') {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
    const authStore = useAuthStore.getState();
    let token = authStore.token;
    
    if (!token) {
      toast.error('Please log in to access files');
      throw new Error('No authentication token found. Please log in again.');
    }

    // Check if token is valid, if not try to refresh it
    if (!authStore.isTokenValid()) {
      console.log('Token is expired, attempting to refresh...');
      toast.loading('Refreshing session...');
      const refreshed = await authStore.refreshToken();
      toast.dismiss();
      
      if (!refreshed) {
        authStore.logout();
        toast.error('Session expired. Please log in again.');
        throw new Error('Authentication failed. Please log in again.');
      }
      token = authStore.token;
    }

    console.log('Fetching signed URL:', `${base}/files/${id}/signed?disposition=${disposition}`);
    
    const res = await fetch(`${base}/files/${id}/signed?disposition=${disposition}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Signed URL response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Signed URL error response:', errorText);
      
      // Handle authentication errors specifically
      if (res.status === 401) {
        // Try to refresh token one more time
        toast.loading('Refreshing session...');
        const refreshed = await authStore.refreshToken();
        toast.dismiss();
        
        if (!refreshed) {
          authStore.logout();
          toast.error('Session expired. Please log in again.');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        // Retry the request with the new token
        const retryRes = await fetch(`${base}/files/${id}/signed?disposition=${disposition}`, {
          headers: { 
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!retryRes.ok) {
          authStore.logout();
          toast.error('Session expired. Please log in again.');
          throw new Error('Authentication failed. Please log in again.');
        }
        
        const retryData = await retryRes.json();
        return retryData.data?.signed_url as string;
      }
      
      toast.error(`Failed to access file: ${res.statusText}`);
      throw new Error(`Failed to get signed url: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Signed URL response data:', data);
    
    return data.data?.signed_url as string;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    console.error('Error getting signed URL:', errorMessage);
    throw error;
  }
}

export async function previewFile(id: string) {
  try {
    const url = await getSignedUrl(id, 'inline');
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    console.error('Error previewing file:', errorMessage);
    toast.error('Failed to preview file');
    // Fallback: try to open the file directly
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
    window.open(`${base}/files/${id}/download`, '_blank', 'noopener,noreferrer');
  }
}

export async function downloadFile(id: string, filename?: string) {
  try {
    const url = await getSignedUrl(id, 'attachment');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename || '';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    console.error('Error downloading file:', errorMessage);
    toast.error('Failed to download file');
    // Fallback: try to download directly
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
    const anchor = document.createElement('a');
    anchor.href = `${base}/files/${id}/download`;
    anchor.download = filename || '';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}