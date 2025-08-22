'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ZoomIn, ZoomOut, RotateCw, Download, ExternalLink,
  Crop, ImageOff, Image as ImageIcon, Info
} from 'lucide-react';
import { usePanZoom } from '@/hooks/usePanZoom';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  width?: number;
  height?: number;
  orientation?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export default function ImageViewer({ url, fileName, fileSize, mimeType }: ImageViewerProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [brightness, setBrightness] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturation, setSaturation] = React.useState(100);
  const [exifData, setExifData] = React.useState<ExifData | null>(null);
  const { containerRef, scale, setScale, rotation, setRotation, tx, ty, reset } = usePanZoom();
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Load EXIF data
  React.useEffect(() => {
    const loadExifData = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Use EXIF.js or similar library to parse EXIF data
        // This is a placeholder for the actual implementation
        const exif = {
          make: 'Example Camera',
          model: 'Model X',
          dateTime: new Date().toISOString(),
          width: 1920,
          height: 1080,
        };

        setExifData(exif);
      } catch (err) {
        console.error('Failed to load EXIF data:', err);
      }
    };

    loadExifData();
  }, [url]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setLoading(false);
    setError('Failed to load image');
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white/80 p-2 shadow-sm backdrop-blur dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center text-sm">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
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

      {/* Main Content */}
      <div className="flex flex-1 gap-4">
        {/* Image View */}
        <div className="relative flex-1 overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-900">
          <div
            ref={containerRef}
            className="relative h-full w-full"
          >
            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-slate-50 dark:bg-slate-900">
                <div className="text-sm text-slate-500">Loading image...</div>
              </div>
            )}
            {error ? (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <ImageOff className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm text-slate-500">{error}</p>
                </div>
              </div>
            ) : (
              <img
                ref={imageRef}
                src={url}
                alt={fileName}
                className="select-none"
                draggable={false}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  translate: '-50% -50%',
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0">
          <Tabs defaultValue="adjust" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="adjust" className="flex-1">
                <ImageIcon className="mr-1 h-4 w-4" />
                Adjust
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1">
                <Info className="mr-1 h-4 w-4" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="mt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brightness</label>
                  <Slider
                    value={[brightness]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([value]) => setBrightness(value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contrast</label>
                  <Slider
                    value={[contrast]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([value]) => setContrast(value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saturation</label>
                  <Slider
                    value={[saturation]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([value]) => setSaturation(value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-medium">File Information</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Name</dt>
                        <dd>{fileName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Type</dt>
                        <dd>{mimeType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Size</dt>
                        <dd>{formatFileSize(fileSize)}</dd>
                      </div>
                      {exifData?.width && exifData?.height && (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Dimensions</dt>
                          <dd>{exifData.width} × {exifData.height}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {exifData && (
                    <div>
                      <h3 className="mb-2 font-medium">Camera Information</h3>
                      <dl className="space-y-1 text-sm">
                        {exifData.make && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Make</dt>
                            <dd>{exifData.make}</dd>
                          </div>
                        )}
                        {exifData.model && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Model</dt>
                            <dd>{exifData.model}</dd>
                          </div>
                        )}
                        {exifData.software && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Software</dt>
                            <dd>{exifData.software}</dd>
                          </div>
                        )}
                        {exifData.dateTime && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Date Taken</dt>
                            <dd>{new Date(exifData.dateTime).toLocaleString()}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {exifData?.exposureTime && (
                    <div>
                      <h3 className="mb-2 font-medium">Camera Settings</h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Exposure</dt>
                          <dd>{exifData.exposureTime}s</dd>
                        </div>
                        {exifData.fNumber && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">F-Number</dt>
                            <dd>f/{exifData.fNumber}</dd>
                          </div>
                        )}
                        {exifData.iso && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">ISO</dt>
                            <dd>{exifData.iso}</dd>
                          </div>
                        )}
                        {exifData.focalLength && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Focal Length</dt>
                            <dd>{exifData.focalLength}mm</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {(exifData?.gpsLatitude || exifData?.gpsLongitude) && (
                    <div>
                      <h3 className="mb-2 font-medium">Location</h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Coordinates</dt>
                          <dd>
                            {exifData.gpsLatitude}, {exifData.gpsLongitude}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
