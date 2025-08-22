'use client';

import { useState, useEffect } from 'react';
import { Folder, FolderWithChildren } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderTreeProps {
  folders: FolderWithChildren[];
  currentFolderId: string | null;
  onFolderClick: (folderId: string | null) => void;
}

interface TreeNodeProps {
  folder: FolderWithChildren;
  level: number;
  currentFolderId: string | null;
  onFolderClick: (folderId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ folder, level, currentFolderId, onFolderClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = currentFolderId === folder.id;

  const handleClick = () => {
    onFolderClick(folder.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent transition-colors',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        onClick={handleClick}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}
        
        <FolderIcon className="h-4 w-4 text-blue-500" />
        <span className="text-sm truncate flex-1">{folder.name}</span>
        
        {folder.file_count !== undefined && folder.file_count > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {folder.file_count}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4">
          {folder.children!.map((child) => (
            <TreeNode
              key={child.id}
              folder={child}
              level={level + 1}
              currentFolderId={currentFolderId}
              onFolderClick={onFolderClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FolderTree({ folders, currentFolderId, onFolderClick }: FolderTreeProps) {
  const rootFolders = folders.filter(folder => !folder.parent_id);

  return (
    <div className="space-y-1">
      {/* Root folder */}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors',
          currentFolderId === null && 'bg-accent text-accent-foreground'
        )}
        onClick={() => onFolderClick(null)}
      >
        <FolderIcon className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">My Drive</span>
      </div>

      {/* Folder tree */}
      {rootFolders.map((folder) => (
        <TreeNode
          key={folder.id}
          folder={folder}
          level={0}
          currentFolderId={currentFolderId}
          onFolderClick={onFolderClick}
        />
      ))}

      {rootFolders.length === 0 && (
        <div className="px-2 py-2 text-sm text-muted-foreground">
          No folders yet
        </div>
      )}
    </div>
  );
}
