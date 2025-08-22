'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileGridItem } from '@/types';
import { apiClient } from '@/lib/api-client';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  FileIcon,
  FolderIcon,
  Download,
  Link2,
  History,
  Clock,
  Users,
  Info,
  Pencil,
  Trash2,
  Share2,
  Copy,
  MoveRight,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Version {
  id: string;
  created_at: string;
  created_by: string;
  size: number;
  comment?: string;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface DetailsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileGridItem | null;
  onRename: (name: string) => Promise<void>;
  onShare: () => void;
  onMove: () => void;
  onDownload: () => void;
  onPreview?: () => void;
  onDelete: () => void;
}

export default function DetailsPanel({
  open,
  onOpenChange,
  item,
  onRename,
  onShare,
  onMove,
  onDownload,
  onPreview,
  onDelete
}: DetailsPanelProps) {
  const [name, setName] = React.useState('');
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Reset name when item changes
  React.useEffect(() => {
    setName(item?.name || '');
  }, [item?.name]);

  // Load versions and activities
  React.useEffect(() => {
    if (!open || !item) return;
    loadVersions();
    loadActivities();
  }, [open, item]);

  const loadVersions = async () => {
    if (!item || item.type !== 'file') return;
    // TODO: Implement when backend supports file versioning
    setVersions([]);
  };

  const loadActivities = async () => {
    if (!item) return;
    // TODO: Implement when backend supports activity tracking
    setActivities([]);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!item || item.type !== 'file') return;
    // TODO: Implement when backend supports file versioning
    toast.error('File versioning not yet supported');
  };

  const handleDownloadVersion = async (versionId: string) => {
    if (!item || item.type !== 'file') return;
    // TODO: Implement when backend supports file versioning
    toast.error('File versioning not yet supported');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <FileIcon className="h-4 w-4" />;
      case 'update':
        return <Pencil className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      case 'move':
        return <MoveRight className="h-4 w-4" />;
      case 'restore':
        return <History className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>View and manage item details</SheetDescription>
        </SheetHeader>

        {!item ? (
          <div className="flex h-[80vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">Select an item to view details</p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-6 flex items-start gap-4">
              {item.type === 'folder' ? (
                <FolderIcon className="h-16 w-16 text-blue-500" />
              ) : (
                <FileIcon className="h-16 w-16 text-gray-500" />
              )}
              <div className="flex-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Button
                      onClick={() => onRename(name)}
                      disabled={!name || name === item.name}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                {item.type === 'file' && (
                  <TabsTrigger value="versions" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Versions
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {item.type === 'file' && onPreview && (
                    <Button variant="outline" onClick={onPreview}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  )}
                  <Button variant="outline" onClick={onShare}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={onMove}>
                    <MoveRight className="mr-2 h-4 w-4" />
                    Move
                  </Button>
                  {item.type === 'file' && (
                    <Button variant="outline" onClick={onDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>

                <Separator />

                {/* Properties */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Properties</h4>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="text-sm font-medium">
                        {item.type === 'file' ? item.mime_type || 'Unknown' : 'Folder'}
                      </span>
                    </div>
                    {item.type === 'file' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Size</span>
                        <span className="text-sm font-medium">
                          {formatFileSize(item.size || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Modified</span>
                      <span className="text-sm font-medium">
                        {formatDate(item.updated_at)}
                      </span>
                    </div>
                    {item.is_shared && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharing</span>
                        <Badge variant="secondary">
                          <Users className="mr-1 h-3 w-3" />
                          Shared
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div className="mt-1 text-muted-foreground">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>{' '}
                            {activity.type === 'create' && 'created this item'}
                            {activity.type === 'update' && 'modified this item'}
                            {activity.type === 'delete' && 'deleted this item'}
                            {activity.type === 'share' && 'shared this item'}
                            {activity.type === 'move' && 'moved this item'}
                            {activity.type === 'restore' && 'restored this item'}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground">
                              {activity.details}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {activities.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">No activity yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {item.type === 'file' && (
                <TabsContent value="versions" className="mt-4">
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                Version from {formatDate(version.created_at)}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadVersion(version.id)}
                                  disabled={loading}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestoreVersion(version.id)}
                                  disabled={loading}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              By {version.created_by} • {formatFileSize(version.size)}
                            </p>
                            {version.comment && (
                              <p className="text-sm text-muted-foreground">
                                {version.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {versions.length === 0 && (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">No versions yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
