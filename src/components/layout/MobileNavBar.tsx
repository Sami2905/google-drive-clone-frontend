'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Upload,
  FolderPlus,
  Share2,
  Trash2,
  Settings,
  Plus,
  X
} from 'lucide-react';

interface MobileNavBarProps {
  onSearch?: (query: string) => void;
  onUpload?: () => void;
  onNewFolder?: () => void;
}

export default function MobileNavBar({
  onSearch,
  onUpload,
  onNewFolder
}: MobileNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchSheet, setSearchSheet] = React.useState(false);
  const [createSheet, setCreateSheet] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    onSearch?.(searchQuery);
    setSearchSheet(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg md:hidden">
        <div className="grid h-16 grid-cols-5 items-center">
          <Button
            variant="ghost"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-none',
              isActive('/dashboard') && 'text-primary'
            )}
            onClick={() => router.push('/dashboard')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 rounded-none"
            onClick={() => setSearchSheet(true)}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 rounded-none"
            onClick={() => setCreateSheet(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Create</span>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-none',
              isActive('/shared') && 'text-primary'
            )}
            onClick={() => router.push('/shared')}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Shared</span>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-none',
              isActive('/settings') && 'text-primary'
            )}
            onClick={() => router.push('/settings')}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>

      {/* Search Sheet */}
      <Sheet open={searchSheet} onOpenChange={setSearchSheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick Filters</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onSearch?.('type:image')}>
                  Images
                </Button>
                <Button variant="outline" size="sm" onClick={() => onSearch?.('type:document')}>
                  Documents
                </Button>
                <Button variant="outline" size="sm" onClick={() => onSearch?.('is:shared')}>
                  Shared
                </Button>
                <Button variant="outline" size="sm" onClick={() => onSearch?.('is:starred')}>
                  Starred
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Sheet */}
      <Sheet open={createSheet} onOpenChange={setCreateSheet}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>Create</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full py-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onUpload?.();
                  setCreateSheet(false);
                }}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Files
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onNewFolder?.();
                  setCreateSheet(false);
                }}
              >
                <FolderPlus className="mr-2 h-5 w-5" />
                New Folder
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
