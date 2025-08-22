'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ExternalLink, Download } from 'lucide-react';
import api from '@/lib/api';

interface AuthenticatedIframeProps {
  fileId: string;
  className?: string;
  title?: string;
  mimeType?: string;
}

export default function AuthenticatedIframe({ 
  fileId, 
  className = "w-full h-full min-h-[600px] border-0",
  title = "File Viewer"
}: AuthenticatedIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { token } = useAuthStore();

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
  const downloadEndpoint = `${baseUrl}/files/${fileId}/download`; // same-origin stream

  useEffect(() => {
    if (!token || !iframeRef.current) return;

    setIsLoading(true);
    setHasError(false);

    const iframe = iframeRef.current;
    
    // Create a custom fetch request and convert to blob URL for iframe
    const loadAuthenticatedContent = async () => {
      try {
        // Fetch file as blob via same-origin download endpoint to bypass Brave shields
        const { data: blob } = await api.get(downloadEndpoint.replace(baseUrl, ''), {
          responseType: 'blob',
        });

        const blobUrl = URL.createObjectURL(blob);
        iframe.src = blobUrl;

        return () => URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Failed to load authenticated content:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    const cleanup = loadAuthenticatedContent();

    // Once URL set, consider loading done (iframe handles its own errors)
    setIsLoading(false);

    return () => {
      if (cleanup instanceof Function) cleanup();
    };
  }, [downloadEndpoint, token, retryCount, baseUrl]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleOpenNewTab = () => {
    if (!token) return;
    api
      .get(`/files/${fileId}/signed`, {
        params: { disposition: 'inline' },
      })
      .then((r) => r.data)
      .then(({ data }) => {
        if (data?.url) window.open(data.url, '_blank');
      })
      .catch(console.error);
  };

  const handleDownload = () => {
    if (token) {
      api
        .get(`${baseUrl}/files/${fileId}/download`, {
          responseType: 'blob',
        })
        .then((r) => r.data)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = title || 'file';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
      .catch(error => {
        console.error('Failed to download:', error);
      });
    }
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
        <div className="mb-4 text-gray-400">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load file
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The file couldn&apos;t be displayed. Try the options below.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCcw className="mr-1 h-3 w-3" />Retry
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
            <ExternalLink className="mr-1 h-3 w-3" />Open in new tab
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1 h-3 w-3" />Download
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading file...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className={className}
        title={title}
        style={{ display: isLoading ? 'none' : 'block' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
