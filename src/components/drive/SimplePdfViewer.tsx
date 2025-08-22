'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, RefreshCcw } from 'lucide-react';
import AuthenticatedIframe from './AuthenticatedIframe';

type SimplePdfViewerProps = {
  url?: string;
  fileId?: string;
  fileName?: string;
};

export default function SimplePdfViewer({ url, fileId, fileName }: SimplePdfViewerProps) {
  // Always declare hooks at the top level
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(false);
      setRetryCount(0);
    }
  }, [url]);

  // Add a timeout to detect if loading is taking too long
  React.useEffect(() => {
    if (isLoading && url) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setError(true);
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // If fileId is provided, use the authenticated iframe approach
  if (fileId) {
    return (
      <div className="space-y-4">
        {/* Simple controls */}
        <div className="flex items-center justify-between gap-2 rounded-md border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">PDF Viewer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
              window.open(`${base}/files/${fileId}/serve?inline=true`, '_blank', 'noopener,noreferrer');
            }}>
              <ExternalLink className="mr-1 h-3 w-3" />Open in new tab
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
              const a = document.createElement('a');
              a.href = `${base}/files/${fileId}/download`;
              a.download = fileName || 'file.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download className="mr-1 h-3 w-3" />Download
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="relative min-h-[600px] rounded-lg border bg-gray-50 dark:bg-gray-900">
          <AuthenticatedIframe 
            fileId={fileId} 
            title={fileName || "PDF Viewer"}
            mimeType="application/pdf"
            className="h-full w-full min-h-[600px] border-0 rounded-lg"
          />
        </div>

        {/* Fallback message */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>If the PDF doesn&apos;t load, use the options in the toolbar above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simple controls */}
      <div className="flex items-center justify-between gap-2 rounded-md border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">PDF Viewer</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />Open in new tab
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} download>
              <Download className="mr-1 h-3 w-3" />Download
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative min-h-[600px] rounded-lg border bg-gray-50 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
              {retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">Retry attempt {retryCount}</p>
              )}
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">PDF Preview Unavailable</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The PDF cannot be displayed in the preview. This may be due to security restrictions or the file format.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCcw className="mr-1 h-3 w-3" />Retry
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />Open in new tab
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={url} download>
                    <Download className="mr-1 h-3 w-3" />Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">
            {/* Try multiple approaches */}
            <iframe
              key={`pdf-iframe-${retryCount}`}
              src={url ? `${url}#toolbar=1&navpanes=1&scrollbar=1` : undefined}
              className="h-full w-full min-h-[600px] border-0 rounded-lg"
              title="PDF Viewer"
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading ? 'none' : 'block' }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        )}
      </div>

      {/* Fallback message */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>If the PDF doesn&apos;t load, use &quot;Open in new tab&quot; or &quot;Download&quot; options above.</p>
      </div>
    </div>
  );
}