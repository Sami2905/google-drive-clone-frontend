'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchParams } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (params: SearchParams) => void;
  currentFolderId?: string | null;
}

export default function SearchDialog({ open, onOpenChange, onSearch, currentFolderId }: SearchDialogProps) {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState<'all' | 'file' | 'folder'>('all');
  const [includeSubfolders, setIncludeSubfolders] = React.useState(true);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [sizeMin, setSizeMin] = React.useState('');
  const [sizeMax, setSizeMax] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'size' | 'created_at' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isShared, setIsShared] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      type,
      folder_id: currentFolderId || undefined,
      include_subfolders: includeSubfolders,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      size_min: sizeMin ? parseInt(sizeMin) * 1024 * 1024 : undefined, // Convert MB to bytes
      size_max: sizeMax ? parseInt(sizeMax) * 1024 * 1024 : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      is_shared: isShared || undefined
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setQuery('');
    setType('all');
    setIncludeSubfolders(true);
    setDateFrom('');
    setDateTo('');
    setSizeMin('');
    setSizeMax('');
    setSortBy('name');
    setSortOrder('asc');
    setIsShared(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search for files and folders with advanced filters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search terms..."
              autoFocus
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value: 'all' | 'file' | 'folder') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="file">Files Only</SelectItem>
                <SelectItem value="folder">Folders Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Subfolders */}
          <div className="flex items-center justify-between">
            <Label htmlFor="subfolders">Include Subfolders</Label>
            <Switch
              id="subfolders"
              checked={includeSubfolders}
              onCheckedChange={setIncludeSubfolders}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Size Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sizeMin">Min Size (MB)</Label>
              <Input
                id="sizeMin"
                type="number"
                min="0"
                value={sizeMin}
                onChange={(e) => setSizeMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizeMax">Max Size (MB)</Label>
              <Input
                id="sizeMax"
                type="number"
                min="0"
                value={sizeMax}
                onChange={(e) => setSizeMax(e.target.value)}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Modified Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={(value: typeof sortOrder) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shared Filter */}
          <div className="flex items-center justify-between">
            <Label htmlFor="shared">Only Shared Items</Label>
            <Switch
              id="shared"
              checked={isShared}
              onCheckedChange={setIsShared}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">
              Search
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
