'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FileGridItem } from '@/types/drive';
import PreviewToolbar from './PreviewToolbar';
import { usePanZoom } from '@/hooks/usePanZoom';
import { getSignedUrl, downloadFile } from '@/lib/file-actions';

// Dynamically import viewers to avoid SSR issues
const CodeViewer = dynamic(() => import('./CodeViewer'), {
  ssr: false,
  loading: () => <div className="p-6 text-slate-500">Loading code viewer...</div>
});

const EnhancedPdfViewer = dynamic(() => import('./EnhancedPdfViewer'), {
  ssr: false,
  loading: () => <div className="p-6 text-slate-500">Loading PDF viewer...</div>
});

const ImageViewer = dynamic(() => import('./ImageViewer'), {
  ssr: false,
  loading: () => <div className="p-6 text-slate-500">Loading image viewer...</div>
});

const OfficeViewer = dynamic(() => import('./OfficeViewer'), {
  ssr: false,
  loading: () => <div className="p-6 text-slate-500">Loading document viewer...</div>
});

// Import OFFICE_MIME_TYPES from OfficeViewer
import { OFFICE_MIME_TYPES } from './OfficeViewer';

type Props = {
  open: boolean;
  file: FileGridItem | null;
  onOpenChange: (o: boolean) => void;
};
export default function PreviewDialog({ open, file, onOpenChange }: Props) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { containerRef, scale: zoom, setScale: setZoom, rotation, setRotation, tx, ty, reset } = usePanZoom();
  const canPreview = !!file && (
    file.mime_type?.startsWith('image/') ||
    file.mime_type === 'application/pdf' ||
    file.mime_type?.startsWith('text/') ||
    file.mime_type === 'application/json' ||
    file.mime_type === 'application/xml' ||
    (file.mime_type && file.mime_type in OFFICE_MIME_TYPES)
  );
  const lastFileId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!open || !file) return;
    
    // Only fetch URL if we haven't already loaded it for this file
    if (lastFileId.current !== file.id) {
      setLoading(true);
      reset();
      lastFileId.current = file.id;
      
      (async () => {
        try {
          const signedUrl = await getSignedUrl(file.id, 'inline');
          setUrl(signedUrl);
        } catch {
          setUrl(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, file, reset]); // Added file and reset to dependencies

  // Cleanup when dialog closes or file changes
  React.useEffect(() => {
    if (!open) {
      setUrl(null);
      lastFileId.current = null;
    }
  }, [open]);

  // Keyboard shortcuts for preview
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!file) return;
      // Zoom
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom?.((z) => Math.min(3, z + 0.1)); }
      if (e.key === '-') { e.preventDefault(); setZoom?.((z) => Math.max(0.3, z - 0.1)); }
      // Rotate
      if (e.key.toLowerCase() === 'r') { e.preventDefault(); setRotation?.((r) => (r + 90) % 360); }
      // PDF page nav (if PdfViewer is used, you can forward events to it via callbacks)
      // Optional: dispatch custom events to PdfViewer
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, file, setZoom, setRotation]);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div>
        <DialogTitle className="truncate">{file?.name ?? 'Preview'}</DialogTitle>
        <DialogDescription className="truncate">
          {file ? `${file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size'} • ${file.mime_type || 'Unknown type'}` : ''}
        </DialogDescription>
      </div>
      {file ? (
        <Button onClick={() => downloadFile(file.id, file.name)}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      ) : null}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>{header}</DialogHeader>

        {loading ? (
          <div className="grid h-[70vh] place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : !file ? (
          <div className="p-6 text-center text-sm text-slate-500">No file selected.</div>
        ) : canPreview && url ? (
          <div className="rounded-lg border">
            {file.mime_type?.startsWith('image/') ? (
              <ImageViewer
                url={url}
                fileName={file.name}
                fileSize={file.size || 0}
                mimeType={file.mime_type || ''}
              />
            ) : file.mime_type === 'application/pdf' ? (
              <EnhancedPdfViewer fileId={file.id} fileName={file.name} />
            ) : file.mime_type?.startsWith('text/') || file.mime_type === 'application/json' || file.mime_type === 'application/xml' ? (
              <CodeViewer url={url} fileName={file.name} mimeType={file.mime_type || ''} />
            ) : file.mime_type && file.mime_type in OFFICE_MIME_TYPES ? (
              <OfficeViewer fileId={file.id} fileName={file.name} mimeType={file.mime_type} />
            ) : null}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-600">
            Preview not available for this file type. Use Download.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
