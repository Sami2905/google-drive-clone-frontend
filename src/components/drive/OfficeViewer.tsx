'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { getSignedUrl } from '@/lib/file-actions';

interface OfficeViewerProps {
  fileId: string;
  fileName: string;
  mimeType: string;
}

const OFFICE_MIME_TYPES = {
  // Microsoft Office formats
  'application/msword': true, // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // .docx
  'application/vnd.ms-excel': true, // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // .xlsx
  'application/vnd.ms-powerpoint': true, // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true, // .pptx

  // OpenDocument formats
  'application/vnd.oasis.opendocument.text': true, // .odt
  'application/vnd.oasis.opendocument.spreadsheet': true, // .ods
  'application/vnd.oasis.opendocument.presentation': true, // .odp
};

export default function OfficeViewer({ fileId, fileName, mimeType }: OfficeViewerProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewerType, setViewerType] = React.useState<'office' | 'google' | null>(null);

  React.useEffect(() => {
    const loadUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get a signed URL for the file
        const signedUrl = await getSignedUrl(fileId, 'inline');
        setUrl(signedUrl);

        // Try Microsoft Office Online viewer first
        try {
          const response = await fetch('https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(signedUrl));
          if (response.ok) {
            setViewerType('office');
            return;
          }
        } catch {
          // Fallback to Google Docs viewer
          console.log('Microsoft Office viewer failed, falling back to Google Docs viewer');
        }

        // Use Google Docs viewer as fallback
        setViewerType('google');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
        setViewerType(null);
      } finally {
        setLoading(false);
      }
    };

    loadUrl();
  }, [fileId]);

  if (loading) {
    return (
      <div className="grid h-[70vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="grid h-[70vh] place-items-center">
        <div className="text-center">
          <p className="mb-4 text-sm text-red-500">{error || 'Failed to load document'}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const viewerUrl = viewerType === 'office'
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-white/80 p-2 shadow-sm backdrop-blur dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {viewerType === 'office' ? 'Microsoft Office Online' : 'Google Docs'} Viewer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="relative flex-1 overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-900">
        <iframe
          src={viewerUrl}
          className="h-full w-full border-0"
          title={`Document Viewer - ${fileName}`}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Fallback message */}
      <div className="text-center text-xs text-slate-500">
        {viewerType === 'google' && (
          <p>
            Using Google Docs viewer. If the document doesn&apos;t load,{' '}
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="text-blue-500 hover:underline"
            >
              open it directly
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
}

// Export the supported MIME types for external use
export { OFFICE_MIME_TYPES };
