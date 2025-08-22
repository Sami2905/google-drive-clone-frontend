'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCcw, RotateCw, ExternalLink, Download } from 'lucide-react';

export default function PdfViewer({ url }: { url: string }) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [iframeError, setIframeError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => { 
    setScale(1); 
    setRotation(0); 
    setIframeError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setIframeError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // Add a timeout to detect if iframe is taking too long
  React.useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          handleIframeError();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 rounded-md border bg-white/80 px-2 py-1 text-xs shadow-sm backdrop-blur dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="mr-1 h-3 w-3" />Zoom out</Button>
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(3, s + 0.1))}><ZoomIn className="mr-1 h-3 w-3" />Zoom in</Button>
          <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw className="mr-1 h-3 w-3" />Rotate</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[90px] text-center">{Math.round(scale * 100)}% • {rotation}°</span>
          <Button size="sm" onClick={() => { setScale(1); setRotation(0); }}><RefreshCcw className="mr-1 h-3 w-3" />Reset</Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />Open in new tab
            </a>
          </Button>
        </div>
      </div>

      <div className="grid place-items-center overflow-auto rounded-lg border p-2">
        <div 
          className="w-full h-full min-h-[500px] relative"
          style={{ 
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Retry attempt {retryCount}</p>
                )}
              </div>
            </div>
          )}
          
          {iframeError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
            <iframe
              key={`${url}-${retryCount}`} // Force re-render on retry
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full min-h-[500px] border-0"
              title="PDF Viewer"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: isLoading ? 'none' : 'block' }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
}
