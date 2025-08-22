'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSignedUrl } from '@/lib/file-actions';
import { cn } from '@/lib/utils';

interface EnhancedPdfViewerProps {
  fileId: string;
  fileName: string;
}

export default function EnhancedPdfViewer({ fileId, fileName }: EnhancedPdfViewerProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = React.useState(-1);
  const viewerRef = React.useRef<HTMLIFrameElement>(null);

  const handleDownload = () => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = () => {
    if (url) {
      try {
        // For blob URLs, we need to create a new window with the PDF content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print - ${fileName || 'Document'}</title>
                <style>
                  body { margin: 0; padding: 0; }
                  embed { width: 100%; height: 100vh; }
                </style>
              </head>
              <body>
                <embed src="${url}" type="application/pdf" width="100%" height="100%">
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 1000);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } catch (error) {
        console.error('Print failed:', error);
        // Fallback: try to open in new tab and print manually
        window.open(url, '_blank');
      }
    }
  };

  // Determine file type and appropriate viewer
  const getFileType = () => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['docx', 'doc'].includes(extension || '')) return 'word';
    if (['xlsx', 'xls'].includes(extension || '')) return 'excel';
    if (['pptx', 'ppt'].includes(extension || '')) return 'powerpoint';
    if (['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json'].includes(extension || '')) return 'text';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  const fileType = getFileType();

  // Load PDF URL
  React.useEffect(() => {
    const loadUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Instead of using signed URL directly, download the file and create a blob URL
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
        const response = await fetch(`${base}/files/${fileId}/download`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error loading file:', error);
        setError(error instanceof Error ? error.message : 'Failed to load file');
        setLoading(false);
      }
    };

    if (fileId) {
      loadUrl();
    }

    // Cleanup function to revoke blob URL
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [fileId]); // Remove 'url' from dependency array to prevent infinite loop

  // Handle viewer messages
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'pdf-viewer') {
        switch (event.data.action) {
          case 'loaded':
            setTotalPages(event.data.totalPages);
            break;
          case 'page-changed':
            setCurrentPage(event.data.page);
            break;
          case 'search-results':
            setSearchResults(event.data.results);
            setCurrentSearchIndex(event.data.results.length > 0 ? 0 : -1);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send commands to viewer
  const sendCommand = (command: string, data?: Record<string, unknown>) => {
    if (viewerRef.current && viewerRef.current.contentWindow) {
      viewerRef.current.contentWindow.postMessage({
        type: 'pdf-command',
        command,
        data
      }, '*');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<HTMLInputElement> | number) => {
    let newPage: number;
    if (typeof event === 'number') {
      newPage = event;
    } else {
      newPage = parseInt(event.target.value);
    }
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.25, Math.min(5, scale + delta));
    setScale(newScale);
    sendCommand('set-zoom', { scale: newScale });
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    sendCommand('set-rotation', { rotation: newRotation });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sendCommand('search', { query: searchQuery });
    }
  };

  const handleSearchNavigation = (direction: 'prev' | 'next') => {
    if (searchResults.length === 0) return;

    let newIndex = currentSearchIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }

    setCurrentSearchIndex(newIndex);
    sendCommand('goto-search-result', { index: newIndex });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {fileType === 'pdf' ? 'PDF' : 'file'}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error loading {fileType === 'pdf' ? 'PDF' : 'file'}</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-600">
          <p>No file URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold">{fileType === 'pdf' ? 'PDF' : 'File'} Viewer</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';
              window.open(`${base}/files/${fileId}/serve?inline=true`, '_blank', 'noopener,noreferrer');
            }}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Open
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Download
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Print
          </button>
        </div>
      </div>
      
      <div className="w-full h-full">
        {fileType === 'pdf' ? (
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full min-h-[600px]"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <p className="text-center p-8 text-gray-600">
              Your browser doesn't support PDF viewing. 
              <a 
                href={url} 
                download 
                className="text-blue-600 hover:underline ml-2"
              >
                Click here to download the PDF
              </a>
            </p>
          </object>
        ) : fileType === 'image' ? (
          <img 
            src={url} 
            alt={fileName || 'Image'} 
            className="w-full h-full object-contain"
            style={{ border: '1px solid #e5e7eb' }}
          />
        ) : fileType === 'text' ? (
          <iframe
            src={url}
            className="w-full h-full min-h-[600px]"
            style={{ border: '1px solid #e5e7eb' }}
            title={fileName || 'Text file'}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-600">
              <p className="text-lg font-semibold mb-2">Preview not available</p>
              <p className="text-sm mb-4">
                {fileType === 'word' ? 'Word documents' : 
                 fileType === 'excel' ? 'Excel spreadsheets' : 
                 fileType === 'powerpoint' ? 'PowerPoint presentations' : 
                 'This file type'} cannot be previewed in the browser.
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download to view
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
