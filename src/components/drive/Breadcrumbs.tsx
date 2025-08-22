'use client';

import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onItemClick: (folderId: string) => void;
}

export default function Breadcrumbs({ items, onItemClick }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground mx-2" />
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-auto p-1 text-sm font-normal hover:bg-accent',
              index === items.length - 1 && 'text-foreground font-medium'
            )}
            onClick={() => onItemClick(item.id)}
          >
            {index === 0 ? (
              <HomeIcon className="h-4 w-4 mr-1" />
            ) : null}
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}


